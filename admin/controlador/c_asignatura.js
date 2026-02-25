import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_asignatura } from "../modelo/m_asignatura.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_asignatura } from "../utilidades/u_asignatura.js";

export class c_asignatura {
    constructor() {
        // Asignaturas
        this.asignaturas = [];
        this.asignaturaActual = null;
        this.modoEdicion = false;
        this.dataTableAsignaturas = null;
        
        // Facultades
        this.facultades = [];
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
            await this.cargarAsignaturas();
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        // DataTable de asignaturas
        if ($.fn.dataTable.isDataTable('#tablaAsignaturas')) {
            $('#tablaAsignaturas').DataTable().destroy();
        }
        this.dataTableAsignaturas = $('#tablaAsignaturas').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [4] }] // La columna de acciones no se ordena
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            const datos = await m_facultad.obtenerFacultades();
            this.facultades = datos || [];
            u_asignatura.cargarFacultadesEnSelect(this.facultades);
        } catch (error) {
            console.error('Error al cargar facultades:', error);
            Alerta.error('Error', 'Fallo al cargar facultades');
            this.facultades = [];
        }
    }

    async cargarAsignaturas() {
        try {
            const datos = await m_asignatura.obtenerAsignaturas();
            this.asignaturas = datos || [];
            this.actualizarTablaAsignaturas();
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
            Alerta.error('Error', 'Fallo al cargar asignaturas');
            this.asignaturas = [];
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_asignatura.configurarValidaciones();
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Guardar asignatura
        $('#btnGuardarAsignatura').on('click', () => this.guardarAsignatura());
        
        // Editar asignatura
        $(document).on('click', '.editar-asignatura', (e) => {
            this.editarAsignatura($(e.currentTarget).data('id'));
        });
        
        // Cancelar edición
        $(document).on('click', '#btnCancelarEdicionAsignatura', () => {
            this.cancelarEdicion();
        });
        
        // Cuando cambia la facultad, actualizar vista previa del código (opcional)
        $('#facultadesDepartamento').on('change', () => {
            if (!this.modoEdicion && this.formularioAsignaturaEsValido(true)) {
                this.mostrarVistaPreviaCodigo();
            }
        });
        
        $('#nombreAsignatura').on('input', () => {
            if (!this.modoEdicion && this.formularioAsignaturaEsValido(true)) {
                this.mostrarVistaPreviaCodigo();
            }
        });
    }

    // ========== FUNCIONES PARA ASIGNATURAS ==========
    
    formularioAsignaturaEsValido(parcial = false) {
        const nombre = $('#nombreAsignatura').val().trim();
        const descripcion = $('#descripcionAsignatura').val().trim();
        const idFacultad = $('#facultadesDepartamento').val();
        
        // Si es validación parcial (solo para vista previa)
        if (parcial) {
            if (nombre && !u_asignatura.validarNombre(nombre)) return false;
            if (idFacultad && !u_asignatura.validarFacultad(idFacultad)) return false;
            return true;
        }
        
        // Si estamos en modo edición
        if (this.modoEdicion) {
            if (nombre && !u_asignatura.validarNombre(nombre)) return false;
            if (descripcion && !u_asignatura.validarDescripcion(descripcion)) return false;
            if (idFacultad && !u_asignatura.validarFacultad(idFacultad)) return false;
            return true;
        }
        
        // Si es nuevo, todos los campos son obligatorios
        return u_asignatura.validarNombre(nombre) && 
               u_asignatura.validarDescripcion(descripcion) && 
               u_asignatura.validarFacultad(idFacultad);
    }

    mostrarVistaPreviaCodigo() {
        const nombre = $('#nombreAsignatura').val().trim();
        const idFacultad = $('#facultadesDepartamento').val();
        
        if (!nombre || !idFacultad || idFacultad === 'Ninguno') {
            return;
        }
        
        // Buscar la facultad seleccionada
        const facultad = this.facultades.find(f => f.idFacultad == idFacultad);
        if (!facultad) return;
        
        // Encontrar el siguiente número para el código
        const siguienteNumero = u_asignatura.encontrarSiguienteNumero(this.asignaturas, idFacultad);
        
        // Generar código de ejemplo
        const codigoEjemplo = u_asignatura.generarCodigoAsignatura(
            facultad.nombreFacultad,
            nombre,
            siguienteNumero
        );
        
        // Mostrar el código de ejemplo (podrías mostrarlo en algún lugar)
        console.log('Vista previa del código:', codigoEjemplo);
        // Opcional: mostrar en un pequeño texto debajo del formulario
    }

    async guardarAsignatura() {
        if (!this.formularioAsignaturaEsValido()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente los campos');
            return;
        }
        
        try {
            const nombre = $('#nombreAsignatura').val().trim();
            const descripcion = $('#descripcionAsignatura').val().trim();
            const idFacultad = $('#facultadesDepartamento').val();
            
            // Buscar la facultad seleccionada
            const facultad = this.facultades.find(f => f.idFacultad == idFacultad);
            
            let codigoAsignatura;
            
            if (this.modoEdicion) {
                // En modo edición, mantener el código existente
                codigoAsignatura = this.asignaturaActual.codigoAsignatura;
            } else {
                // Generar código para nueva asignatura
                const siguienteNumero = u_asignatura.encontrarSiguienteNumero(this.asignaturas, idFacultad);
                codigoAsignatura = u_asignatura.generarCodigoAsignatura(
                    facultad.nombreFacultad,
                    nombre,
                    siguienteNumero
                );
            }
            
            const datos = {
                codigoAsignatura: codigoAsignatura,
                nombreAsignatura: nombre,
                descripcion: descripcion,
                idFacultad: idFacultad
            };
            
            let resultado;
            if (this.modoEdicion) {
                datos.idAsignatura = this.asignaturaActual.idAsignatura;
                resultado = await m_asignatura.actualizarAsignatura(datos);
            } else {
                resultado = await m_asignatura.insertarAsignatura(datos);
            }
            
            if (resultado) {
                await this.cargarAsignaturas();
                this.limpiarFormulario();
                this.cancelarEdicion();
                Alerta.exito('Éxito', this.modoEdicion ? 'Asignatura actualizada' : 'Asignatura creada');
            }
        } catch (error) {
            console.error('Error al guardar asignatura:', error);
            Alerta.error('Error', 'No se pudo guardar la asignatura');
        }
    }

    editarAsignatura(id) {
        const asignatura = this.asignaturas.find(a => a.idAsignatura == id);
        if (!asignatura) return;
        
        this.modoEdicion = true;
        this.asignaturaActual = asignatura;
        
        $('#nombreAsignatura').val(asignatura.nombreAsignatura || '');
        $('#descripcionAsignatura').val(asignatura.descripcion || '');
        $('#facultadesDepartamento').val(asignatura.idFacultad || 'Ninguno');
        
        u_asignatura.configurarModoEdicion(true);
    }

    cancelarEdicion() {
        this.modoEdicion = false;
        this.asignaturaActual = null;
        this.limpiarFormulario();
        u_asignatura.configurarModoEdicion(false);
    }

    limpiarFormulario() {
        u_asignatura.limpiarFormulario();
    }

    actualizarTablaAsignaturas() {
        u_asignatura.actualizarTablaAsignaturas(this.dataTableAsignaturas, this.asignaturas, this.facultades);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_asignatura();
    await controlador.inicializar();
});