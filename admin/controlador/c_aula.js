// c_aula.js - Controlador de aulas
import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_aula } from "../modelo/m_aula.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_aula } from "../utilidades/u_aula.js";

export class c_aula {
    constructor() {
        this.aulas = [];
        this.facultades = [];
        this.aulaActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.actor = null;
        
        // Estados de validación
        this.validaciones = {
            nombre: false,
            capacidad: false,
            idFacultad: false
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
            
            // Cargar facultades primero (para el select)
            await this.cargarFacultades();
            
            // Inicializar DataTable
            this.inicializarDataTable();
            
            // Cargar aulas
            await this.cargarAulas();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo de aulas: ${error}`);
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
                { orderable: false, targets: [3] } // No ordenar por acciones
            ]
        });
    }

    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades();
            
            if(this.facultades==[]) Alerta.notificarInfo('No hay facultades almacenadas', 1500);

            u_aula.cargarSelectFacultades(this.facultades);
            
        } catch (error) {
            this.facultades = [];
        }
    }
    
    async cargarAulas() {
        try {
            const aulasBackend = await m_aula.obtenerAulas();
            
            if (aulasBackend && aulasBackend.length > 0) {
                this.aulas = aulasBackend.map(a => 
                    new m_aula(
                        a.idAula,
                        a.nombreAula,
                        a.capacidad,
                        a.idFacultad
                    )
                );
                
                this.actualizarTabla();
            } else {
                this.aulas = [];
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar los datos: ${error}`)
        }
    }

    // Actualizar tabla
    actualizarTabla() {
        u_aula.actualizarTabla(
            this.dataTable, 
            this.aulas, 
            this.facultades,
            (id, estado) => u_aula.crearBotonesAccion(id, estado)
        );
        
        // Asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    // Asignar eventos a los botones de la tabla
    asignarEventosBotones() {
        // Usar delegación de eventos para los botones
        $(document).off('click', '.editar').on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.editarAula(id);
        });
        
        $(document).off('click', '.btn-toggle-estado').on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.cambiarEstadoAula(id);
        });
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    
    configurarValidaciones() {
        // Validar nombre del aula
        $('#nombreAula').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.nombre = u_aula.validarNombre(valor);
            u_utiles.colorearCampo(
                this.validaciones.nombre,
                '#nombreAula',
                '#errorNombreAula',
                'El nombre debe tener entre 5 y 100 caracteres'
            );
        });
        
        // Validar capacidad (el campo tiene ID capacidadAula pero es capacidad)
        $('#capacidadAula').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.capacidad = u_aula.validarCapacidad(valor);
            u_utiles.colorearCampo(
                this.validaciones.capacidad,
                '#capacidadAula',
                '#errorCapacidadAula',
                'La capacidad debe ser un número positivo'
            );
        });
        
        // Validar facultad seleccionada
        $('#facultadesAula').on('change', (e) => {
            const valor = $(e.target).val();
            this.validaciones.idFacultad = u_aula.validarFacultad(valor);
            u_utiles.colorearCampo(
                this.validaciones.idFacultad,
                '#facultadesAula',
                '#errorFacultadesAula',
                'Seleccione una facultad'
            );
        });
    }

    configurarEventos() {
        // Botón guardar
        $('#btnGuardarAula').on('click', () => this.guardarAula());
        
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
            const nombreValido = $('#nombreAula').val().trim() === '' || this.validaciones.nombre;
            const capacidadValida = $('#capacidadAula').val().trim() === '' || this.validaciones.capacidad;
            const facultadValida = $('#facultadesAula').val() === 'Ninguno' || this.validaciones.idFacultad;
            return nombreValido && capacidadValida && facultadValida;
        }
        
        // En modo nuevo, todos los campos son obligatorios
        return this.validaciones.nombre && this.validaciones.capacidad && this.validaciones.idFacultad;
    }

    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarAula() {
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
            const datos = u_aula.obtenerDatosFormulario();
            
            // Crear objeto aula
            const aulaData = {
                nombreAula: datos.nombre,
                capacidad: parseInt(datos.capacidad),
                idFacultad: datos.idFacultad === 'Ninguno' ? null : datos.idFacultad
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar aula existente
                aulaData.idAula = this.aulaActual.idAula;
                resultado = await m_aula.actualizarAula(aulaData);
            } else {
                // Insertar nueva aula
                resultado = await m_aula.insertarAula(aulaData);
            }
            
            if (resultado) {
                // Recargar aulas
                await this.cargarAulas();
                
                // Limpiar formulario y resetear modo edición
                this.limpiarFormulario();
                this.cancelarEdicion();
                
                Alerta.exito(
                    this.modoEdicion ? 'Aula actualizada' : 'Aula creada',
                    `El aula se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar el aula: ${error}`);
        }
    }
    
    async editarAula(id) {
        try {
            const aula = this.aulas.find(a => a.idAula == id);
            
            if (aula) {
                this.modoEdicion = true;
                this.aulaActual = aula;
                
                // Cargar datos en el formulario
                u_aula.cargarFormularioEdicion(aula, this.facultades);
                u_aula.configurarModoEdicion(true);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cargar el aula para editar: ${error}`);
        }
    }
    
    async cambiarEstadoAula(id) {
        try {
            const aula = this.aulas.find(a => a.idAula == id);
            if (!aula) return;
            
            // Determinar el estado actual (asumiendo que el modelo tiene un campo habilitado)
            const habilitado = aula.habilitado !== 0;
            const accion = habilitado ? 'deshabilitar' : 'habilitar';
            
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion} esta aula?`
            );
            
            if (confirmacion) {
                let resultado;
                if (habilitado) {
                    resultado = await m_aula.deshabilitarAula(id);
                } else {
                    resultado = await m_aula.habilitarAula(id);
                }
                
                if (resultado) {
                    // Actualizar estado local
                    aula.habilitado = habilitado ? 0 : 1;
                    
                    // Actualizar visualmente la fila
                    const fila = $(`#tablaAulas tbody tr`).filter(function() {
                        return $(this).find('.btn-toggle-estado').data('id') == id;
                    });
                    
                    if (fila.length) {
                        u_aula.actualizarEstadoFila(fila[0], !habilitado);
                    }
                    
                    Alerta.exito('Éxito', `Aula ${accion === 'deshabilitar' ? 'deshabilitada' : 'habilitada'} correctamente`);
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado del aula: ${error}`);
        }
    }
    
    cancelarEdicion() {
        this.modoEdicion = false;
        this.aulaActual = null;
        this.limpiarFormulario();
        u_aula.configurarModoEdicion(false);
    }
    
    limpiarFormulario() {
        u_aula.limpiarFormulario();
        
        // Resetear validaciones
        this.validaciones = {
            nombre: false,
            capacidad: false,
            idFacultad: false
        };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_aula();
    await controlador.inicializar();
});