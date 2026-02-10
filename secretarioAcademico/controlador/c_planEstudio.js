import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_planEstudio } from "../modelo/m_planEstudio.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";

export class c_planEstudio
{
    constructor() {
        this.planesEstudio = [];
        this.planActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.dataTable = null;
        this.carreras = [];
        this.nombreValido = false;
        this.fechaValida = false;
        this.periodoValido = false;
        this.carreraValida = false;
    }


    // Método principal para iniciar todo
    inicializar() {
        this.cargarCarrerasDeSesion();
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.cargarCarrerasEnSelect();
        this.obtenerDataTable();
    }


    // Cargar carreras desde sessionStorage
    cargarCarrerasDeSesion() {
        try {
            const carrerasJSON = sessionStorage.getItem('carreras');
            if (carrerasJSON) {
                const datosCarreras = JSON.parse(carrerasJSON);
                this.carreras = datosCarreras.map(c => ({
                    idCarrera: c.idCarrera,
                    nombre: c.nombreCarrera
                }));
            } else {
                Alerta.advertencia('Advertencia', 'No hay carreras registradas. Por favor, agregue carreras primero.');
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar carreras: ${error}`);
        }
    }


    // Llenar select con carreras
    cargarCarrerasEnSelect() {
        // let todasCarreras = await fetchCarrera.obtenerCarrerasDeBDD();

        const select = $('#carrerasPlanEstudio');
        select.empty();
        select.append('<option value="Ninguno">Seleccione...</option>');
        
        // Agregar carreras desde sessionStorage
        this.carreras.forEach(carrera => {
            select.append(`<option value="${carrera.idCarrera}">${carrera.nombre}</option>`);
        });
    }


    // Cargar planes de estudio desde sessionStorage
    cargarPlanesDeSesion() {
        try {
            const planesJSON = sessionStorage.getItem('planesEstudio');
            if (planesJSON) {
                return JSON.parse(planesJSON);
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar planes de estudio: ${error}`);
        }
        return null;
    }


