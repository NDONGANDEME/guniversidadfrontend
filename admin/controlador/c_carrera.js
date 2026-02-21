import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_carrera } from "../modelo/m_carrera.js";
import { m_departamento } from "../modelo/m_departamento.js";
import { u_carrera } from "../utilidades/u_carrera.js";

export class c_carrera {
    constructor() {
        this.carreras = [];
        this.departamentos = [];
        this.carreraActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.actor = null;
        
        // Estados de validación
        this.validaciones = {
            nombre: false,
            idDepartamento: false
        };
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    async inicializar() {
        try {
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Cargar departamentos primero (para el combo)
            await this.cargarDepartamentos();
            
            // Inicializar DataTable
            this.inicializarDataTable();
            
            // Cargar carreras
            await this.cargarCarreras();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
            
            // Inicializar combo input de departamentos
            this.inicializarComboDepartamentos();
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo de carreras: ${error}`);
        }
    }

    // Inicializar DataTable
    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaCarreras')) {
            $('#tablaCarreras').DataTable().destroy();
        }
        
        this.dataTable = $('#tablaCarreras').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [2] } // No ordenar por acciones
            ]
        });
    }

    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarDepartamentos() {
        try {
            this.departamentos = await m_departamento.obtenerDepartamentos();

            if(this.departamentos==[]) Alerta.notificar('No hay departamentos almacemados', 1500);
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar departamentos: ${error}`);
        }
    }
    
    async cargarCarreras() {
        try {
            const carrerasBackend = await m_carrera.obtenerCarreras();
            
            if (carrerasBackend && carrerasBackend.length > 0) {
                this.carreras = carrerasBackend.map(c => 
                    new m_carrera(
                        c.idCarrera,
                        c.nombreCarrera,
                        c.idDepartamento
                    )
                );
                
                this.actualizarTabla();
            } else {
                this.carreras = [];
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar carreras: ${error}`);
        }
    }

    // Actualizar tabla
    actualizarTabla() {
        u_carrera.actualizarTabla(
            this.dataTable, 
            this.carreras, 
            this.departamentos,
            (id, estado) => u_carrera.crearBotonesAccion(id, estado)
        );
    }

    // ============================================
    // CONFIGURACIÓN DE COMBO INPUT
    // ============================================
    
    inicializarComboDepartamentos() {
        u_carrera.inicializarComboDepartamentos(
            this.departamentos,
            (id, nombre) => {
                this.validaciones.idDepartamento = true;
                // Aplicar estilo de éxito al combo
                $('#comboDepartamentoCarrera').removeClass('border-danger').addClass('border-success');
            }
        );
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    
    configurarValidaciones() {
        // Validar nombre de la carrera
        $('#nombreCarrera').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.nombre = u_carrera.validarNombre(valor);
            u_utiles.colorearCampo(
                this.validaciones.nombre,
                '#nombreCarrera',
                '#errorNombreCarrera',
                'El nombre debe tener entre 5 y 100 caracteres'
            );
        });
        
        // La validación del departamento se maneja en el combo
    }

    configurarEventos() {
        // Botón guardar
        $('#btnGuardarCarrera').on('click', () => this.guardarCarrera());
        
        // Eventos de botones en la tabla (usando delegación)
        $(document).on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.editarCarrera(id);
        });
        
        $(document).on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.cambiarEstadoCarrera(id);
        });
        
        // Botón cancelar edición (delegación)
        $(document).on('click', '#btnCancelarEdicion', () => {
            this.cancelarEdicion();
        });
    }

    // ============================================
    // VALIDACIÓN DE FORMULARIO
    // ============================================
    
    validarFormulario() {
        // Verificar que el combo tenga un departamento seleccionado
        const idDepto = $('#comboDepartamentoCarrera').data('selected-id');
        this.validaciones.idDepartamento = idDepto !== undefined && idDepto !== null;
        
        // En modo edición, permitir campos vacíos pero validar los que tienen contenido
        if (this.modoEdicion) {
            const nombreValido = $('#nombreCarrera').val().trim() === '' || this.validaciones.nombre;
            return nombreValido && this.validaciones.idDepartamento;
        }
        
        // En modo nuevo, todos los campos son obligatorios
        return this.validaciones.nombre && this.validaciones.idDepartamento;
    }

    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarCarrera() {
        if (!this.validarFormulario()) {
            Alerta.advertencia(
                'Campos incompletos', 
                this.modoEdicion ? 
                'Complete correctamente los campos que desea actualizar' : 
                'Complete todos los campos correctamente'
            );
            return;
        }
        
        try {
            const datos = u_carrera.obtenerDatosFormulario();
            
            // Crear objeto carrera
            const carreraData = {
                nombreCarrera: datos.nombre,
                idDepartamento: datos.idDepartamento
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar carrera existente
                carreraData.idCarrera = this.carreraActual.idCarrera;
                resultado = await m_carrera.actualizaCarrera(carreraData);
            } else {
                // Insertar nueva carrera
                resultado = await m_carrera.insertaCarrera(carreraData);
            }
            
            if (resultado) {
                // Recargar carreras
                await this.cargarCarreras();
                
                // Limpiar formulario y resetear modo edición
                this.limpiarFormulario();
                this.cancelarEdicion();
                
                Alerta.exito(
                    this.modoEdicion ? 'Carrera actualizada' : 'Carrera creada',
                    `La carrera se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar la carrera: ${error}`);
        }
    }
    
    async editarCarrera(id) {
        try {
            const carrera = this.carreras.find(c => c.idCarrera == id);
            
            if (carrera) {
                this.modoEdicion = true;
                this.carreraActual = carrera;
                
                // Cargar datos en el formulario
                u_carrera.cargarFormularioEdicion(carrera, this.departamentos);
                u_carrera.configurarModoEdicion(true);
                
                // Actualizar validación del departamento
                this.validaciones.idDepartamento = true;
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cargar la carrera para editar: ${error}`);
        }
    }
    
    async cambiarEstadoCarrera(id) {
        try {
            const carrera = this.carreras.find(c => c.idCarrera == id);
            if (!carrera) return;
            
            const accion = carrera.habilitado ? 'deshabilitar' : 'habilitar';
            
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion} esta carrera?`
            );
            
            if (confirmacion) {
                let resultado;
                if (carrera.habilitado) {
                    resultado = await m_carrera.deshabilitaCarrera(id);
                } else {
                    resultado = await m_carrera.habilitaCarrera(id);
                }
                
                if (resultado) {
                    // Actualizar estado local
                    carrera.habilitado = carrera.habilitado ? 0 : 1;
                    
                    // Actualizar visualmente la fila
                    const fila = $(`#tablaCarreras tbody tr`).filter(function() {
                        return $(this).find('.btn-toggle-estado').data('id') == id;
                    });
                    
                    if (fila.length) {
                        u_carrera.actualizarEstadoFila(fila[0], carrera.habilitado);
                    }
                    
                    Alerta.exito('Éxito', `Carrera ${accion === 'deshabilitar' ? 'deshabilitada' : 'habilitada'} correctamente`);
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado de la carrera: ${error}`);
        }
    }
    
    cancelarEdicion() {
        this.modoEdicion = false;
        this.carreraActual = null;
        this.limpiarFormulario();
        u_carrera.configurarModoEdicion(false);
    }
    
    limpiarFormulario() {
        u_carrera.limpiarFormulario();
        
        // Resetear validaciones
        this.validaciones = {
            nombre: false,
            idDepartamento: false
        };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_carrera();
    await controlador.inicializar();
});