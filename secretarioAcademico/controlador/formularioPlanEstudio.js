import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_planEstudio } from "../utilidades/u_planEstudio.js";
import { u_formularioPlanEstudio } from "../utilidades/u_formularioPlanEstudio.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_planEstudio, m_curso, m_semestre, m_PlanSemestreAsignatura, m_prerequisito } from "../modelo/m_planEstudio.js";
import { sesiones } from "../../public/core/sesiones.js";
import { m_asignatura, m_carrera } from "../../admin/modelo/m_academico.js";

export class c_formularioPlanEstudio {
    
    /**
     * VARIABLES DE ESTADO
     */
    static modo = 'crear'; // crear, editar, visualizar
    static idPlan = null;
    static idFacultad = null;
    
    static planActual = null;
    static carreras = [];
    static cursos = [];
    static semestresDisponibles = [];
    static asignaturasDisponibles = [];
    
    // Semestres del plan actual (con asignaturas)
    static semestresPlan = [];
    
    // Controladores de combos
    static comboCursosControl = null;
    static comboAsignaturasControl = null;
    static combosPrerrequisitos = [];
    
    // ID temporal para nuevos semestres
    static tempIdCounter = 0;
    
    // Almacenar asignaturas y sus prerrequisitos para guardar
    static asignaturasPendientesGuardar = [];

    /**
     * INICIALIZACIÓN
     */
    static async iniciar() {
        // Obtener parámetros de URL
        const params = u_formularioPlanEstudio.obtenerParametrosURL();
        this.modo = params.modo;
        this.idPlan = params.id;
        
        // Obtener facultad del usuario
        const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo') || '{}');
        this.idFacultad = usuarioActivo.idFacultad;
        
        if (!this.idFacultad) {
            Alerta.error('Error', 'No se pudo determinar la facultad del usuario');
            return;
        }

        // Configurar interfaz según modo
        u_formularioPlanEstudio.configurarInterfazPorModo(this.modo);

        // Cargar datos iniciales
        await this.cargarDatosIniciales();
        
        // Si hay ID, cargar datos del plan
        if (this.idPlan && this.modo !== 'crear') {
            await this.cargarPlan();
        }

        // Inicializar eventos
        this.inicializarEventos();
        this.inicializarValidaciones();
    }

    /**
     * Carga los datos iniciales
     */
    static async cargarDatosIniciales() {
        try {
            await Promise.all([
                this.cargarCarreras(),
                this.cargarCursos(),
                this.cargarSemestres(),
                this.cargarAsignaturas()
            ]);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos iniciales');
        }
    }

    /**
     * Carga las carreras de la facultad
     */
    static async cargarCarreras() {
        try {
            const response = await m_carrera.obtenerCarreraPorFacultad(this.idFacultad);
            this.carreras = response.carreras || response || [];
            this.cargarSelectCarreras();
        } catch (error) {
            console.error('Error cargando carreras:', error);
        }
    }

    /**
     * Carga los cursos disponibles
     */
    static async cargarCursos() {
        try {
            this.cursos = await m_curso.obtenerCursos();
            this.inicializarComboCursos();
        } catch (error) {
            console.error('Error cargando cursos:', error);
        }
    }

    /**
     * Carga los semestres disponibles
     */
    static async cargarSemestres() {
        try {
            this.semestresDisponibles = await m_semestre.obtenerSemestres();
        } catch (error) {
            console.error('Error cargando semestres:', error);
        }
    }

    /**
     * Carga las asignaturas de la facultad
     */
    static async cargarAsignaturas() {
        try {
            const response = await m_asignatura.obtenerAsignaturasPorFacultad(this.idFacultad);
            this.asignaturasDisponibles = response.asignaturas || response || [];
        } catch (error) {
            console.error('Error cargando asignaturas:', error);
        }
    }

