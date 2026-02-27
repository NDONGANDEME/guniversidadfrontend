import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_curso } from "../modelo/m_curso.js";
import { m_semestre } from "../modelo/m_semestre.js";
import { u_curso } from "../utilidades/u_curso.js";

export class c_curso {
    constructor() {
        // Cursos
        this.cursos = [];
        this.cursoActual = null;
        this.modoEdicionCurso = false;
        this.dataTableCursos = null;
        
        // Semestres
        this.semestres = [];
        this.semestreActual = null;
        this.modoEdicionSemestre = false;
        this.dataTableSemestres = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            this.inicializarDataTables();
            await this.cargarCursos();
            await this.cargarSemestres();
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        // DataTable de cursos
        if ($.fn.dataTable.isDataTable('#tablaCursos')) {
            $('#tablaCursos').DataTable().destroy();
        }
        this.dataTableCursos = $('#tablaCursos').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [2] }] // La columna de acciones no se ordena
        });

        // DataTable de semestres
        if ($.fn.dataTable.isDataTable('#tablaSemestres')) {
            $('#tablaSemestres').DataTable().destroy();
        }
        this.dataTableSemestres = $('#tablaSemestres').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [3] }] // La columna de acciones no se ordena
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarCursos() {
        try {
            const datos = await m_curso.obtenerCursos();
            this.cursos = datos || [];
            this.actualizarTablaCursos();
            u_curso.cargarCursosEnSelect(this.cursos); // Para el select de semestres
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            Alerta.error('Error', 'Fallo al cargar cursos');
            this.cursos = [];
        }
    }

    async cargarSemestres() {
        try {
            const datos = await m_semestre.obtenerSemestres();
            this.semestres = datos || [];
            this.actualizarTablaSemestres();
        } catch (error) {
            console.error('Error al cargar semestres:', error);
            Alerta.error('Error', 'Fallo al cargar semestres');
            this.semestres = [];
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_curso.configurarValidaciones();
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Eventos de cursos
        $('#btnGuardarCurso').on('click', () => this.guardarCurso());
        $(document).on('click', '.editar-curso', (e) => {
            this.editarCurso($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.toggle-estado-curso', (e) => {
            this.cambiarEstadoCurso($(e.currentTarget).data('id'));
        });
        
        // Eventos de semestres
        $('#btnGuardarSemestre').on('click', () => this.guardarSemestre());
        $(document).on('click', '.editar-semestre', (e) => {
            this.editarSemestre($(e.currentTarget).data('id'));
        });
        $(document).on('click', '.toggle-estado-semestre', (e) => {
            this.cambiarEstadoSemestre($(e.currentTarget).data('id'));
        });
        
        // Botones cancelar
        $(document).on('click', '#btnCancelarEdicionCurso', () => {
            this.cancelarEdicionCurso();
        });
        $(document).on('click', '#btnCancelarEdicionSemestre', () => {
            this.cancelarEdicionSemestre();
        });
    }

    // ========== FUNCIONES PARA CURSOS ==========
    
    formularioCursoEsValido() {
        const nombre = $('#nombreCurso').val().trim();
        const nivel = $('#nivelCurso').val();
        
        // Si estamos en modo edición, los campos pueden estar vacíos (no se modifican)
        if (this.modoEdicionCurso) {
            if (nombre && !u_curso.validarNombre(nombre)) return false;
            if (nivel && !u_curso.validarNivel(nivel)) return false;
            return true;
        }
        
        // Si es nuevo, todos los campos son obligatorios
        return u_curso.validarNombre(nombre) && u_curso.validarNivel(nivel);
    }

    async guardarCurso() {
        if (!this.formularioCursoEsValido()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente los campos');
            return;
        }
        
        try {
            const datos = {
                nombreCurso: $('#nombreCurso').val().trim(),
                nivel: $('#nivelCurso').val()
            };
            
            let resultado;
            if (this.modoEdicionCurso) {
                datos.idCurso = this.cursoActual.idCurso;
                resultado = await m_curso.actualizarCurso(datos);
            } else {
                resultado = await m_curso.insertarCurso(datos);
            }
            
            if (resultado) {
                await this.cargarCursos(); // Recargar cursos
                await this.cargarSemestres(); // Recargar semestres por si acaso
                this.limpiarFormularioCurso();
                this.cancelarEdicionCurso();
                Alerta.exito('Éxito', this.modoEdicionCurso ? 'Curso actualizado' : 'Curso creado');
            }
        } catch (error) {
            console.error('Error al guardar curso:', error);
            Alerta.error('Error', 'No se pudo guardar el curso');
        }
    }

    editarCurso(id) {
        const curso = this.cursos.find(c => c.idCurso == id);
        if (!curso) return;
        
        this.modoEdicionCurso = true;
        this.cursoActual = curso;
        
        $('#nombreCurso').val(curso.nombreCurso || '');
        $('#nivelCurso').val(curso.nivel || '');
        
        u_curso.configurarModoEdicion(true, 'curso');
    }

    async cambiarEstadoCurso(id) {
        const curso = this.cursos.find(c => c.idCurso == id);
        if (!curso) return;
        
        const nuevoEstado = curso.habilitado == 1 ? 0 : 1;
        const accion = nuevoEstado == 1 ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion} este curso?`);
        if (!confirmacion) return;
        
        try {
            // Aquí llamarías a una función del backend para cambiar el estado
            // Por ahora, simulamos que funciona
            curso.habilitado = nuevoEstado;
            this.actualizarTablaCursos();
            Alerta.exito('Éxito', `Curso ${accion}do`);
        } catch (error) {
            console.error(`Error al ${accion} curso:`, error);
            Alerta.error('Error', `No se pudo ${accion} el curso`);
        }
    }

    cancelarEdicionCurso() {
        this.modoEdicionCurso = false;
        this.cursoActual = null;
        this.limpiarFormularioCurso();
        u_curso.configurarModoEdicion(false, 'curso');
    }

    limpiarFormularioCurso() {
        $('#formCurso')[0].reset();
        $('.errorMensaje').text('').hide();
        $('#formCurso input').removeClass('border-success border-danger');
    }

    actualizarTablaCursos() {
        u_curso.actualizarTablaCursos(this.dataTableCursos, this.cursos);
    }

    // ========== FUNCIONES PARA SEMESTRES ==========
    
    formularioSemestreEsValido() {
        const numero = $('#numeroSemestre').val();
        const idCurso = $('#cursoSemestre').val();
        
        // Si estamos en modo edición
        if (this.modoEdicionSemestre) {
            if (numero && (numero <= 0 || numero >= 15)) return false;
            if (idCurso && idCurso === 'Ninguno') return false;
            return true;
        }
        
        // Si es nuevo, todos los campos son obligatorios
        return numero > 0 && numero < 15 && idCurso && idCurso !== 'Ninguno';
    }

    async guardarSemestre() {
        if (!this.formularioSemestreEsValido()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente los campos');
            return;
        }
        
        try {
            const datos = {
                numeroSemestre: $('#numeroSemestre').val(),
                tipoSemestre: u_curso.determinarTipoSemestre($('#numeroSemestre').val()),
                idCurso: $('#cursoSemestre').val()
            };
            
            let resultado;
            if (this.modoEdicionSemestre) {
                datos.idSemestre = this.semestreActual.idSemestre;
                resultado = await m_semestre.actualizarSemestre(datos);
            } else {
                console.log(datos)
                resultado = await m_semestre.insertarSemestre(datos);
            }
            
            if (resultado) {
                await this.cargarSemestres();
                this.limpiarFormularioSemestre();
                this.cancelarEdicionSemestre();
                Alerta.exito('Éxito', this.modoEdicionSemestre ? 'Semestre actualizado' : 'Semestre creado');
            }
        } catch (error) {
            console.error('Error al guardar semestre:', error);
            Alerta.error('Error', 'No se pudo guardar el semestre');
        }
    }

    editarSemestre(id) {
        const semestre = this.semestres.find(s => s.idSemestre == id);
        if (!semestre) return;
        
        this.modoEdicionSemestre = true;
        this.semestreActual = semestre;
        
        $('#numeroSemestre').val(semestre.numeroSemestre || '');
        $('#cursoSemestre').val(semestre.idCurso || 'Ninguno');
        
        u_curso.configurarModoEdicion(true, 'semestre');
    }

    async cambiarEstadoSemestre(id) {
        const semestre = this.semestres.find(s => s.idSemestre == id);
        if (!semestre) return;
        
        const nuevoEstado = semestre.habilitado == 1 ? 0 : 1;
        const accion = nuevoEstado == 1 ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion} este semestre?`);
        if (!confirmacion) return;
        
        try {
            // Aquí llamarías a una función del backend para cambiar el estado
            // Por ahora, simulamos que funciona
            semestre.habilitado = nuevoEstado;
            this.actualizarTablaSemestres();
            Alerta.exito('Éxito', `Semestre ${accion}do`);
        } catch (error) {
            console.error(`Error al ${accion} semestre:`, error);
            Alerta.error('Error', `No se pudo ${accion} el semestre`);
        }
    }

    cancelarEdicionSemestre() {
        this.modoEdicionSemestre = false;
        this.semestreActual = null;
        this.limpiarFormularioSemestre();
        u_curso.configurarModoEdicion(false, 'semestre');
    }

    limpiarFormularioSemestre() {
        $('#formSemestre')[0].reset();
        $('#cursoSemestre').val('Ninguno');
        $('.errorMensaje').text('').hide();
        $('#formSemestre input, #formSemestre select').removeClass('border-success border-danger');
    }

    actualizarTablaSemestres() {
        u_curso.actualizarTablaSemestres(this.dataTableSemestres, this.semestres, this.cursos);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_curso();
    await controlador.inicializar();
});