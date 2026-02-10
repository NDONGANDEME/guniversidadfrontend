import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_asignatura } from "../modelo/m_asignatura.js";
import { m_aula } from "../modelo/m_aula.js";
import { m_clase } from "../modelo/m_clase.js";
import { m_horario } from "../modelo/m_horario.js";
import { m_profesor } from "../modelo/m_profesor.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class c_horario
{
    constructor() {
        this.clases = [];
        this.claseActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.dataTable = null;
        
        this.profesores = [];
        this.asignaturas = [];
        this.aulas = [];
        this.horarios = [];
        
        // Validaciones
        this.profesorValido = false;
        this.asignaturaValida = false;
        this.aulaValida = false;
        this.horarioValido = false;
        this.diaSemanalValido = false;
        this.horaInicioValida = false;
        this.horaFinalValida = false;
    }


    // Método principal para iniciar todo
    inicializar() {
        this.cargarDatosDeSesion();
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.cargarSelectores();
        this.obtenerDataTable();
        this.actualizarVistaHorario();
    }


    // Cargar todos los datos desde sessionStorage
    cargarDatosDeSesion() {
        try {
            // Cargar profesores
            const profesoresJSON = sessionStorage.getItem('profesores');
            if (profesoresJSON) {
                const datosProfesores = JSON.parse(profesoresJSON);
                this.profesores = datosProfesores.map(p => 
                    new m_profesor(p.idProfesor, p.idUsuario, p.nombre, p.apellidos)
                );
            } else {
                // Datos de ejemplo
                this.profesores = [
                    new m_profesor(1, null, "Joshua", "Vincenti"),
                    new m_profesor(2, null, "Manuel Martín", "Ela Ndong"),
                    new m_profesor(3, null, "Samuel Elá", "NSOGO NSA"),
                    new m_profesor(4, null, "Benjamin Florentino", "Bayeme MAÑE MEDJA"),
                    new m_profesor(5, null, "Diosdado Asumu", "NDONG ANDEME"),
                    new m_profesor(6, null, "Manuel", "ONDO")
                ];
                sessionStorage.setItem('profesores', JSON.stringify(this.profesores));
            }

            // Cargar asignaturas
            const asignaturasJSON = sessionStorage.getItem('asignaturas');
            if (asignaturasJSON) {
                const datosAsignaturas = JSON.parse(asignaturasJSON);
                this.asignaturas = datosAsignaturas.map(a => 
                    new m_asignatura(a.idAsignatura, a.nombreAsignatura, a.creditos)
                );
            } else {
                // Datos de ejemplo
                this.asignaturas = [
                    new m_asignatura(1, "Matemáticas computacionales / Teoría de automatismos y lenguaje", null),
                    new m_asignatura(2, "Sistema de información web", null),
                    new m_asignatura(3, "Organización computacional y Arquitectura de Computadoras", null),
                    new m_asignatura(4, "Diseño de Circuitos eléctricos", null),
                    new m_asignatura(5, "Fundamentos de sistemas de comunicaciones y redes de datos", null),
                    new m_asignatura(6, "Análisis del discurso oral y escrito", null),
                    new m_asignatura(7, "Simulación de sistemas", null),
                    new m_asignatura(8, "Tutorías", null)
                ];
                sessionStorage.setItem('asignaturas', JSON.stringify(this.asignaturas));
            }

            // Cargar aulas
            const aulasJSON = sessionStorage.getItem('aulas');
            if (aulasJSON) {
                const datosAulas = JSON.parse(aulasJSON);
                this.aulas = datosAulas.map(a => new m_aula(a.idAula, a.nombre));
            } else {
                // Datos de ejemplo
                this.aulas = [
                    new m_aula(1, "G4"),
                    new m_aula(2, "G5"),
                    new m_aula(3, "G6"),
                    new m_aula(4, "F1"),
                    new m_aula(5, "106")
                ];
                sessionStorage.setItem('aulas', JSON.stringify(this.aulas));
            }

            // Cargar horarios
            const horariosJSON = sessionStorage.getItem('horarios');
            if (horariosJSON) {
                const datosHorarios = JSON.parse(horariosJSON);
                this.horarios = datosHorarios.map(h => new m_horario(h.idHorario, h.nombre));
            } else {
                // Datos de ejemplo
                this.horarios = [
                    new m_horario(1, "8:00-10:00"),
                    new m_horario(2, "10:10-12:10"),
                    new m_horario(3, "14:00-17:10")
                ];
                sessionStorage.setItem('horarios', JSON.stringify(this.horarios));
            }

            // Cargar clases
            const clasesJSON = sessionStorage.getItem('clases');
            if (clasesJSON) {
                const datosClases = JSON.parse(clasesJSON);
                this.clases = datosClases.map(c => 
                    new m_clase(c.idClase, c.idProfesor, c.idAsignatura, c.diaSemanal, c.idAula, c.idHorario, c.horaInicio, c.horaFinal)
                );
            }

        } catch (error) {
            Alerta.error('Error', `Fallo al cargar datos: ${error}`);
        }
    }


    // Cargar datos iniciales de clases
    cargarDatosIniciales() {
        const clasesGuardadas = sessionStorage.getItem('clases');
        
        if (clasesGuardadas && JSON.parse(clasesGuardadas).length > 0) {
            const datosClases = JSON.parse(clasesGuardadas);
            this.clases = datosClases.map(c => 
                new m_clase(c.idClase, c.idProfesor, c.idAsignatura, c.diaSemanal, c.idAula, c.idHorario, c.horaInicio, c.horaFinal)
            );
        } else {
            // Si no hay clases, creamos algunas de ejemplo basadas en la imagen
            this.clases = [
                new m_clase(1, 1, 1, "Lunes", 1, 1, "8:00", "10:00"),
                new m_clase(2, 5, 2, "Martes", 3, 1, "8:00", "10:00"),
                new m_clase(3, 2, 3, "Miércoles", 1, 1, "8:00", "10:00"),
                new m_clase(4, 3, 4, "Jueves", 2, 1, "8:00", "10:00"),
                new m_clase(5, 4, 5, "Lunes", 1, 2, "10:10", "12:10"),
                new m_clase(6, 1, 1, "Martes", 2, 2, "10:10", "12:10"),
                new m_clase(7, 6, 6, "Miércoles", 4, 2, "10:10", "12:10"),
                new m_clase(8, 6, 7, "Jueves", 4, 2, "10:10", "12:10"),
                new m_clase(9, 2, 3, "Jueves", 4, 2, "11:10", "12:10"),
                new m_clase(10, 4, 5, "Lunes", 4, 3, "14:00", "17:10"),
                new m_clase(11, 6, 7, "Martes", 4, 3, "14:00", "17:10"),
                new m_clase(12, 6, 6, "Miércoles", 4, 3, "14:00", "17:10"),
                new m_clase(13, 4, 5, "Jueves", 1, 3, "14:00", "17:10"),
                new m_clase(14, 3, 4, "Jueves", 5, 3, "14:00", "17:10"),
                new m_clase(15, 2, 7, "Miércoles", 2, 3, "15:00", "17:10"),
                new m_clase(16, 5, 2, "Martes", 2, 3, "15:00", "17:10"),
                new m_clase(17, 2, 8, "Viernes", null, 3, "14:00", "17:10")
            ];
            
            this.guardarClasesEnSesion();
        }
        
        // Actualizar contadorId basado en el ID más alto
        if (this.clases.length > 0) {
            const maxId = Math.max(...this.clases.map(c => c.idClase));
            this.contadorId = maxId + 1;
        }
    }


    // Configurar todos los eventos
    configurarEventos() {
        // Guardar clase
        $('#btnGuardarClase').on('click', () => this.guardarClase());
        
        // Nuevo registro
        $('.nuevo').on('click', () => {
            this.modoEdicion = false;
            this.claseActual = null;
            $('#modalNuevaClaseLabel').text('Agregar nueva clase');
            this.limpiarFormulario();
        });
        
        // Editar (delegación)
        $(document).on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.prepararEdicion(id);
        });
        
        // Eliminar (delegación)
        $(document).on('click', '.eliminar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.eliminarClase(id);
        });
        
        // Selector combinado para profesor (select + input)
        $('#selectProfesor').on('change', () => {
            const valor = $('#selectProfesor').val();
            if (valor === 'nuevo') {
                $('#nuevoProfesorContainer').show();
                $('#nuevoProfesor').val('');
                this.profesorValido = false;
            } else {
                $('#nuevoProfesorContainer').hide();
                this.profesorValido = true;
            }
            this.validarCampoProfesor();
        });

        // Selector combinado para asignatura (select + input)
        $('#selectAsignatura').on('change', () => {
            const valor = $('#selectAsignatura').val();
            if (valor === 'nuevo') {
                $('#nuevaAsignaturaContainer').show();
                $('#nuevaAsignatura').val('');
                this.asignaturaValida = false;
            } else {
                $('#nuevaAsignaturaContainer').hide();
                this.asignaturaValida = true;
            }
            this.validarCampoAsignatura();
        });

        // Validación de campos nuevos
        $('#nuevoProfesor').on('input', () => this.validarCampoProfesor());
        $('#nuevaAsignatura').on('input', () => this.validarCampoAsignatura());
    }


    // Configurar validaciones
    configurarValidaciones() {
        // Validar aula
        $('#selectAula').on('change', () => {
            const valor = $('#selectAula').val();
            this.aulaValida = valor !== "Ninguno";
            this.aplicarValidacion('selectAula', 'errorAula', this.aulaValida, 'Seleccione un aula');
        });

        // Validar horario
        $('#selectHorario').on('change', () => {
            const valor = $('#selectHorario').val();
            this.horarioValido = valor !== "Ninguno";
            this.aplicarValidacion('selectHorario', 'errorHorario', this.horarioValido, 'Seleccione un horario');
        });

        // Validar día semanal
        $('#diaSemanal').on('change', () => {
            const valor = $('#diaSemanal').val();
            this.diaSemanalValido = valor !== "Ninguno";
            this.aplicarValidacion('diaSemanal', 'errorDiaSemanal', this.diaSemanalValido, 'Seleccione un día');
        });

        // Validar hora inicio
        $('#horaInicio').on('input', () => {
            const valor = $('#horaInicio').val().trim();
            this.horaInicioValida = u_verificaciones.validarHora(valor);
            this.aplicarValidacion('horaInicio', 'errorHoraInicio', this.horaInicioValida, 'Formato de hora inválido (HH:MM)');
        });

        // Validar hora final
        $('#horaFinal').on('input', () => {
            const valor = $('#horaFinal').val().trim();
            this.horaFinalValida = u_verificaciones.validarHora(valor);
            this.aplicarValidacion('horaFinal', 'errorHoraFinal', this.horaFinalValida, 'Formato de hora inválido (HH:MM)');
        });
    }


    // Aplicar validación visual
    aplicarValidacion(campoId, errorId, esValido, mensajeError) {
        if (esValido) {
            $(`#${campoId}`)
                .removeClass('border-danger')
                .addClass('border-success');
            $(`#${errorId}`).text('').hide();
        } else {
            $(`#${campoId}`)
                .removeClass('border-success')
                .addClass('border-danger');
            $(`#${errorId}`).text(mensajeError).show();
        }
    }


    // Validar campo profesor
    validarCampoProfesor() {
        const selectValor = $('#selectProfesor').val();
        
        if (selectValor === 'nuevo') {
            const nuevoValor = $('#nuevoProfesor').val().trim();
            this.profesorValido = nuevoValor.length >= 3;
            this.aplicarValidacion('nuevoProfesor', 'errorProfesor', this.profesorValido, 'Ingrese un nombre válido (mínimo 3 caracteres)');
        } else {
            this.profesorValido = selectValor !== "Ninguno";
            this.aplicarValidacion('selectProfesor', 'errorProfesor', this.profesorValido, 'Seleccione un profesor');
        }
    }


    // Validar campo asignatura
    validarCampoAsignatura() {
        const selectValor = $('#selectAsignatura').val();
        
        if (selectValor === 'nuevo') {
            const nuevoValor = $('#nuevaAsignatura').val().trim();
            this.asignaturaValida = nuevoValor.length >= 3;
            this.aplicarValidacion('nuevaAsignatura', 'errorAsignatura', this.asignaturaValida, 'Ingrese un nombre válido (mínimo 3 caracteres)');
        } else {
            this.asignaturaValida = selectValor !== "Ninguno";
            this.aplicarValidacion('selectAsignatura', 'errorAsignatura', this.asignaturaValida, 'Seleccione una asignatura');
        }
    }


    // Cargar selectores con datos
    cargarSelectores() {
        // Selector de profesores
        const selectProfesor = $('#selectProfesor');
        selectProfesor.empty();
        selectProfesor.append('<option value="Ninguno">Seleccione...</option>');
        this.profesores.forEach(p => {
            selectProfesor.append(`<option value="${p.idProfesor}">${p.nombre} ${p.apellidos || ''}</option>`);
        });
        selectProfesor.append('<option value="nuevo">+ Nuevo profesor</option>');

        // Selector de asignaturas
        const selectAsignatura = $('#selectAsignatura');
        selectAsignatura.empty();
        selectAsignatura.append('<option value="Ninguno">Seleccione...</option>');
        this.asignaturas.forEach(a => {
            selectAsignatura.append(`<option value="${a.idAsignatura}">${a.nombreAsignatura}</option>`);
        });
        selectAsignatura.append('<option value="nuevo">+ Nueva asignatura</option>');

        // Selector de aulas
        const selectAula = $('#selectAula');
        selectAula.empty();
        selectAula.append('<option value="Ninguno">Seleccione...</option>');
        this.aulas.forEach(a => {
            selectAula.append(`<option value="${a.idAula}">${a.nombre}</option>`);
        });

        // Selector de horarios
        const selectHorario = $('#selectHorario');
        selectHorario.empty();
        selectHorario.append('<option value="Ninguno">Seleccione...</option>');
        this.horarios.forEach(h => {
            selectHorario.append(`<option value="${h.idHorario}">${h.nombre}</option>`);
        });

        // Selector de días
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const selectDia = $('#diaSemanal');
        selectDia.empty();
        selectDia.append('<option value="Ninguno">Seleccione...</option>');
        dias.forEach(d => {
            selectDia.append(`<option value="${d}">${d}</option>`);
        });
    }


    // Obtener referencia a DataTable
    obtenerDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaClases')) {
            this.dataTable = $('#tablaClases').DataTable();
        } else {
            this.dataTable = $('#tablaClases').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
            });
        }
    }


    // Actualizar tabla de clases
    actualizarTabla() {
        if (!this.dataTable) {
            this.obtenerDataTable();
        }
        
        this.dataTable.clear();
        
        this.clases.forEach(clase => {
            const nombreProfesor = this.obtenerNombreProfesor(clase.idProfesor);
            const nombreAsignatura = this.obtenerNombreAsignatura(clase.idAsignatura);
            const nombreAula = this.obtenerNombreAula(clase.idAula);
            const nombreHorario = this.obtenerNombreHorario(clase.idHorario);
            
            this.dataTable.row.add([
                clase.diaSemanal,
                nombreHorario || 'N/A',
                nombreAsignatura || 'N/A',
                nombreProfesor || 'N/A',
                nombreAula || 'N/A',
                this.crearBotonesAccion(clase.idClase)
            ]);
        });
        
        this.dataTable.draw();
    }


    // Obtener nombre del profesor por ID
    obtenerNombreProfesor(idProfesor) {
        if (!idProfesor) return "Ninguno";
        const profesor = this.profesores.find(p => p.idProfesor == idProfesor);
        return profesor ? `${profesor.nombre} ${profesor.apellidos || ''}` : "Profesor no encontrado";
    }


    // Obtener nombre de asignatura por ID
    obtenerNombreAsignatura(idAsignatura) {
        if (!idAsignatura) return "Ninguno";
        const asignatura = this.asignaturas.find(a => a.idAsignatura == idAsignatura);
        return asignatura ? asignatura.nombreAsignatura : "Asignatura no encontrada";
    }


    // Obtener nombre de aula por ID
    obtenerNombreAula(idAula) {
        if (!idAula) return "Ninguno";
        const aula = this.aulas.find(a => a.idAula == idAula);
        return aula ? aula.nombre : "Aula no encontrada";
    }


    // Obtener nombre de horario por ID
    obtenerNombreHorario(idHorario) {
        if (!idHorario) return "Ninguno";
        const horario = this.horarios.find(h => h.idHorario == idHorario);
        return horario ? horario.nombre : "Horario no encontrado";
    }


    // Crear botones de acción para cada fila
    crearBotonesAccion(idClase) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevaClase" 
                        title="Editar" 
                        data-id="${idClase}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger eliminar" 
                        data-id="${idClase}" 
                        title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }


    // Validar formulario
    validarFormulario() {
        this.validarCampoProfesor();
        this.validarCampoAsignatura();
        
        return this.profesorValido && 
               this.asignaturaValida && 
               this.aulaValida && 
               this.horarioValido && 
               this.diaSemanalValido && 
               this.horaInicioValida && 
               this.horaFinalValida;
    }


    // Guardar clase
    async guardarClase() {
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Complete correctamente todos los campos.');
            return;
        }
        
        try {
            // Procesar profesor
            let idProfesor = $('#selectProfesor').val();
            if (idProfesor === 'nuevo') {
                const nuevoNombre = $('#nuevoProfesor').val().trim();
                idProfesor = await this.crearNuevoProfesor(nuevoNombre);
            }
            
            // Procesar asignatura
            let idAsignatura = $('#selectAsignatura').val();
            if (idAsignatura === 'nuevo') {
                const nuevoNombre = $('#nuevaAsignatura').val().trim();
                idAsignatura = await this.crearNuevaAsignatura(nuevoNombre);
            }
            
            const diaSemanal = $('#diaSemanal').val();
            const idAula = $('#selectAula').val() !== "Ninguno" ? parseInt($('#selectAula').val()) : null;
            const idHorario = $('#selectHorario').val() !== "Ninguno" ? parseInt($('#selectHorario').val()) : null;
            const horaInicio = $('#horaInicio').val().trim();
            const horaFinal = $('#horaFinal').val().trim();
            
            const id = this.modoEdicion ? this.claseActual.idClase : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR
                const index = this.clases.findIndex(c => c.idClase === id);
                if (index !== -1) {
                    this.clases[index] = new m_clase(
                        id, idProfesor, idAsignatura, diaSemanal, 
                        idAula, idHorario, horaInicio, horaFinal
                    );
                    Alerta.exito('Éxito', 'Clase actualizada correctamente');
                }
            } else {
                // INSERTAR
                const nuevaClase = new m_clase(
                    id, idProfesor, idAsignatura, diaSemanal, 
                    idAula, idHorario, horaInicio, horaFinal
                );
                this.clases.push(nuevaClase);
                Alerta.exito('Éxito', 'Clase creada correctamente');
            }
            
            this.actualizarTabla();
            this.actualizarVistaHorario();
            this.guardarClasesEnSesion();
            this.limpiarFormulario();
            $('#modalNuevaClase').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    // Crear nuevo profesor
    async crearNuevoProfesor(nombreCompleto) {
        const idNuevo = this.profesores.length > 0 ? Math.max(...this.profesores.map(p => p.idProfesor)) + 1 : 1;
        
        // Dividir nombre y apellidos
        const partes = nombreCompleto.split(' ');
        const nombre = partes[0];
        const apellidos = partes.slice(1).join(' ') || '';
        
        const nuevoProfesor = new m_profesor(idNuevo, null, nombre, apellidos);
        this.profesores.push(nuevoProfesor);
        
        // Actualizar sessionStorage
        sessionStorage.setItem('profesores', JSON.stringify(this.profesores));
        
        // Recargar selector
        this.cargarSelectores();
        
        return idNuevo;
    }


    // Crear nueva asignatura
    async crearNuevaAsignatura(nombreAsignatura) {
        const idNuevo = this.asignaturas.length > 0 ? Math.max(...this.asignaturas.map(a => a.idAsignatura)) + 1 : 1;
        
        const nuevaAsignatura = new m_asignatura(idNuevo, nombreAsignatura, null);
        this.asignaturas.push(nuevaAsignatura);
        
        // Actualizar sessionStorage
        sessionStorage.setItem('asignaturas', JSON.stringify(this.asignaturas));
        
        // Recargar selector
        this.cargarSelectores();
        
        return idNuevo;
    }


    // Preparar edición
    prepararEdicion(idClase) {
        const clase = this.clases.find(c => c.idClase == idClase);
        
        if (clase) {
            this.modoEdicion = true;
            this.claseActual = clase;
            
            // Seleccionar profesor
            $('#selectProfesor').val(clase.idProfesor || "Ninguno");
            $('#nuevoProfesorContainer').hide();
            
            // Seleccionar asignatura
            $('#selectAsignatura').val(clase.idAsignatura || "Ninguno");
            $('#nuevaAsignaturaContainer').hide();
            
            // Seleccionar aula
            $('#selectAula').val(clase.idAula || "Ninguno");
            
            // Seleccionar horario
            $('#selectHorario').val(clase.idHorario || "Ninguno");
            
            // Día semanal
            $('#diaSemanal').val(clase.diaSemanal || "Ninguno");
            
            // Horas
            $('#horaInicio').val(clase.horaInicio || '');
            $('#horaFinal').val(clase.horaFinal || '');
            
            $('#modalNuevaClaseLabel').text('Editar clase');
            
            // Forzar validaciones
            $('#selectAula').trigger('change');
            $('#selectHorario').trigger('change');
            $('#diaSemanal').trigger('change');
            $('#horaInicio').trigger('input');
            $('#horaFinal').trigger('input');
            this.validarCampoProfesor();
            this.validarCampoAsignatura();
        }
    }


    // Eliminar clase
    async eliminarClase(idClase) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de eliminar esta clase?'
            );
            
            if (confirmacion) {
                this.clases = this.clases.filter(c => c.idClase != idClase);
                this.actualizarTabla();
                this.actualizarVistaHorario();
                this.guardarClasesEnSesion();
                Alerta.exito('Éxito', 'Clase eliminada correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al eliminar: ${error}`);
        }
    }


    // Limpiar formulario
    limpiarFormulario() {
        $('#selectProfesor').val('Ninguno');
        $('#selectAsignatura').val('Ninguno');
        $('#selectAula').val('Ninguno');
        $('#selectHorario').val('Ninguno');
        $('#diaSemanal').val('Ninguno');
        $('#horaInicio').val('');
        $('#horaFinal').val('');
        
        $('#nuevoProfesorContainer').hide();
        $('#nuevoProfesor').val('');
        $('#nuevaAsignaturaContainer').hide();
        $('#nuevaAsignatura').val('');
        
        // Resetear validaciones
        this.profesorValido = false;
        this.asignaturaValida = false;
        this.aulaValida = false;
        this.horarioValido = false;
        this.diaSemanalValido = false;
        this.horaInicioValida = false;
        this.horaFinalValida = false;
        
        // Remover clases de validación
        $('.form-select, .form-control').removeClass('border-success border-danger');
        $('.error-message').text('').hide();
        
        this.modoEdicion = false;
        this.claseActual = null;
        $('#modalNuevaClaseLabel').text('Agregar nueva clase');
    }


    // Guardar clases en sessionStorage
    guardarClasesEnSesion() {
        try {
            sessionStorage.setItem('clases', JSON.stringify(this.clases));
        } catch (error) {
            Alerta.error('Error', `Fallo al guardar en sessionStorage: ${error}`);
        }
    }


    // ACTUALIZAR VISTA DE HORARIO (tabla como la imagen)
    actualizarVistaHorario() {
        const horarioContainer = $('#vistaHorarioSemanal');
        horarioContainer.empty();
        
        const horas = [
            { inicio: '8:00', fin: '10:00', label: '8:00 - 10:00' },
            { inicio: '10:10', fin: '12:10', label: '10:10 - 12:10' },
            { inicio: '14:00', fin: '17:10', label: '14:00 - 17:10' }
        ];
        
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        
        let html = `
            <div class="table-responsive">
                <table class="table table-bordered schedule-table">
                    <thead class="bg-warning">
                        <tr>
                            <th>Horario</th>
                            <th>Lunes</th>
                            <th>Martes</th>
                            <th>Miércoles</th>
                            <th>Jueves</th>
                            <th>Viernes</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Mañana
        horas.forEach(hora => {
            html += `<tr>`;
            html += `<td class="time-slot font-weight-bold">${hora.label}</td>`;
            
            dias.forEach(dia => {
                const clasesEnSlot = this.clases.filter(c => 
                    c.diaSemanal === dia && 
                    c.horaInicio === hora.inicio
                );
                
                if (clasesEnSlot.length > 0) {
                    html += `<td>`;
                    clasesEnSlot.forEach(clase => {
                        const profesor = this.obtenerNombreProfesor(clase.idProfesor);
                        const asignatura = this.obtenerNombreAsignatura(clase.idAsignatura);
                        const aula = this.obtenerNombreAula(clase.idAula);
                        
                        html += `
                            <div class="class-item mb-2 p-2 border-left border-warning" style="border-left-width: 4px !important;">
                                <div class="small font-weight-bold">${asignatura}</div>
                                <div class="small text-muted">${profesor}</div>
                                <div class="small"><i class="fas fa-door-open"></i> ${aula}</div>
                            </div>
                        `;
                    });
                    html += `</td>`;
                } else {
                    html += `<td class="text-center text-muted">-</td>`;
                }
            });
            
            html += `</tr>`;
            
            // RECESO
            if (hora.fin === '12:10') {
                html += `
                    <tr class="break-row">
                        <td colspan="6" class="text-center bg-light py-3">
                            <span class="font-weight-bold">⏰ RECESO ⏰</span>
                        </td>
                    </tr>
                `;
            }
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <div class="text-right mt-3">
                <button class="btn btn-warning" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimir Horario
                </button>
            </div>
            <div class="footer mt-4 p-3 text-center border-top border-warning">
                ILUSTRISIMO DECANO DE LA FACULTAD DE INGENIERIAS Y ARQUITECTURA
            </div>
        `;
        
        horarioContainer.html(html);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    sesiones.verificarExistenciaSesion();
    
    u_utilesSA.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utilesSA.botonesNavegacionWrapper();
    
    const controladorHorarios = new c_horario();
    
    setTimeout(() => {
        controladorHorarios.inicializar();
    }, 100);
});