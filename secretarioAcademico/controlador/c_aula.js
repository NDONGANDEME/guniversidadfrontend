import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_aula } from "../modelo/m_aula.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";

export class c_aula
{
    constructor() {
        this.aulas = [];
        this.aulaActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.dataTable = null;
        this.nombreValido = false;
    }


    // Método principal para iniciar todo
    inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.obtenerDataTable();
    }


    // Cargar aulas desde sessionStorage
    cargarAulasDeSesion() {
        try {
            const aulasJSON = sessionStorage.getItem('aulas');
            if (aulasJSON) {
                return JSON.parse(aulasJSON);
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar aulas: ${error}`);
        }
        return null;
    }


    // Cargar datos iniciales
    cargarDatosIniciales() {
        // let todasAulas = await fetchAula.obtenerAulasDeBDD();

        const aulasGuardadas = this.cargarAulasDeSesion();
        
        if (aulasGuardadas && aulasGuardadas.length > 0) {
            this.aulas = aulasGuardadas.map(a => 
                new m_aula(a.idAula, a.nombreAula)
            );
        } else {
            // Datos de ejemplo - aulas típicas de una facultad
            this.aulas = [
                new m_aula(1, "F1"),
                new m_aula(2, "F2"),
                new m_aula(3, "F3")
            ];
            
            this.guardarAulasEnSesion();
        }
        
        // Actualizar el contadorId basado en el ID más alto encontrado
        if (this.aulas.length > 0) {
            const maxId = Math.max(...this.aulas.map(a => a.idAula));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // Configurar todos los eventos
    configurarEventos() {
        // Guardar aula
        $('#btnGuardarAula').on('click', () => this.guardarAula());
        
        // Nuevo registro
        $('.nuevo').on('click', () => {
            this.modoEdicion = false;
            this.aulaActual = null;
            $('#modalNuevaAulaLabel').text('Agregar nueva aula');
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
            this.deshabilitarAula(id);
        });
    }


    // Configurar validaciones
    configurarValidaciones() {
        // Validar nombre
        $('#nombreAula').on('input', () => {
            const valor = $('#nombreAula').val().trim();
            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}/;
            this.nombreValido = regex.test(valor)
            
            if (this.nombreValido) {
                $('#nombreAula')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorNombreAula').text('').hide();
            } else {
                $('#nombreAula')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorNombreAula')
                    .text('El nombre debe tener entre 1 y 50 caracteres')
                    .show();
            }
        });
    }


    // Obtener referencia a DataTable
    obtenerDataTable() {
        // Verificar si DataTable ya está inicializado
        if ($.fn.dataTable.isDataTable('#tablaAulas')) {
            this.dataTable = $('#tablaAulas').DataTable();
        } else {
            // Solo inicializar si no existe
            this.dataTable = $('#tablaAulas').DataTable({
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
        
        this.aulas.forEach(aula => {
            this.dataTable.row.add([
                aula.nombre,
                this.crearBotonesAccion(aula.idAula)
            ]);
        });
        
        this.dataTable.draw();
    }


    // Crear botones de acción para cada fila
    crearBotonesAccion(idAula) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevaAula" 
                        title="Editar" 
                        data-id="${idAula}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idAula}" 
                        title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }


    // Validar formulario
    validarFormulario() {
        return this.nombreValido;
    }


    // INSERTAR/EDITAR: Guardar aula
    async guardarAula() {
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Complete correctamente el nombre del aula.');
            return;
        }
        
        try {
            const nombre = $('#nombreAula').val().trim();
            const id = this.modoEdicion ? this.aulaActual.idAula : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR: Actualizar registro
                const index = this.aulas.findIndex(a => a.idAula === id);
                if (index !== -1) {
                    this.aulas[index].nombre = nombre;
                    // await fetchAula.actualizarAulaEnBDD({idAula: index, nombre: nombre});
                    Alerta.exito('Éxito', 'Aula actualizada correctamente');
                }
            } else {
                // INSERTAR: Crear nuevo registro
                const nuevaAula = new m_aula(id, nombre);
                this.aulas.push(nuevaAula);
                // await fetchAula.insertarAulaEnBDD(nuevaAula);
                Alerta.exito('Éxito', 'Aula creada correctamente');
            }
            
            this.actualizarTabla();
            this.guardarAulasEnSesion();
            this.limpiarFormulario();
            $('#modalNuevaAula').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    // EDITAR: Preparar formulario para edición
    prepararEdicion(idAula) {
        const aula = this.aulas.find(a => a.idAula == idAula);
        
        if (aula) {
            this.modoEdicion = true;
            this.aulaActual = aula;
            
            $('#nombreAula').val(aula.nombre);
            $('#modalNuevaAulaLabel').text('Editar aula');
            
            // Forzar validaciones
            $('#nombreAula').trigger('input');
            
            $('#modalNuevaAula').modal('show');
        }
    }


    // DESHABILITAR: Eliminar aula
    async deshabilitarAula(idAula) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar esta aula?'
            );
            
            if (confirmacion) {
                // DESHABILITAR: Eliminar de la lista
                this.aulas = this.aulas.filter(a => a.idAula != idAula);
                this.actualizarTabla();
                this.guardarAulasEnSesion();
                // await fetchAula.deshabilitarAulaEnBDD(idAula);
                Alerta.exito('Éxito', 'Aula deshabilitada correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    // Limpiar formulario
    limpiarFormulario() {
        $('#nombreAula').val('');
        
        this.nombreValido = false;
        
        $('#nombreAula').removeClass('border-success border-danger');
        
        $('#errorNombreAula').text('').hide();
        
        this.modoEdicion = false;
        this.aulaActual = null;
        $('#modalNuevaAulaLabel').text('Agregar nueva aula');
    }


    // Guardar en sessionStorage
    guardarAulasEnSesion() {
        try {
            const aulasData = this.aulas.map(a => ({
                idAula: a.idAula,
                nombreAula: a.nombre
            }));
            
            sessionStorage.setItem('aulas', JSON.stringify(aulasData));
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
    
    const controladorAulas = new c_aula();
    
    // Pequeño delay para asegurar que DataTable esté disponible
    setTimeout(() => {
        controladorAulas.inicializar();
    }, 100);
});