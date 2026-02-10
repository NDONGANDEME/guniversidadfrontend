import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_curso } from "../modelo/m_curso.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";

export class c_curso
{
    constructor() {
        this.cursos = [];
        this.cursoActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.dataTable = null;
        this.nombreValido = false;
        this.creditosValido = false;
    }


    // Método principal para iniciar todo
    inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.obtenerDataTable();
    }


    // Cargar cursos desde sessionStorage
    cargarCursosDeSesion() {
        try {
            const cursosJSON = sessionStorage.getItem('cursos');
            if (cursosJSON) {
                return JSON.parse(cursosJSON);
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar cursos: ${error}`);
        }
        return null;
    }


    // Cargar datos iniciales
    cargarDatosIniciales() {
        // let todosCursos = await fetchCurso.obtenerCursosDeBDD();

        const cursosGuardados = this.cargarCursosDeSesion();
        
        if (cursosGuardados && cursosGuardados.length > 0) {
            this.cursos = cursosGuardados.map(c => 
                new m_curso(c.idCurso, c.nombreCurso, c.creditos)
            );
        } else {
            // Datos de ejemplo
            this.cursos = [
                new m_curso(1, "Primero", 60),
                new m_curso(2, "Segundo", 55),
                new m_curso(3, "Tercero", 50)
            ];
            
            this.guardarCursosEnSesion();
        }
        
        // Actualizar el contadorId basado en el ID más alto encontrado
        if (this.cursos.length > 0) {
            const maxId = Math.max(...this.cursos.map(c => c.idCurso));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // Configurar todos los eventos
    configurarEventos() {
        // Guardar curso
        $('#btnGuardarCurso').on('click', () => this.guardarCurso());
        
        // Nuevo registro
        $('.nuevo').on('click', () => {
            this.modoEdicion = false;
            this.cursoActual = null;
            $('#modalNuevoCursoLabel').text('Agregar nuevo curso');
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
            this.deshabilitarCurso(id);
        });
    }


    // Configurar validaciones
    configurarValidaciones() {
        // Validar nombre
        $('#nombreCurso').on('input', () => {
            const valor = $('#nombreCurso').val().trim();
            this.nombreValido = u_verificaciones.validarTexto(valor);
            
            if (this.nombreValido) {
                $('#nombreCurso')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorNombreCurso').text('').hide();
            } else {
                $('#nombreCurso')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorNombreCurso')
                    .text('El nombre debe tener entre 3 y 100 caracteres')
                    .show();
            }
        });
        
        // Validar créditos
        $('#creditoCurso').on('input', () => {
            const valor = $('#creditoCurso').val();
            const creditos = parseInt(valor);
            
            // Verificar que sea un número válido y esté entre 1 y 60
            this.creditosValido = !isNaN(creditos) && creditos >= 1 && creditos <= 60;
            
            if (this.creditosValido) {
                $('#creditoCurso')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorCreditoCurso').text('').hide();
            } else {
                $('#creditoCurso')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorCreditoCurso')
                    .text('Los créditos deben ser un número entre 1 y 60')
                    .show();
            }
        });
    }


    // Obtener referencia a DataTable
    obtenerDataTable() {
        // Verificar si DataTable ya está inicializado
        if ($.fn.dataTable.isDataTable('#tablaCursos')) {
            this.dataTable = $('#tablaCursos').DataTable();
        } else {
            // Solo inicializar si no existe
            this.dataTable = $('#tablaCursos').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
            });
        }
    }


    // Actualizar tabla
    actualizarTabla() {
        if (!this.dataTable) {
            this.obtenerDataTable();
        }
        
        this.dataTable.clear();
        
        this.cursos.forEach(curso => {
            this.dataTable.row.add([
                curso.nombre,
                curso.creditos,
                this.crearBotonesAccion(curso.idCurso)
            ]);
        });
        
        this.dataTable.draw();
    }


    // Crear botones de acción para cada fila
    crearBotonesAccion(idCurso) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevoCurso" 
                        title="Editar" 
                        data-id="${idCurso}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idCurso}" 
                        title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }


    // Validar formulario
    validarFormulario() {
        return this.nombreValido && this.creditosValido;
    }


    // INSERTAR: Guardar nuevo curso
    async guardarCurso() {
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Complete correctamente todos los campos.');
            return;
        }
        
        try {
            const nombre = $('#nombreCurso').val().trim();
            const creditos = parseInt($('#creditoCurso').val());
            const id = this.modoEdicion ? this.cursoActual.idCurso : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR: Actualizar registro
                const index = this.cursos.findIndex(c => c.idCurso === id);
                if (index !== -1) {
                    this.cursos[index].nombre = nombre;
                    this.cursos[index].creditos = creditos;
                    // await fetchCurso.actualizarCursoEnBDD({idCurso: index, nombre: nombre, creditos: creditos})
                    Alerta.exito('Éxito', 'Curso actualizado correctamente');
                }
            } else {
                // INSERTAR: Crear nuevo registro
                const nuevoCurso = new m_curso(id, nombre, creditos);
                this.cursos.push(nuevoCurso);
                // await fetchCurso.insertarCursoEnBDD(nuevoCurso)
                Alerta.exito('Éxito', 'Curso creado correctamente');
            }
            
            this.actualizarTabla();
            this.guardarCursosEnSesion();
            this.limpiarFormulario();
            $('#modalNuevoCurso').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    // EDITAR: Preparar formulario para edición
    prepararEdicion(idCurso) {
        const curso = this.cursos.find(c => c.idCurso == idCurso);
        
        if (curso) {
            this.modoEdicion = true;
            this.cursoActual = curso;
            
            $('#nombreCurso').val(curso.nombre);
            $('#creditoCurso').val(curso.creditos);
            $('#modalNuevoCursoLabel').text('Editar curso');
            
            // Forzar validaciones
            $('#nombreCurso').trigger('input');
            $('#creditoCurso').trigger('input');
            
            $('#modalNuevoCurso').modal('show');
        }
    }


    // DESHABILITAR: Eliminar curso
    async deshabilitarCurso(idCurso) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar este curso?'
            );
            
            if (confirmacion) {
                // DESHABILITAR: Eliminar de la lista
                this.cursos = this.cursos.filter(c => c.idCurso != idCurso);
                this.actualizarTabla();
                this.guardarCursosEnSesion();
                // await fetchCurso.deshabilitarCursoEnBDD(idCurso)
                Alerta.exito('Éxito', 'Curso deshabilitado correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    // Limpiar formulario
    limpiarFormulario() {
        $('#nombreCurso').val('');
        $('#creditoCurso').val('');
        
        this.nombreValido = false;
        this.creditosValido = false;
        
        $('#nombreCurso').removeClass('border-success border-danger');
        $('#creditoCurso').removeClass('border-success border-danger');
        
        $('#errorNombreCurso').text('').hide();
        $('#errorCreditoCurso').text('').hide();
        
        this.modoEdicion = false;
        this.cursoActual = null;
        $('#modalNuevoCursoLabel').text('Agregar nuevo curso');
    }


    // Guardar en sessionStorage
    guardarCursosEnSesion() {
        try {
            const cursosData = this.cursos.map(c => ({
                idCurso: c.idCurso,
                nombreCurso: c.nombre,
                creditos: c.creditos
            }));
            
            sessionStorage.setItem('cursos', JSON.stringify(cursosData));
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
    
    const controladorCursos = new c_curso();
    
    // Pequeño delay para asegurar que DataTable esté disponible
    setTimeout(() => {
        controladorCursos.inicializar();
    }, 100);
});