    /**
     * Carga los datos del plan para edición/visualización
     */
    static async cargarPlan() {
        try {
            // Obtener plan
            const planes = await m_planEstudio.obtenerPlanesEstudiosPorFacultad(this.idFacultad);
            this.planActual = planes.find(p => p.idPlanEstudio == this.idPlan);
            
            if (!this.planActual) {
                Alerta.error('Error', 'No se encontró el plan de estudio');
                return;
            }

            // Cargar semestres del plan con sus asignaturas
            await this.cargarSemestresDelPlan();

            // Rellenar formulario
            this.rellenarFormulario();

            // Si es visualización, mostrar vista
            if (this.modo === 'visualizar') {
                const carrera = this.carreras.find(c => c.idCarrera == this.planActual.idCarrera);
                u_formularioPlanEstudio.renderizarVistaVisualizacion(
                    { ...this.planActual, nombreCarrera: carrera?.nombreCarrera, idPlanEstudio: this.planActual.idPlanEstudio },
                    this.semestresPlan,
                    this.asignaturasDisponibles
                );
            } else {
                // Renderizar semestres en el DOM
                this.renderizarSemestres();
            }
        } catch (error) {
            console.error('Error cargando plan:', error);
            Alerta.error('Error', 'No se pudo cargar el plan de estudio');
        }
    }

    /**
     * Carga los semestres del plan con sus asignaturas
     */
    static async cargarSemestresDelPlan() {
        try {
            // Obtener todas las relaciones plan-semestre-asignatura
            const relaciones = await m_PlanSemestreAsignatura.obtenerPlanSemestreAsignaturas();
            const relacionesDelPlan = relaciones.filter(r => r.idPlanEstudio == this.idPlan);

            // Obtener todos los prerrequisitos
            const todosPrerrequisitos = await m_prerequisito.obtenerPrerequisito();

            // Agrupar por semestre
            const semestresMap = new Map();

            for (const rel of relacionesDelPlan) {
                const semestre = this.semestresDisponibles.find(s => s.idSemestre == rel.idSemestre);
                if (!semestre) continue;

                const asignatura = this.asignaturasDisponibles.find(a => a.idAsignatura == rel.idAsignatura);
                if (!asignatura) continue;

                // Buscar prerrequisitos de esta asignatura
                const prerrequisitos = todosPrerrequisitos
                    .filter(p => p.idAsignatura == rel.idAsignatura)
                    .map(p => {
                        const asigReq = this.asignaturasDisponibles.find(a => a.idAsignatura == p.idAsignaturaRequerida);
                        return asigReq?.nombreAsignatura || 'ID: ' + p.idAsignaturaRequerida;
                    });

                if (!semestresMap.has(rel.idSemestre)) {
                    semestresMap.set(rel.idSemestre, {
                        idSemestre: semestre.idSemestre,
                        numeroSemestre: semestre.numeroSemestre,
                        nombreCurso: this.obtenerNombreCursoPorSemestre(semestre),
                        asignaturas: []
                    });
                }

                semestresMap.get(rel.idSemestre).asignaturas.push({
                    idPlanSemestreAsignatura: rel.idPlanSemestreAsignatura,
                    idAsignatura: rel.idAsignatura,
                    nombreAsignatura: asignatura.nombreAsignatura,
                    creditos: rel.creditos,
                    modalidad: rel.modalidad,
                    prerrequisitos
                });
            }

            // Ordenar semestres por número
            this.semestresPlan = Array.from(semestresMap.values())
                .sort((a, b) => a.numeroSemestre - b.numeroSemestre);

        } catch (error) {
            console.error('Error cargando semestres del plan:', error);
        }
    }

    /**
     * Obtiene el nombre del curso asociado a un semestre
     */
    static obtenerNombreCursoPorSemestre(semestre) {
        // const nombres = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'];
        const nombres = [];
        return nombres[semestre.numeroSemestre - 1] || `Semestre ${semestre.numeroSemestre}`;
    }

