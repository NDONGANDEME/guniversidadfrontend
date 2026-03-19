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
                    { ...this.planActual, nombreCarrera: carrera?.nombreCarrera },
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
        // Buscar en cursos si hay relación (esto dependerá de tu estructura de datos)
        // Por ahora, devolvemos un nombre genérico
        const nombres = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'];
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
                () => {} // El evento se maneja por separado
            );
        });

        container.innerHTML = html;

        // Actualizar estadísticas
        u_formularioPlanEstudio.actualizarEstadisticas(this.semestresPlan);
        u_formularioPlanEstudio.actualizarMallaCurricular(this.semestresPlan, this.asignaturasDisponibles);
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
        document.getElementById('btnGuardarSemestre')?.addEventListener('click', () => this.guardarSemestre());

        // Botón guardar plan
        document.getElementById('btnGuardarPlanEstudio')?.addEventListener('click', () => this.guardarPlan());

        // Botón cancelar
        document.getElementById('btnCancelar')?.addEventListener('click', () => {
            window.history.back();
        });

        // Eventos del modal de asignatura
        this.inicializarEventosModalAsignatura();

        // Evento para agregar prerrequisito
        document.getElementById('btnNuevaAsignatura')?.addEventListener('click', (e) => {
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
            const semestreId = button.getAttribute('data-semestre-id');
            
            // Guardar el semestre actual en el modal
            document.getElementById('modalNuevaAsignatura').dataset.semestreId = semestreId;
            
            // Limpiar campos
            document.getElementById('comboAsignaturasSemestre').value = '';
            document.getElementById('creditosSemestre').value = '';
            document.getElementById('modalidadSemestre').value = '';
            
            // Limpiar prerrequisitos
            if (document.getElementById('contPrerrequisitos')) document.getElementById('contPrerrequisitos').innerHTML = '';
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
                console.log('Asignatura seleccionada:', id, nombre);
                
                // Al seleccionar una asignatura, limpiar prerrequisitos y permitir agregar nuevos
                if (document.getElementById('contPrerrequisitos')) document.getElementById('contPrerrequisitos').innerHTML = '';
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
            (idPrerreq) => {
                console.log('Prerrequisito agregado:', idPrerreq);
            }
        );

        if (combo) {
            this.combosPrerrequisitos.push(combo);
        }
    }

    /**
     * Guarda un semestre
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

        // Buscar si el semestre ya existe en la BD
        let semestreExistente = this.semestresDisponibles.find(s => s.numeroSemestre == numeroSemestre);

        // Si no existe, crearlo
        if (!semestreExistente) {
            try {
                semestreExistente = await m_semestre.insertarSemestre({ numeroSemestre });
                this.semestresDisponibles.push(semestreExistente);
            } catch (error) {
                console.error('Error creando semestre:', error);
                Alerta.error('Error', 'No se pudo crear el semestre');
                return;
            }
        }

        // Verificar si el semestre ya está en el plan
        //const semestreEnPlan = this.semestresPlan.find(s => s.idSemestre == semestreExistente.idSemestre);
        
        /*if (semestreEnPlan) {
            Alerta.notificarAdvertencia('Este semestre ya está agregado al plan', 1500);
            return;
        }*/

        // Agregar semestre al plan
        this.semestresPlan.push({
            idSemestre: 1, //semestreExistente.idSemestre || 1,
            numeroSemestre: parseInt(numeroSemestre),
            nombreCurso,
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

        // Si el semestre tiene asignaturas guardadas en BD, habría que eliminarlas
        // Por ahora, solo eliminamos del estado local
        this.semestresPlan = this.semestresPlan.filter(s => s.idSemestre != semestre.idSemestre);
        
        this.renderizarSemestres();
        Alerta.notificarExito('Semestre eliminado', 1500);
    }

    /**
     * Edita un semestre
     */
    static editarSemestre(semestre) {
        // Implementar edición de semestre si es necesario
        Alerta.informacion('Editar semestre', 'Funcionalidad próximamente');
    }

    /**
     * Guarda una asignatura en el semestre actual
     */
    static async guardarAsignatura() {
        const semestreId = document.getElementById('modalNuevaAsignatura').dataset.semestreId;
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
            .filter(id => id != null);

        // Encontrar el semestre
        const semestre = this.semestresPlan.find(s => s.idSemestre == semestreId || s.tempId == semestreId);
        
        if (!semestre) {
            Alerta.error('Error', 'No se encontró el semestre');
            return;
        }

        // Crear objeto de asignatura para el semestre
        const nuevaAsignatura = {
            idAsignatura: asignatura.idAsignatura,
            nombreAsignatura: asignatura.nombreAsignatura,
            creditos: parseInt(creditos),
            modalidad,
            prerrequisitos: [] // Se llenará después
        };

        // Buscar nombres de prerrequisitos
        prerrequisitosIds.forEach(id => {
            const asigReq = this.asignaturasDisponibles.find(a => a.idAsignatura == id);
            if (asigReq) {
                nuevaAsignatura.prerrequisitos.push(asigReq.nombreAsignatura);
            }
        });

        // Agregar al semestre
        semestre.asignaturas.push(nuevaAsignatura);

        // Actualizar UI
        this.renderizarSemestres();

        // Cerrar modal
        $('#modalNuevaAsignatura').modal('hide');

        Alerta.notificarExito('Asignatura agregada correctamente', 1500);
    }

    /**
     * Guarda el plan de estudio completo
     */
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

            // Aquí iría la lógica para guardar las relaciones plan-semestre-asignatura
            // y los prerrequisitos. Por ahora mostramos éxito.

            Alerta.notificarExito(
                this.modo === 'editar' ? 'Plan actualizado correctamente' : 'Plan guardado correctamente',
                2000
            );

            // Redirigir a la lista
            setTimeout(() => {
                window.location.href = '/guniversidadfrontend/secretarioAcademico/template/html/planEstudio.html';
            }, 2000);

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