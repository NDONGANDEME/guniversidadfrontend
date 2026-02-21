// c_semestre.js - Controlador de semestres
import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_semestre } from "../modelo/m_semestre.js";
import { u_semestre } from "../utilidades/u_semestre.js";

export class c_semestre 
{
    constructor() {
        this.semestres = [];
        this.semestreActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.actor = null;
        
        // Estados de validación
        this.validaciones = {
            numero: false,
            tipo: false
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
            
            // Cargar actor
            const usuarioActual = sessionStorage.getItem('usuarioActual');
            this.actor = usuarioActual ? JSON.parse(usuarioActual) : null;
            
            // Inicializar DataTable
            this.inicializarDataTable();
            
            // Cargar semestres
            await this.cargarSemestres();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo de semestres: ${error}`);
        }
    }

    // Inicializar DataTable
    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('.tabla')) {
            $('.tabla').DataTable().destroy();
        }
        
        this.dataTable = $('.tabla').DataTable({
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
    
    async cargarSemestres() {
        try {
            const semestresBackend = await m_semestre.obtenerSemestres();
            
            if (semestresBackend && semestresBackend.length > 0) {
                this.semestres = semestresBackend.map(s => 
                    new m_semestre(
                        s.idSemestre,
                        s.numeroSemestre,
                        s.tipoSemestre
                    )
                );
                
                this.actualizarTabla();
            } else {
                this.semestres = [];
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar semestres: ${error}`);
        }
    }

    // Actualizar tabla
    actualizarTabla() {
        u_semestre.actualizarTabla(
            this.dataTable, 
            this.semestres,
            (id, estado) => u_semestre.crearBotonesAccion(id, estado)
        );
        
        // Asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    // Asignar eventos a los botones de la tabla
    asignarEventosBotones() {
        // Usar delegación de eventos para los botones
        $(document).off('click', '.editar').on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.editarSemestre(id);
        });
        
        $(document).off('click', '.btn-toggle-estado').on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.cambiarEstadoSemestre(id);
        });
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    
    configurarValidaciones() {
        // Validar número de semestre
        $('#numeroSemestre').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.numero = u_semestre.validarNumero(valor);
            u_utiles.colorearCampo(
                this.validaciones.numero,
                '#numeroSemestre',
                '#errorNumeroSemestre',
                'El número debe ser un entero positivo'
            );
        });
        
        // Validar tipo de semestre
        $('#tipoSemestre').on('change', (e) => {
            const valor = $(e.target).val();
            this.validaciones.tipo = u_semestre.validarTipo(valor);
            u_utiles.colorearCampo(
                this.validaciones.tipo,
                '#tipoSemestre',
                '#errortipoSemestre',
                'Seleccione un tipo de semestre'
            );
        });
    }

    configurarEventos() {
        // Botón guardar
        $('#btnGuardarSemestre').on('click', () => this.guardarSemestre());
        
        // Botón cancelar edición (delegación)
        $(document).on('click', '#btnCancelarEdicion', () => {
            this.cancelarEdicion();
        });
    }

    // ============================================
    // VALIDACIÓN DE FORMULARIO
    // ============================================
    
    validarFormulario() {
        // En modo edición, permitir campos vacíos pero validar los que tienen contenido
        if (this.modoEdicion) {
            const numeroValido = $('#numeroSemestre').val().trim() === '' || this.validaciones.numero;
            const tipoValido = $('#tipoSemestre').val() === 'Ninguno' || this.validaciones.tipo;
            return numeroValido && tipoValido;
        }
        
        // En modo nuevo, todos los campos son obligatorios
        return this.validaciones.numero && this.validaciones.tipo;
    }

    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarSemestre() {
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
            const datos = u_semestre.obtenerDatosFormulario();
            
            // Crear objeto semestre
            const semestreData = {
                numeroSemestre: parseInt(datos.numero),
                tipoSemestre: datos.tipo
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar semestre existente
                semestreData.idSemestre = this.semestreActual.idSemestre;
                resultado = await m_semestre.actualizarSemestre(semestreData);
            } else {
                // Insertar nuevo semestre
                resultado = await m_semestre.insertarSemestre(semestreData);
            }
            
            if (resultado) {
                // Recargar semestres
                await this.cargarSemestres();
                
                // Limpiar formulario y resetear modo edición
                this.limpiarFormulario();
                this.cancelarEdicion();
                
                Alerta.exito(
                    this.modoEdicion ? 'Semestre actualizado' : 'Semestre creado',
                    `El semestre se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar el semestre: ${error}`);
        }
    }
    
    async editarSemestre(id) {
        try {
            const semestre = this.semestres.find(s => s.idSemestre == id);
            
            if (semestre) {
                this.modoEdicion = true;
                this.semestreActual = semestre;
                
                // Cargar datos en el formulario
                u_semestre.cargarFormularioEdicion(semestre);
                u_semestre.configurarModoEdicion(true);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cargar el semestre para editar: ${error}`);
        }
    }
    
    async cambiarEstadoSemestre(id) {
        try {
            const semestre = this.semestres.find(s => s.idSemestre == id);
            if (!semestre) return;
            
            // Determinar el estado actual (asumiendo que el modelo tiene un campo habilitado)
            const habilitado = semestre.habilitado !== 0;
            const accion = habilitado ? 'deshabilitar' : 'habilitar';
            
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion} este semestre?`
            );
            
            if (confirmacion) {
                let resultado;
                if (habilitado) {
                    resultado = await m_semestre.deshabilitarSemestre(id);
                } else {
                    resultado = await m_semestre.habilitarSemestre(id);
                }
                
                if (resultado) {
                    // Actualizar estado local
                    semestre.habilitado = habilitado ? 0 : 1;
                    
                    // Actualizar visualmente la fila
                    const fila = $(`#tablaSemestres tbody tr`).filter(function() {
                        return $(this).find('.btn-toggle-estado').data('id') == id;
                    });
                    
                    if (fila.length) {
                        u_semestre.actualizarEstadoFila(fila[0], !habilitado);
                    }
                    
                    Alerta.exito('Éxito', `Semestre ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'} correctamente`);
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado del semestre: ${error}`);
        }
    }
    
    cancelarEdicion() {
        this.modoEdicion = false;
        this.semestreActual = null;
        this.limpiarFormulario();
        u_semestre.configurarModoEdicion(false);
    }
    
    limpiarFormulario() {
        u_semestre.limpiarFormulario();
        
        // Resetear validaciones
        this.validaciones = {
            numero: false,
            tipo: false
        };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_semestre();
    await controlador.inicializar();
});