    // Cargar datos iniciales de planes de estudio
    cargarDatosIniciales() {
        // let todosPlanes = await fetchPlanEstudio.obtenerPlanesEstudiosDeBDD();

        const planesGuardados = this.cargarPlanesDeSesion();
        
        if (planesGuardados && planesGuardados.length > 0) {
            this.planesEstudio = planesGuardados.map(p => 
                new m_planEstudio(p.idPlanEstudio, p.nombrePlan, p.idCarrera, p.fechaElaboracion, p.periodoPlan)
            );
        } else {
            // Datos de ejemplo
            const fechaActual = new Date().toISOString().split('T')[0];
            this.planesEstudio = [
                new m_planEstudio(1, "Plan 2022", null, fechaActual, "4 años")
            ];

            this.guardarPlanesEnSesion();
        }
        
        // Actualizar contadorId basado en el ID más alto
        if (this.planesEstudio.length > 0) {
            const maxId = Math.max(...this.planesEstudio.map(p => p.idPlanEstudio));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // Configurar todos los eventos
    configurarEventos() {
        // Guardar plan de estudio
        $('#btnGuardarPlanEstudio').on('click', () => this.guardarPlanEstudio());
        
        // Nuevo registro
        $('.nuevo').on('click', () => {
            this.modoEdicion = false;
            this.planActual = null;
            $('#modalNuevoPlanEstudioLabel').text('Agregar nuevo plan de estudios');
            this.limpiarFormulario();
        });
        
        // Editar (delegación)
        $(document).on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.prepararEdicion(id);
        });
        
        // Deshabilitar (delegación)
        $(document).on('click', '.deshabilitar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.deshabilitarPlanEstudio(id);
        });
    }


    // Configurar validaciones
    configurarValidaciones() {
        // Validar nombre
        $('#nombrePlanEstudio').on('input', () => {
            const valor = $('#nombrePlanEstudio').val().trim();
            this.nombreValido = u_verificaciones.validarTexto(valor);
            
            if (this.nombreValido) {
                $('#nombrePlanEstudio')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorNombrePlanEstudio').text('').hide();
            } else {
                $('#nombrePlanEstudio')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorNombrePlanEstudio')
                    .text('El nombre debe tener entre 3 y 100 caracteres')
                    .show();
            }
        });

        // Validar fecha de elaboración
        $('#fechaElaboracionPlanEstudio').on('change', () => {
            const valor = $('#fechaElaboracionPlanEstudio').val();
            this.fechaValida = valor !== '' && valor !== null;
            
            if (this.fechaValida) {
                $('#fechaElaboracionPlanEstudio')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorFechaElaboracionPlanEstudio').text('').hide();
            } else {
                $('#fechaElaboracionPlanEstudio')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorFechaElaboracionPlanEstudio')
                    .text('La fecha de elaboración es obligatoria')
                    .show();
            }
        });

        // Validar periodo
        $('#periodoPlanEstudio').on('input', () => {
            const valor = $('#periodoPlanEstudio').val().trim();
            this.periodoValido = valor !== '' && valor.length >= 2;
            
            if (this.periodoValido) {
                $('#periodoPlanEstudio')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorPeriodoPlanEstudio').text('').hide();
            } else {
                $('#periodoPlanEstudio')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorPeriodoPlanEstudio')
                    .text('El periodo es obligatorio (ej: 4 años)')
                    .show();
            }
        });
        
        // Validar carrera (opcional)
        $('#carrerasPlanEstudio').on('change', () => {
            const valor = $('#carrerasPlanEstudio').val();
            this.carreraValida = valor !== "Ninguno";
            
            if (this.carreraValida) {
                $('#carrerasPlanEstudio')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorCarrerasPlanEstudio').text('').hide();
            } else {
                $('#carrerasPlanEstudio')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorCarrerasPlanEstudio')
                    .text('Seleccione una carrera (opcional)')
                    .show();
            }
        });
    }


    // Obtener referencia a DataTable
    obtenerDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaPlanesEstudios')) {
            this.dataTable = $('#tablaPlanesEstudios').DataTable();
        } else {
            this.dataTable = $('#tablaPlanesEstudios').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
            });
        }
    }


    // Formatear fecha para mostrar
    formatearFecha(fecha) {
        if (!fecha) return "Sin fecha";
        const partes = fecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return fecha;
    }


    // Actualizar tabla
    actualizarTabla() {
        if (!this.dataTable) {
            this.obtenerDataTable();
        }
        
        this.dataTable.clear();
        
        this.planesEstudio.forEach(plan => {
            // Obtener nombre de la carrera
            const nombreCarrera = this.obtenerNombreCarrera(plan.idCarrera);
            const fechaFormateada = this.formatearFecha(plan.fechaElaboracion);
            
            this.dataTable.row.add([
                plan.nombre,
                fechaFormateada,
                plan.periodoPlanEstudio,
                nombreCarrera,
                this.crearBotonesAccion(plan.idPlanEstudio)
            ]);
        });
        
        this.dataTable.draw();
    }


    // Obtener nombre de carrera por ID
    obtenerNombreCarrera(idCarrera) {
        if (!idCarrera) return "Ninguno";
        
        const carrera = this.carreras.find(c => c.idCarrera == idCarrera);
        return carrera ? carrera.nombre : "Carrera no encontrada";
    }


    // Crear botones de acción para cada fila
    crearBotonesAccion(idPlanEstudio) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevoPlanEstudio" 
                        title="Editar" 
                        data-id="${idPlanEstudio}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idPlanEstudio}" 
                        title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }


    // Validar formulario (campos obligatorios: nombre, fecha, periodo)
    validarFormulario() {
        return this.nombreValido && this.fechaValida && this.periodoValido;
    }


    // INSERTAR/EDITAR: Guardar plan de estudio
    async guardarPlanEstudio() {
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Complete correctamente todos los campos obligatorios.');
            return;
        }
        
        try {
            const nombre = $('#nombrePlanEstudio').val().trim();
            const fechaElaboracion = $('#fechaElaboracionPlanEstudio').val();
            const periodo = $('#periodoPlanEstudio').val().trim();
            const idCarrera = $('#carrerasPlanEstudio').val() !== "Ninguno" 
                ? parseInt($('#carrerasPlanEstudio').val()) 
                : null;
            
            const id = this.modoEdicion ? this.planActual.idPlanEstudio : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR: Actualizar registro
                const index = this.planesEstudio.findIndex(p => p.idPlanEstudio === id);
                if (index !== -1) {
                    this.planesEstudio[index].nombre = nombre;
                    this.planesEstudio[index].fechaElaboracion = fechaElaboracion;
                    this.planesEstudio[index].periodoPlanEstudio = periodo;
                    this.planesEstudio[index].idCarrera = idCarrera;
                    // await fetchPlanEstudio.actualizarPlanEstudioEnBDD({idPlanEstudio: index, nombre: nombre, fechaElaboracion: fechaElaboracion, periodoPlanEstudio: periodo,idCarrera: idCarrera});
                    Alerta.exito('Éxito', 'Plan de estudio actualizado correctamente');
                }
            } else {
                // INSERTAR: Crear nuevo registro
                const nuevoPlan = new m_planEstudio(id, nombre, idCarrera, fechaElaboracion, periodo);
                this.planesEstudio.push(nuevoPlan);
                // await fetchPlanEstudio.insertarPlanEstudioEnBDD(nuevoPlan);
                Alerta.exito('Éxito', 'Plan de estudio creado correctamente');
            }
            
            this.actualizarTabla();
            this.guardarPlanesEnSesion();
            this.limpiarFormulario();
            $('#modalNuevoPlanEstudio').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    // EDITAR: Preparar formulario para edición
    prepararEdicion(idPlanEstudio) {
        const plan = this.planesEstudio.find(p => p.idPlanEstudio == idPlanEstudio);
        
        if (plan) {
            this.modoEdicion = true;
            this.planActual = plan;
            
            $('#nombrePlanEstudio').val(plan.nombre);
            $('#fechaElaboracionPlanEstudio').val(plan.fechaElaboracion);
            $('#periodoPlanEstudio').val(plan.periodoPlanEstudio);
            $('#carrerasPlanEstudio').val(plan.idCarrera || "Ninguno");
            $('#modalNuevoPlanEstudioLabel').text('Editar plan de estudios');
            
            // Forzar validaciones
            $('#nombrePlanEstudio').trigger('input');
            $('#fechaElaboracionPlanEstudio').trigger('change');
            $('#periodoPlanEstudio').trigger('input');
            $('#carrerasPlanEstudio').trigger('change');
            
            $('#modalNuevoPlanEstudio').modal('show');
        }
    }


    // DESHABILITAR: Eliminar plan de estudio
    async deshabilitarPlanEstudio(idPlanEstudio) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar este plan de estudio?'
            );
            
            if (confirmacion) {
                // DESHABILITAR: Eliminar de la lista
                this.planesEstudio = this.planesEstudio.filter(p => p.idPlanEstudio != idPlanEstudio);
                this.actualizarTabla();
                this.guardarPlanesEnSesion();
                // await fetchPlanEstudio.deshabilitarPlanEstudioEnBDD(idPlanEstudio);
                Alerta.exito('Éxito', 'Plan de estudio deshabilitado correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    // Limpiar formulario
    limpiarFormulario() {
        $('#nombrePlanEstudio').val('');
        $('#fechaElaboracionPlanEstudio').val('');
        $('#periodoPlanEstudio').val('');
        $('#carrerasPlanEstudio').val('Ninguno');
        
        this.nombreValido = false;
        this.fechaValida = false;
        this.periodoValido = false;
        this.carreraValida = false;
        
        $('#nombrePlanEstudio').removeClass('border-success border-danger');
        $('#fechaElaboracionPlanEstudio').removeClass('border-success border-danger');
        $('#periodoPlanEstudio').removeClass('border-success border-danger');
        $('#carrerasPlanEstudio').removeClass('border-success border-danger');
        
        $('#errorNombrePlanEstudio').text('').hide();
        $('#errorFechaElaboracionPlanEstudio').text('').hide();
        $('#errorPeriodoPlanEstudio').text('').hide();
        $('#errorCarrerasPlanEstudio').text('').hide();
        
        this.modoEdicion = false;
        this.planActual = null;
        $('#modalNuevoPlanEstudioLabel').text('Agregar nuevo plan de estudios');
    }


    // Guardar planes de estudio en sessionStorage
    guardarPlanesEnSesion() {
        try {
            const planesData = this.planesEstudio.map(p => ({
                idPlanEstudio: p.idPlanEstudio,
                nombrePlan: p.nombre,
                idCarrera: p.idCarrera,
                fechaElaboracion: p.fechaElaboracion,
                periodoPlan: p.periodoPlanEstudio
            }));
            
            sessionStorage.setItem('planesEstudio', JSON.stringify(planesData));
        } catch (error) {
            Alerta.error('Error', `Fallo al guardar en sessionStorage: ${error}`);
        }
    }
}


// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    sesiones.verificarExistenciaSesion();
    
    u_utilesSA.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utilesSA.botonesNavegacionWrapper();
    
    const controladorPlanes = new c_planEstudio();
    
    // Pequeño delay para asegurar que DataTable esté disponible
    setTimeout(() => {
        controladorPlanes.inicializar();
    }, 100);
});