import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_departamento } from "../modelo/m_departamento.js";
import { m_carrera } from "../modelo/m_carrera.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_departamento } from "../utilidades/u_departamento.js";

export class c_departamento {
    constructor() {
        // Departamentos
        this.departamentos = [];
        this.departamentoActual = null;
        this.modoEdicionDepartamento = false;
        this.dataTableDepartamentos = null;
        
        // Carreras
        this.carreras = [];
        this.carreraActual = null;
        this.modoEdicionCarrera = false;
        this.dataTableCarreras = null;
        
        // Facultades (para el select de departamentos)
        this.facultades = [];
        
        // Departamentos (para el combo de carreras)
        this.departamentosParaCarreras = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            u_utiles.botonesNavegacionAdministrador();
            
            this.inicializarDataTables();
            await this.cargarFacultades();
            await this.cargarDepartamentos();
            await this.cargarCarreras();
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarComboDepartamentos(); // <-- Esto debe estar aquí
        } catch (error) {
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        // DataTable de departamentos
        if ($.fn.dataTable.isDataTable('#tablaDepartamentos')) {
            $('#tablaDepartamentos').DataTable().destroy();
        }
        this.dataTableDepartamentos = $('#tablaDepartamentos').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [2] }]
        });

        // DataTable de carreras
        if ($.fn.dataTable.isDataTable('#tablaCarreras')) {
            $('#tablaCarreras').DataTable().destroy();
        }
        this.dataTableCarreras = $('#tablaCarreras').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [3] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades() || [];
            u_departamento.cargarSelectFacultades('#facultadesDepartamento', this.facultades);
        } catch (error) {
            Alerta.error('Error', 'Fallo al cargar facultades');
            this.facultades = [];
        }
    }

    async cargarDepartamentos() {
        try {
            this.departamentos = await m_departamento.obtenerDepartamentos() || [];
            this.actualizarTablaDepartamentos();
            
            // Guardar copia para el combo de carreras
            this.departamentosParaCarreras = [...this.departamentos];
            this.configurarComboDepartamentos();
        } catch (error) {
            Alerta.error('Error', 'Fallo al cargar departamentos');
            this.departamentos = [];
        }
    }

    async cargarCarreras() {
        try {
            this.carreras = await m_carrera.obtenerCarreras() || [];
            this.actualizarTablaCarreras();
        } catch (error) {
            Alerta.error('Error', 'Fallo al cargar carreras');
            this.carreras = [];
        }
    }

    // ========== CONFIGURACIÓN ==========
    configurarValidaciones() {
        u_departamento.configurarValidaciones();
    }

    configurarComboDepartamentos() {
        u_departamento.configurarComboDepartamentos(
            this.departamentosParaCarreras,
            (id) => this.seleccionarDepartamentoEnCombo(id)
        );
    }

    seleccionarDepartamentoEnCombo(id) {
        $('#comboDepartamentoCarrera').data('id-seleccionado', id);
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Eventos de departamentos
        $('#btnGuardarDepartamento').on('click', () => this.guardarDepartamento());
        $(document).on('click', '.editar-departamento', (e) => {
            this.editarDepartamento($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.toggle-estado-departamento', (e) => {
            this.cambiarEstadoDepartamento($(e.currentTarget).data('id'));
        });
        
        // Eventos de carreras
        $('#btnGuardarCarrera').on('click', () => this.guardarCarrera());
        $(document).on('click', '.editar-carrera', (e) => {
            this.editarCarrera($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.toggle-estado-carrera', (e) => {
            this.cambiarEstadoCarrera($(e.currentTarget).data('id'));
        });
        
        // Botones cancelar
        $(document).on('click', '#btnCancelarEdicionDepartamento', () => {
            this.cancelarEdicionDepartamento();
        });
        $(document).on('click', '#btnCancelarEdicionCarrera', () => {
            this.cancelarEdicionCarrera();
        });
    }

    // ========== FUNCIONES PARA DEPARTAMENTOS ==========
    
    formularioDepartamentoEsValido() {
        const nombre = $('#nombreDepartamento').val().trim();
        const idFacultad = $('#facultadesDepartamento').val();
        
        if (this.modoEdicionDepartamento) {
            if (nombre && !u_departamento.validarNombre(nombre)) return false;
            if (idFacultad && idFacultad !== 'Ninguno' && !u_departamento.validarFacultad(idFacultad)) return false;
            return true;
        }
        
        return u_departamento.validarNombre(nombre) && u_departamento.validarFacultad(idFacultad);
    }

    async guardarDepartamento() {
        if (!this.formularioDepartamentoEsValido()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente los campos');
            return;
        }
        
        try {
            const datos = {
                nombreDepartamento: $('#nombreDepartamento').val().trim(),
                idFacultad: $('#facultadesDepartamento').val()
            };
            
            let resultado;
            if (this.modoEdicionDepartamento) {
                datos.idDepartamento = this.departamentoActual.idDepartamento;
                resultado = await m_departamento.actualizarDepartamento(datos);
            } else {
                resultado = await m_departamento.insertarDepartamento(datos);
            }
            
            if (resultado) {
                await this.cargarDepartamentos();
                this.limpiarFormularioDepartamento();
                this.cancelarEdicionDepartamento();
                Alerta.exito('Éxito', this.modoEdicionDepartamento ? 'Departamento actualizado' : 'Departamento creado');
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar el departamento');
        }
    }

    editarDepartamento(id) {
        const depto = this.departamentos.find(d => d.idDepartamento == id);
        if (!depto) return;
        
        this.modoEdicionDepartamento = true;
        this.departamentoActual = depto; console.log(depto.nombreDepartamento)
        
        $('#nombreDepartamento').val(depto.nombreDepartamento || '');
        $('#facultadesDepartamento').val(depto.idFacultad || 'Ninguno');
        
        u_departamento.configurarModoEdicion(true, 'departamento');
    }

    async cambiarEstadoDepartamento(id) {
        const depto = this.departamentos.find(d => d.idDepartamento == id);
        if (!depto) return;
        
        // Como no hay campo estado en m_departamento, usamos un toggle simple
        // Asumimos que el backend maneja esto o usamos eliminar si no hay estado
        const confirmacion = await Alerta.confirmar('Confirmar', '¿Cambiar estado de este departamento?');
        if (!confirmacion) return;
        
        try {
            // Por ahora solo mostramos un mensaje
            Alerta.exito('Éxito', 'Funcionalidad de estado en desarrollo');
        } catch (error) {
            Alerta.error('Error', 'No se pudo cambiar el estado');
        }
    }

    cancelarEdicionDepartamento() {
        this.modoEdicionDepartamento = false;
        this.departamentoActual = null;
        this.limpiarFormularioDepartamento();
        u_departamento.configurarModoEdicion(false, 'departamento');
    }

    limpiarFormularioDepartamento() {
        $('#formDepartamento')[0].reset();
        $('.errorMensaje').text('').hide();
        $('#formDepartamento input, #formDepartamento select').removeClass('border-success border-danger');
        $('#facultadesDepartamento').val('Ninguno');
    }

    actualizarTablaDepartamentos() {
        u_departamento.actualizarTablaDepartamentos(this.dataTableDepartamentos, this.departamentos, this.facultades);
    }

    // ========== FUNCIONES PARA CARRERAS ==========
    
    formularioCarreraEsValido() {
        const nombre = $('#nombreCarrera').val().trim();
        const idDepartamento = $('#comboDepartamentoCarrera').data('id-seleccionado');
        
        if (this.modoEdicionCarrera) {
            if (nombre && nombre.length < 3) return false;
            return true;
        }
        
        return nombre.length >= 3 && idDepartamento;
    }

    async guardarCarrera() {
        if (!this.formularioCarreraEsValido()) {
            Alerta.advertencia('Campos inválidos', 'Complete todos los campos correctamente');
            return;
        }
        
        try {
            const idDepartamento = $('#comboDepartamentoCarrera').data('id-seleccionado');
            const datos = {
                nombreCarrera: $('#nombreCarrera').val().trim(),
                idDepartamento: idDepartamento,
                estado: 'Habilitado'
            };
            
            let resultado;
            if (this.modoEdicionCarrera) {
                datos.idCarrera = this.carreraActual.idCarrera;
                resultado = await m_carrera.actualizaCarrera(datos);
            } else {
                resultado = await m_carrera.insertaCarrera(datos);
            }
            
            if (resultado) {
                await this.cargarCarreras();
                this.limpiarFormularioCarrera();
                this.cancelarEdicionCarrera();
                Alerta.exito('Éxito', this.modoEdicionCarrera ? 'Carrera actualizada' : 'Carrera creada');
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar la carrera');
        }
    }

    editarCarrera(id) {
        const carrera = this.carreras.find(c => c.idCarrera == id);
        if (!carrera) return;
        
        this.modoEdicionCarrera = true;
        this.carreraActual = carrera;
        
        $('#nombreCarrera').val(carrera.nombreCarrera || '');
        $('#comboDepartamentoCarrera').val(carrera.nombreDepartamento || '');
        
        // Buscar el nombre del departamento
        /*const depto = this.departamentosParaCarreras.find(d => d.idDepartamento == carrera.idDepartamento);
        if (depto) {
            $('#comboDepartamentoCarrera').val(depto.nombre);
            $('#comboDepartamentoCarrera').data('id-seleccionado', carrera.idDepartamento);
        }*/
        
        u_departamento.configurarModoEdicion(true, 'carrera');
    }

    async cambiarEstadoCarrera(id) {
        const carrera = this.carreras.find(c => c.idCarrera == id);
        if (!carrera) return;
        
        const nuevoEstado = carrera.estado == 1 ? 0 : 1;
        const accion = nuevoEstado == 1 ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion} esta carrera?`);
        if (!confirmacion) return;
        
        try {
            let resultado;
            if (nuevoEstado == 1) {
                resultado = await m_carrera.habilitaCarrera(id);
            } else {
                resultado = await m_carrera.deshabilitaCarrera(id);
            }
            
            if (resultado) {
                carrera.estado = nuevoEstado;
                this.actualizarTablaCarreras();
                Alerta.exito('Éxito', `Carrera ${accion}da`);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo ${accion} la carrera`);
        }
    }

    cancelarEdicionCarrera() {
        this.modoEdicionCarrera = false;
        this.carreraActual = null;
        this.limpiarFormularioCarrera();
        u_departamento.configurarModoEdicion(false, 'carrera');
    }

    limpiarFormularioCarrera() {
        $('#formCarrera')[0].reset();
        $('#comboDepartamentoCarrera').val('');
        $('#comboDepartamentoCarrera').data('id-seleccionado', null);
        $('#opcionesDepartamentosCarrera').empty().hide();
        $('.errorMensaje').text('').hide();
    }

    actualizarTablaCarreras() {
        u_departamento.actualizarTablaCarreras(this.dataTableCarreras, this.carreras);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_departamento();
    await controlador.inicializar();
});