    /**
     * Rellena el formulario con los datos del plan
     */
    static rellenarFormulario() {
        if (!this.planActual) return;

        document.getElementById('nombrePlanEstudio').value = this.planActual.nombre || '';
        document.getElementById('fechaElaboracionPlanEstudio').value = this.planActual.fechaElaboracion || '';
        document.getElementById('periodoPlanEstudio').value = this.planActual.periodoPlanEstudio || '';
        document.getElementById('vigentePlanEstudio').value = this.planActual.vigente || '';
        document.getElementById('carrerasPlanEstudio').value = this.planActual.idCarrera || '';
    }

    /**
     * Renderiza los semestres en el DOM
     */
    static renderizarSemestres() {
        const container = document.getElementById('semestres-container');
        if (!container) return;

        const puedeEditar = this.modo !== 'visualizar' && u_planEstudio.verificarPermiso('actualizar');

        let html = '';
        this.semestresPlan.forEach(semestre => {
            html += u_formularioPlanEstudio.crearSemestreHTML(
                semestre,
                puedeEditar,
                () => this.editarSemestre(semestre),
                () => this.eliminarSemestre(semestre),
                () => {}
            );
        });

        container.innerHTML = html;

        // Agregar eventos a los botones de eliminar asignatura
        if (puedeEditar) {
            document.querySelectorAll('.eliminar-asignatura').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const semestreCard = btn.closest('.semestre-horizontal');
                    const semestreId = semestreCard?.dataset.id;
                    const asignaturaId = btn.dataset.asignaturaId;
                    if (semestreId && asignaturaId) {
                        this.eliminarAsignatura(semestreId, asignaturaId);
                    }
                });
            });
        }

        // Actualizar estadísticas
        u_formularioPlanEstudio.actualizarEstadisticas(this.semestresPlan);
        u_formularioPlanEstudio.actualizarMallaCurricular(this.semestresPlan, this.asignaturasDisponibles);
    }

    /**
     * Elimina una asignatura de un semestre
     */
    static eliminarAsignatura(semestreId, asignaturaId) {
        const semestre = this.semestresPlan.find(s => s.idSemestre == semestreId || s.tempId == semestreId);
        if (semestre) {
            semestre.asignaturas = semestre.asignaturas.filter(a => a.idAsignatura != asignaturaId);
            this.renderizarSemestres();
            Alerta.notificarExito('Asignatura eliminada', 1500);
        }
    }

    /**
     * Carga el select de carreras
     */
    static cargarSelectCarreras() {
        const select = document.getElementById('carrerasPlanEstudio');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccione...</option>' +
            this.carreras.map(c => `<option value="${c.idCarrera}">${c.nombreCarrera}</option>`).join('');
    }

    /**
     * Inicializa el combo de cursos
     */
    static inicializarComboCursos() {
        this.comboCursosControl = u_planEstudio.inicializarComboCursosConAgregar(
            'comboCursoSemestre',
            'opcionesCursoSemestre',
            this.cursos,
            (id, nombre) => {
                console.log('Curso seleccionado:', id, nombre);
            },
            async (nuevoNombre) => {
                await this.agregarNuevoCurso(nuevoNombre);
            }
        );
    }

    /**
     * Agrega un nuevo curso
     * @param {string} nombre - Nombre del nuevo curso
     */
    static async agregarNuevoCurso(nombre) {
        if (!nombre || nombre.trim().length < 3) {
            Alerta.notificarAdvertencia('El nombre del curso debe tener al menos 3 caracteres', 2000);
            return;
        }

        try {
            const nuevoCurso = await m_curso.insertarCurso({ nombreCurso: nombre.trim() });
            
            // Recargar cursos
            await this.cargarCursos();
            
            // Seleccionar el nuevo curso en el combo
            if (this.comboCursosControl) {
                this.comboCursosControl.setSelected(nuevoCurso.idCurso, nuevoCurso.nombreCurso);
            }
            
            Alerta.notificarExito('Curso agregado correctamente', 1500);
        } catch (error) {
            console.error('Error agregando curso:', error);
            Alerta.error('Error', 'No se pudo agregar el curso');
        }
    }

    /**
     * Inicializa las validaciones en tiempo real
     */
    static inicializarValidaciones() {
        // Validación nombre plan
        document.getElementById('nombrePlanEstudio')?.addEventListener('input', (e) => {
            const valido = u_planEstudio.validarNombrePlan(e.target.value);
            u_utiles.colorearCampo(valido, '#nombrePlanEstudio', '#errorNombrePlanEstudio',
                valido ? '' : 'El nombre debe tener entre 5 y 100 caracteres');
        });

        // Validación fecha
        document.getElementById('fechaElaboracionPlanEstudio')?.addEventListener('change', (e) => {
            const valido = u_planEstudio.validarFechaElaboracion(e.target.value);
            u_utiles.colorearCampo(valido, '#fechaElaboracionPlanEstudio', '#errorFechaElaboracionPlanEstudio',
                valido ? '' : 'Fecha inválida (no puede ser futura)');
        });

        // Validación período
        document.getElementById('periodoPlanEstudio')?.addEventListener('input', (e) => {
            const valido = u_planEstudio.validarPeriodo(e.target.value);
            u_utiles.colorearCampo(valido, '#periodoPlanEstudio', '#errorPeriodoPlanEstudio',
                valido ? '' : 'Formato: 2024-2028 (4-5 años)');
        });

        // Validación vigente
        document.getElementById('vigentePlanEstudio')?.addEventListener('change', (e) => {
            const valido = u_planEstudio.validarVigente(e.target.value);
            u_utiles.colorearCampo(valido, '#vigentePlanEstudio', '#errorVigentePlanEstudio',
                valido ? '' : 'Seleccione una opción');
        });

        // Validación carrera
        document.getElementById('carrerasPlanEstudio')?.addEventListener('change', (e) => {
            const valido = u_planEstudio.validarCarreraSeleccionada(e.target.value);
            u_utiles.colorearCampo(valido, '#carrerasPlanEstudio', '#errorCarrerasPlanEstudio',
                valido ? '' : 'Seleccione una carrera');
        });

        // Validación curso semestre
        document.getElementById('comboCursoSemestre')?.addEventListener('input', (e) => {
            const valido = u_planEstudio.validarNombreCurso(e.target.value);
            u_utiles.colorearCampo(valido, '#comboCursoSemestre', '#errorCursoSemestre',
                valido ? '' : 'Ingrese un nombre de curso');
        });

        // Validación número semestre
        document.getElementById('numeroSemestre')?.addEventListener('input', (e) => {
            const valido = u_planEstudio.validarNumeroSemestre(e.target.value);
            u_utiles.colorearCampo(valido, '#numeroSemestre', '#errorNumeroSemestre',
                valido ? '' : 'Número de semestre inválido');
        });
    }

    /**
     * Inicializa los eventos del formulario
     */
    static inicializarEventos() {
        // Botón guardar semestre
        document.getElementById('btnGuardarSemestre')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.guardarSemestre();
        });

        // Botón guardar plan
        document.getElementById('btnGuardarPlanEstudio')?.addEventListener('click', () => this.guardarPlan());

        // Botón cancelar
        document.getElementById('btnCancelar')?.addEventListener('click', () => {
            window.history.back();
        });

        // Botón editar plan (desde visualización)
        const btnEditarPlan = document.getElementById('btnEditarPlan');
        if (btnEditarPlan) {
            btnEditarPlan.addEventListener('click', () => {
                window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=editar&id=${this.idPlan}`;
            });
        }

        // Eventos del modal de asignatura
        this.inicializarEventosModalAsignatura();

        // Evento para agregar prerrequisito
        document.getElementById('btnAñadirPrerrequisito')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.agregarCampoPrerrequisito();
        });

        // Evento para guardar asignatura
        document.getElementById('btnGuardarAsignatura')?.addEventListener('click', () => this.guardarAsignatura());
    }

    /**
     * Inicializa eventos del modal de asignatura
     */
    static inicializarEventosModalAsignatura() {
        // Cuando se abre el modal
        $('#modalNuevaAsignatura').on('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const semestreId = button?.getAttribute('data-semestre-id');
            const semestreNumero = button?.getAttribute('data-semestre-numero');
            
            // Guardar el semestre actual en el modal
            const modal = document.getElementById('modalNuevaAsignatura');
            if (modal) {
                modal.dataset.semestreId = semestreId;
                modal.dataset.semestreNumero = semestreNumero;
            }
            
            // Limpiar campos
            const comboAsignaturas = document.getElementById('comboAsignaturasSemestre');
            if (comboAsignaturas) comboAsignaturas.value = '';
            const creditos = document.getElementById('creditosSemestre');
            if (creditos) creditos.value = '';
            const modalidad = document.getElementById('modalidadSemestre');
            if (modalidad) modalidad.value = '';
            
            // Limpiar prerrequisitos
            const contPrerrequisitos = document.getElementById('contPrerrequisitos');
            if (contPrerrequisitos) contPrerrequisitos.innerHTML = '';
            this.combosPrerrequisitos = [];
            
            // Inicializar combo de asignaturas
            this.inicializarComboAsignaturasModal();
        });
    }

    /**
     * Inicializa combo de asignaturas en el modal
     */
    static inicializarComboAsignaturasModal() {
        this.comboAsignaturasControl = u_planEstudio.inicializarComboAsignaturas(
            'comboAsignaturasSemestre',
            'opcionesAsignaturasSemestre',
            this.asignaturasDisponibles,
            (id, nombre) => {
                // Al seleccionar una asignatura, limpiar prerrequisitos
                const contPrerrequisitos = document.getElementById('contPrerrequisitos');
                if (contPrerrequisitos) contPrerrequisitos.innerHTML = '';
                this.combosPrerrequisitos = [];
            }
        );
    }

    /**
     * Agrega un campo de prerrequisito en el modal
     */
    static agregarCampoPrerrequisito() {
        const idAsignatura = this.comboAsignaturasControl?.getSelectedId();
        
        if (!idAsignatura) {
            Alerta.notificarAdvertencia('Primero seleccione una asignatura', 1500);
            return;
        }

        const combo = u_planEstudio.agregarCampoPrerrequisito(
            'contPrerrequisitos',
            this.asignaturasDisponibles,
            idAsignatura,
            (id, nombre) => {
                console.log('Prerrequisito seleccionado:', id, nombre);
            }
        );

        if (combo) {
            this.combosPrerrequisitos.push(combo);
        }
    }

    /**
     * Guarda un semestre (guarda curso y semestre en BD)
     */
    static async guardarSemestre() {
        const nombreCurso = document.getElementById('comboCursoSemestre').value;
        const numeroSemestre = document.getElementById('numeroSemestre').value;

        // Validaciones
        const validaciones = {
            nombre: u_planEstudio.validarNombreCurso(nombreCurso),
            numero: u_planEstudio.validarNumeroSemestre(numeroSemestre)
        };

        u_utiles.colorearCampo(validaciones.nombre, '#comboCursoSemestre', '#errorCursoSemestre',
            validaciones.nombre ? '' : 'Nombre de curso inválido');
        u_utiles.colorearCampo(validaciones.numero, '#numeroSemestre', '#errorNumeroSemestre',
            validaciones.numero ? '' : 'Número de semestre inválido');

        if (!Object.values(validaciones).every(v => v === true)) {
            return;
        }

        try {
            // 1. GUARDAR CURSO
            let cursoExistente = this.cursos.find(c => c.nombreCurso.toLowerCase() === nombreCurso.toLowerCase());
            let idCurso = null;

            if (!cursoExistente) {
                // Crear nuevo curso
                const nuevoCurso = await m_curso.insertarCurso({ nombreCurso: nombreCurso.trim() });
                idCurso = nuevoCurso.idCurso;
                // Agregar a la lista local de cursos
                this.cursos.push(nuevoCurso);
                // Actualizar combo de cursos
                this.inicializarComboCursos();
            } else {
                idCurso = cursoExistente.idCurso;
            }

            // 2. GUARDAR SEMESTRE
            let semestreExistente = this.semestresDisponibles.find(s => s.numeroSemestre == numeroSemestre);
            let idSemestre = null;

            if (!semestreExistente) {
                // determinar si es par o impar
                let tipoSemestre = '';
                if (parseInt(numeroSemestre)%2==0) tipoSemestre = 'par';
                else tipoSemestre = 'impar';

                // Crear nuevo semestre
                const nuevoSemestre = await m_semestre.insertarSemestre({ numeroSemestre: parseInt(numeroSemestre), tipoSemestre: tipoSemestre, idCurso: idCurso }); console.log(nuevoSemestre)
                idSemestre = nuevoSemestre.id;
                this.semestresDisponibles.push(nuevoSemestre);
            } else {
                idSemestre = semestreExistente.idSemestre;
            }

            // 3. VERIFICAR QUE NO EXISTA DUPLICADO EN EL PLAN ACTUAL
            const semestreExistenteEnPlan = this.semestresPlan.find(s => s.numeroSemestre == numeroSemestre);
            if (semestreExistenteEnPlan) {
                Alerta.notificarAdvertencia('Ya existe un semestre con ese número en este plan', 2000);
                return;
            }

            // 4. AGREGAR SEMESTRE AL PLAN CON SU CURSO ASOCIADO
            this.semestresPlan.push({
                idSemestre: idSemestre,
                numeroSemestre: parseInt(numeroSemestre),
                nombreCurso: nombreCurso,
                idCurso: idCurso, // Guardar también el ID del curso
                asignaturas: []
            });

            // Ordenar semestres
            this.semestresPlan.sort((a, b) => a.numeroSemestre - b.numeroSemestre);

            // Renderizar
            this.renderizarSemestres();

            // Limpiar campos
            document.getElementById('comboCursoSemestre').value = '';
            document.getElementById('numeroSemestre').value = '';
            
            if (this.comboCursosControl) {
                this.comboCursosControl.setSelected(null, '');
            }

            Alerta.notificarExito('Semestre agregado correctamente', 1500);

        } catch (error) {
            console.error('Error guardando semestre:', error);
            Alerta.error('Error', 'No se pudo guardar el semestre');
        }
    }

    /**
     * Elimina un semestre del plan
     */
    static async eliminarSemestre(semestre) {
        const confirmacion = await Alerta.pregunta(
            '¿Eliminar semestre?',
            'Se eliminarán también todas sus asignaturas'
        );

        if (!confirmacion) return;

        this.semestresPlan = this.semestresPlan.filter(s => s.idSemestre != semestre.idSemestre);
        
        this.renderizarSemestres();
        Alerta.notificarExito('Semestre eliminado', 1500);
    }

    /**
     * Edita un semestre
     */
    static editarSemestre(semestre) {
        Alerta.informacion('Editar semestre', 'Funcionalidad próximamente');
    }

    /**
     * Guarda una asignatura en el semestre actual
     */
    static async guardarAsignatura() {
        const modal = document.getElementById('modalNuevaAsignatura');
        const semestreId = modal?.dataset.semestreId;
        const nombreAsignatura = document.getElementById('comboAsignaturasSemestre').value;
        const creditos = document.getElementById('creditosSemestre').value;
        const modalidad = document.getElementById('modalidadSemestre').value;

        // Validaciones
        const validaciones = {
            asignatura: u_planEstudio.validarAsignaturaSeleccionada(nombreAsignatura),
            creditos: u_planEstudio.validarCreditos(creditos),
            modalidad: u_planEstudio.validarModalidad(modalidad)
        };

        u_utiles.colorearCampo(validaciones.asignatura, '#comboAsignaturasSemestre', '#errorAsignaturasSemestre',
            validaciones.asignatura ? '' : 'Seleccione una asignatura');
        u_utiles.colorearCampo(validaciones.creditos, '#creditosSemestre', '#errorCreditosSemestre',
            validaciones.creditos ? '' : 'Créditos inválidos (1-12)');
        u_utiles.colorearCampo(validaciones.modalidad, '#modalidadSemestre', '#errorModalidadSemestre',
            validaciones.modalidad ? '' : 'Seleccione una modalidad');

        if (!Object.values(validaciones).every(v => v === true)) {
            return;
        }

        // Buscar la asignatura seleccionada
        const asignatura = this.asignaturasDisponibles.find(a => a.nombreAsignatura === nombreAsignatura);
        
        if (!asignatura) {
            Alerta.error('Error', 'No se encontró la asignatura seleccionada');
            return;
        }

        // Obtener prerrequisitos seleccionados
        const prerrequisitosIds = this.combosPrerrequisitos
            .map(combo => combo.getSelectedId())
            .filter(id => id != null && id !== "");

        // Validar que los prerrequisitos seleccionados sean válidos
        for (const id of prerrequisitosIds) {
            if (!u_planEstudio.validarPrerrequisitoSeleccionado(id)) {
                Alerta.notificarAdvertencia('Seleccione un prerrequisito válido', 1500);
                return;
            }
        }

        // Encontrar el semestre
        const semestre = this.semestresPlan.find(s => s.idSemestre == semestreId);
        
        if (!semestre) {
            Alerta.error('Error', 'No se encontró el semestre');
            return;
        }

        // Verificar que la asignatura no esté ya en el semestre
        const asignaturaExistente = semestre.asignaturas.find(a => a.idAsignatura == asignatura.idAsignatura);
        if (asignaturaExistente) {
            Alerta.notificarAdvertencia('Esta asignatura ya está agregada en este semestre', 2000);
            return;
        }

        // Buscar nombres de prerrequisitos
        const prerrequisitosNombres = [];
        prerrequisitosIds.forEach(id => {
            const asigReq = this.asignaturasDisponibles.find(a => a.idAsignatura == id);
            if (asigReq) {
                prerrequisitosNombres.push(asigReq.nombreAsignatura);
            }
        });

        // Crear objeto de asignatura para el semestre
        const nuevaAsignatura = {
            idAsignatura: asignatura.idAsignatura,
            nombreAsignatura: asignatura.nombreAsignatura,
            creditos: parseInt(creditos),
            modalidad,
            prerrequisitos: prerrequisitosNombres,
            prerrequisitosIds: prerrequisitosIds // Guardar IDs para luego insertar en BD
        };

        // Agregar al semestre
        semestre.asignaturas.push(nuevaAsignatura);

        // Actualizar UI
        this.renderizarSemestres();

        // Cerrar modal
        $('#modalNuevaAsignatura').modal('hide');

        Alerta.notificarExito('Asignatura agregada correctamente', 1500);
    }

    static async guardarPlan() {
        // Validar datos generales
        const nombre = document.getElementById('nombrePlanEstudio').value;
        const fecha = document.getElementById('fechaElaboracionPlanEstudio').value;
        const periodo = document.getElementById('periodoPlanEstudio').value;
        const vigente = document.getElementById('vigentePlanEstudio').value;
        const idCarrera = document.getElementById('carrerasPlanEstudio').value;

        const validaciones = {
            nombre: u_planEstudio.validarNombrePlan(nombre),
            fecha: u_planEstudio.validarFechaElaboracion(fecha),
            periodo: u_planEstudio.validarPeriodo(periodo),
            vigente: u_planEstudio.validarVigente(vigente),
            carrera: u_planEstudio.validarCarreraSeleccionada(idCarrera)
        };

        u_utiles.colorearCampo(validaciones.nombre, '#nombrePlanEstudio', '#errorNombrePlanEstudio',
            validaciones.nombre ? '' : 'Nombre inválido');
        u_utiles.colorearCampo(validaciones.fecha, '#fechaElaboracionPlanEstudio', '#errorFechaElaboracionPlanEstudio',
            validaciones.fecha ? '' : 'Fecha inválida');
        u_utiles.colorearCampo(validaciones.periodo, '#periodoPlanEstudio', '#errorPeriodoPlanEstudio',
            validaciones.periodo ? '' : 'Período inválido');
        u_utiles.colorearCampo(validaciones.vigente, '#vigentePlanEstudio', '#errorVigentePlanEstudio',
            validaciones.vigente ? '' : 'Seleccione vigencia');
        u_utiles.colorearCampo(validaciones.carrera, '#carrerasPlanEstudio', '#errorCarrerasPlanEstudio',
            validaciones.carrera ? '' : 'Seleccione carrera');

        if (!Object.values(validaciones).every(v => v === true)) {
            Alerta.notificarAdvertencia('Campos inválidos. Revise los campos marcados en rojo', 2000);
            return;
        }

        // Validar que haya al menos un semestre
        if (this.semestresPlan.length === 0) {
            Alerta.notificarAdvertencia('Debe agregar al menos un semestre', 2000);
            return;
        }

        try {
            let idPlanGuardado;

            if (this.modo === 'editar' && this.idPlan) {
                // Actualizar plan
                await m_planEstudio.actualizarPlanEstudio({
                    idPlanEstudio: this.idPlan,
                    nombre,
                    idCarrera,
                    fechaElaboracion: fecha,
                    periodoPlanEstudio: periodo,
                    vigente
                });
                idPlanGuardado = this.idPlan;
            } else {
                // Crear nuevo plan
                const nuevoPlan = await m_planEstudio.insertarPlanEstudio({
                    nombre,
                    idCarrera,
                    fechaElaboracion: fecha,
                    periodoPlanEstudio: periodo,
                    vigente
                });
                idPlanGuardado = nuevoPlan.idPlanEstudio;
            }

            // Guardar relaciones plan-semestre-asignatura y prerrequisitos
            for (const semestre of this.semestresPlan) {
                for (const asignatura of semestre.asignaturas) {
                    // Guardar relación plan-semestre-asignatura
                    await m_PlanSemestreAsignatura.insertarPlanSemestreAsignatura({
                        idPlanEstudio: idPlanGuardado,
                        idSemestre: semestre.idSemestre,
                        idAsignatura: asignatura.idAsignatura,
                        creditos: asignatura.creditos,
                        modalidad: asignatura.modalidad
                    });

                    // Guardar prerrequisitos de esta asignatura
                    if (asignatura.prerrequisitosIds && asignatura.prerrequisitosIds.length > 0) {
                        for (const idPrerreq of asignatura.prerrequisitosIds) {
                            await m_prerequisito.insertarPrerequisito({
                                idAsignatura: asignatura.idAsignatura,
                                idAsignaturaRequerida: idPrerreq
                            });
                        }
                    }
                }
            }

            Alerta.notificarExito(
                this.modo === 'editar' ? 'Plan actualizado correctamente' : 'Plan guardado correctamente',
                1500
            );

            if (this.modo === 'editar') {
                // Volver a visualización después de editar
                setTimeout(async () => {
                    this.modo = 'visualizar';
                    u_formularioPlanEstudio.configurarInterfazPorModo('visualizar');
                    
                    // Recargar datos del plan actualizado
                    await this.cargarPlan();
                    
                    Alerta.notificarExito('Cambios guardados', 1000);
                }, 1500);
            } else {
                // Si es creación, redirigir a la lista
                setTimeout(() => {
                    window.location.href = '/guniversidadfrontend/secretarioAcademico/template/html/planEstudio.html';
                }, 2000);
            }

        } catch (error) {
            console.error('Error guardando plan:', error);
            Alerta.error('Error', 'No se pudo guardar el plan de estudio');
        }
    }

}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    sesiones.verificarExistenciaSesion();
    await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionSecretario();
    
    await c_formularioPlanEstudio.iniciar();
});