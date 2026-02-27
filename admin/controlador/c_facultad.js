import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { m_aula } from "../modelo/m_aula.js";
import { u_facultad } from "../utilidades/u_facultad.js";

export class c_facultad {
    constructor() {
        // Facultades
        this.facultades = [];
        this.facultadActual = null;
        this.modoEdicionFacultad = false;
        this.dataTableFacultades = null;
        
        // Aulas
        this.aulas = [];
        this.aulaActual = null;
        this.modoEdicionAula = false;
        this.dataTableAulas = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            this.inicializarDataTables();
            await this.cargarFacultades();
            await this.cargarAulas();
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        // DataTable de facultades
        if ($.fn.dataTable.isDataTable('#tablaFacultades')) {
            $('#tablaFacultades').DataTable().destroy();
        }
        this.dataTableFacultades = $('#tablaFacultades').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [3] }]
        });

        // DataTable de aulas
        if ($.fn.dataTable.isDataTable('#tablaAula')) {
            $('#tablaAula').DataTable().destroy();
        }
        this.dataTableAulas = $('#tablaAula').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [4] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            const datos = await m_facultad.obtenerFacultades();
            this.facultades = datos || [];
            this.actualizarTablaFacultades();
            this.cargarFacultadesEnSelect(); // Para el select de aulas
        } catch (error) {
            Alerta.error('Error', 'Fallo al cargar facultades');
            this.facultades = [];
        }
    }

    async cargarAulas() {
        try {
            const datos = await m_aula.obtenerAulas();
            this.aulas = datos || [];
            this.actualizarTablaAulas();
        } catch (error) {
            Alerta.notificarError(`Fallo al cargar aulas: ${error}`, 1500);
            this.aulas = [];
        }
    }

    cargarFacultadesEnSelect() {
        const select = $('#facultadesAula');
        select.empty();
        select.append('<option value="">Seleccione...</option>');
        
        this.facultades.forEach(f => {
            select.append(`<option value="${f.idFacultad}">${f.nombreFacultad}</option>`);
        });
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_facultad.configurarValidaciones();
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Eventos de facultades
        $('#btnGuardarFacultad').on('click', () => this.guardarFacultad());
        $(document).on('click', '.editar-facultad', (e) => {
            this.editarFacultad($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.toggle-estado-facultad', (e) => {
            this.cambiarEstadoFacultad($(e.currentTarget).data('id'));
        });
        
        // Eventos de aulas
        $('#btnGuardarAula').on('click', () => this.guardarAula());
        $(document).on('click', '.editar-aula', (e) => {
            this.editarAula($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.toggle-estado-aula', (e) => {
            this.cambiarEstadoAula($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.eliminar-aula', (e) => {
            this.eliminarAula($(e.currentTarget).data('id'));
        });
        
        // Botones cancelar
        $(document).on('click', '#btnCancelarEdicionFacultad', () => {
            this.cancelarEdicionFacultad();
        });
        $(document).on('click', '#btnCancelarEdicionAula', () => {
            this.cancelarEdicionAula();
        });
    }

    // ========== FUNCIONES PARA FACULTADES ==========
    
    formularioFacultadEsValido() {
        const nombre = $('#nombreFacultad').val().trim();
        const direccion = $('#direccionFacultad').val().trim();
        const correo = $('#correoFacultad').val().trim();
        const telefono = $('#telefonoFacultad').val().trim();
        
        if (this.modoEdicionFacultad) {
            if (nombre && !u_facultad.validarNombre(nombre)) return false;
            if (direccion && !u_facultad.validarDireccion(direccion)) return false;
            if (correo && !u_facultad.validarCorreo(correo)) return false;
            if (telefono && !u_facultad.validarTelefono(telefono)) return false;
            return true;
        }
        
        return u_facultad.validarNombre(nombre) && 
               u_facultad.validarDireccion(direccion) && 
               (u_facultad.validarCorreo(correo) || u_facultad.validarTelefono(telefono));
    }

    async guardarFacultad() {
        if (!this.formularioFacultadEsValido()) {
            Alerta.notificarAdvertencia('Complete correctamente los campos', 1500);
            return;
        }
        
        try {
            const datos = {
                nombreFacultad: $('#nombreFacultad').val().trim(),
                direccionFacultad: $('#direccionFacultad').val().trim(),
                correo: $('#correoFacultad').val().trim(),
                telefono: $('#telefonoFacultad').val().trim()
            };
            
            let resultado;
            if (this.modoEdicionFacultad) {
                datos.idFacultad = this.facultadActual.idFacultad;
                resultado = await m_facultad.actualizarFacultad(datos);
            } else {
                resultado = await m_facultad.insertarFacultad(datos);
            }
            
            if (resultado) {
                await this.cargarFacultades();
                this.limpiarFormularioFacultad();
                this.cancelarEdicionFacultad();
                Alerta.notificarExito(this.modoEdicionFacultad ? 'Facultad actualizada' : 'Facultad creada' ,1500)
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar la facultad');
        }
    }

    editarFacultad(id) {
        const facultad = this.facultades.find(f => f.idFacultad == id);
        if (!facultad) return;
        
        this.modoEdicionFacultad = true;
        this.facultadActual = facultad;
        
        $('#nombreFacultad').val(facultad.nombreFacultad || '');
        $('#direccionFacultad').val(facultad.direccionFacultad || '');
        $('#correoFacultad').val(facultad.correo || '');
        $('#telefonoFacultad').val(facultad.telefono || '');
        
        u_facultad.configurarModoEdicion(true, 'facultad');
    }

    /*async cambiarEstadoFacultad(id) {
        const facultad = this.facultades.find(f => f.idFacultad == id);
        if (!facultad) return;
        
        const nuevoEstado = facultad.habilitado == 1 ? 0 : 1;
        const accion = nuevoEstado == 1 ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion} esta facultad?`);
        if (!confirmacion) return;
        
        try {
            let resultado;
            if (nuevoEstado == 1) {
                resultado = await m_facultad.habilitarFacultad(id);
            } else {
                resultado = await m_facultad.deshabilitarFacultad(id);
            }
            
            if (resultado) {
                facultad.habilitado = nuevoEstado;
                this.actualizarTablaFacultades();
                Alerta.exito('Éxito', `Facultad ${accion}da`);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo ${accion} la facultad`);
        }
    }*/

    cancelarEdicionFacultad() {
        this.modoEdicionFacultad = false;
        this.facultadActual = null;
        this.limpiarFormularioFacultad();
        u_facultad.configurarModoEdicion(false, 'facultad');
    }

    limpiarFormularioFacultad() {
        $('#formFacultad')[0].reset();
        $('.errorMensaje').text('').hide();
        $('#formFacultad input').removeClass('border-success border-danger');
    }

    actualizarTablaFacultades() {
        u_facultad.actualizarTablaFacultades(this.dataTableFacultades, this.facultades);
    }

    // ========== FUNCIONES PARA AULAS ==========
    
    formularioAulaEsValido() {
        const nombre = $('#nombreAula').val().trim();
        const capacidad = $('#capacidadAula').val();
        const idFacultad = $('#facultadesAula').val();
        
        if (this.modoEdicionAula) {
            if (nombre && nombre.length < 2) return false;
            if (capacidad && capacidad <= 0) return false;
            return true;
        }
        
        return nombre.length >= 2 && capacidad > 0 && idFacultad;
    }

    async guardarAula() {
        if (!this.formularioAulaEsValido()) {
            Alerta.notificarAdvertencia('Complete todos los campos correctamente', 1500);
            return;
        }
        
        try {
            const datos = {
                nombreAula: $('#nombreAula').val().trim(),
                capacidad: $('#capacidadAula').val(),
                idFacultad: $('#facultadesAula').val(),
                estado: 'Habilitado'
            };
            
            let resultado;
            if (this.modoEdicionAula) {
                datos.idAula = this.aulaActual.idAula;
                resultado = await m_aula.actualizarAula(datos);
            } else {
                resultado = await m_aula.insertarAula(datos);
            }
            
            if (resultado) {
                await this.cargarAulas();
                this.limpiarFormularioAula();
                this.cancelarEdicionAula();
                Alerta.notificarExito(this.modoEdicionAula ? 'Aula actualizada' : 'Aula creada', 1500);
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar el aula');
        }
    }

    editarAula(id) {
        const aula = this.aulas.find(a => a.idAula == id);
        if (!aula) return;
        
        this.modoEdicionAula = true;
        this.aulaActual = aula;
        
        $('#nombreAula').val(aula.nombreAula || '');
        $('#capacidadAula').val(aula.capacidad || '');
        $('#facultadesAula').val(aula.idFacultad || '');
        
        u_facultad.configurarModoEdicion(true, 'aula');
    }

    /*async cambiarEstadoAula(id) {
        const aula = this.aulas.find(a => a.idAula == id);
        if (!aula) return;
        
        const nuevoEstado = aula.estado == 1 ? 0 : 1;
        const accion = nuevoEstado == 1 ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion} esta aula?`);
        if (!confirmacion) return;
        
        try {
            let resultado;
            if (nuevoEstado == 1) {
                resultado = await m_aula.habilitarAula(id);
            } else {
                resultado = await m_aula.deshabilitarAula(id);
            }
            
            if (resultado) {
                aula.estado = nuevoEstado;
                this.actualizarTablaAulas();
                Alerta.exito('Éxito', `Aula ${accion}da`);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo ${accion} el aula`);
        }
    }*/

    async eliminarAula(id) {
        const confirmacion = await Alerta.confirmar('Confirmar', '¿Eliminar esta aula permanentemente?');
        if (!confirmacion) return;
        
        try {
            const resultado = await m_aula.eliminarAula(id);
            if (resultado) {
                this.aulas = this.aulas.filter(a => a.idAula != id);
                this.actualizarTablaAulas();
                Alerta.exito('Éxito', 'Aula eliminada');
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudo eliminar el aula');
        }
    }

    cancelarEdicionAula() {
        this.modoEdicionAula = false;
        this.aulaActual = null;
        this.limpiarFormularioAula();
        u_facultad.configurarModoEdicion(false, 'aula');
    }

    limpiarFormularioAula() {
        $('#formAula')[0].reset();
        $('.errorMensaje').text('').hide();
        $('#formAula input, #formAula select').removeClass('border-success border-danger');
    }

    actualizarTablaAulas() {
        u_facultad.actualizarTablaAulas(this.dataTableAulas, this.aulas, this.facultades);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_facultad();
    await controlador.inicializar();
});