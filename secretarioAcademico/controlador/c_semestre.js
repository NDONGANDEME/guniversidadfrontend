import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_semestre } from "../modelo/m_semestre.js";
import { fetchSemestre } from "../servicios/fetchSemestre.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class c_semestre
{
    constructor() {
        this.semestres = [];
        this.semestreActual = null;
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


    // Cargar semestres desde sessionStorage
    cargarSemestresDeSesion() {
        try {
            const semestresJSON = sessionStorage.getItem('semestres');
            if (semestresJSON) {
                return JSON.parse(semestresJSON);
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar semestres: ${error}`);
        }
        return null;
    }


    // Cargar datos iniciales
    cargarDatosIniciales() {
        // let todosSemetres = await fetchSemestre.obtenerSemestresDeBDD();

        const semestresGuardados = this.cargarSemestresDeSesion();
        
        if (semestresGuardados && semestresGuardados.length > 0) {
            this.semestres = semestresGuardados.map(s => 
                new m_semestre(s.idSemestre, s.nombreSemestre, s.creditos)
            );
        } else {
            // Datos de ejemplo
            this.semestres = [
                new m_semestre(1, "Primero", 30),
                new m_semestre(2, "Segundo", 28),
                new m_semestre(3, "Tercero", 32)
            ];
            
            // Guardar los datos de ejemplo en sessionStorage
            this.guardarSemestresEnSesion();
        }
        
        // Actualizar el contadorId basado en el ID más alto encontrado
        if (this.semestres.length > 0) {
            const maxId = Math.max(...this.semestres.map(s => s.idSemestre));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // Configurar todos los eventos
    configurarEventos() {
        // Guardar semestre
        $('#btnGuardarSemestre').on('click', () => this.guardarSemestre());
        
        // Nuevo registro
        $('.nuevo').on('click', () => {
            this.modoEdicion = false;
            this.semestreActual = null;
            $('#modalNuevoSemestreLabel').text('Agregar nuevo semestre');
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
            this.deshabilitarSemestre(id);
        });
    }


    // Configurar validaciones
    configurarValidaciones() {
        // Validar nombre
        $('#nombreSemestre').on('input', () => {
            const valor = $('#nombreSemestre').val().trim();
            this.nombreValido = u_verificaciones.validarTexto(valor);
            
            if (this.nombreValido) {
                $('#nombreSemestre')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#erroNombreSemestre').text('').hide();
            } else {
                $('#nombreSemestre')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#erroNombreSemestre')
                    .text('El nombre debe tener entre 3 y 100 caracteres')
                    .show();
            }
        });
        
        // Validar créditos
        $('#creditoSemestre').on('input', () => {
            const valor = $('#creditoSemestre').val();
            const creditos = parseInt(valor);
            
            // Verificar que sea un número válido y esté entre 1 y 30
            this.creditosValido = !isNaN(creditos) && creditos >= 1 && creditos <= 30;
            
            if (this.creditosValido) {
                $('#creditoSemestre')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorCreditoSemestre').text('').hide();
            } else {
                $('#creditoSemestre')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorCreditoSemestre')
                    .text('Los créditos deben ser un número entre 1 y 30')
                    .show();
            }
        });
    }


    // Obtener referencia a DataTable
    obtenerDataTable() {
        // Verificar si DataTable ya está inicializado
        if ($.fn.dataTable.isDataTable('#tablaSemestres')) {
            this.dataTable = $('#tablaSemestres').DataTable();
        } else {
            // Solo inicializar si no existe
            this.dataTable = $('#tablaSemestres').DataTable({
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
        
        this.semestres.forEach(semestre => {
            this.dataTable.row.add([
                semestre.nombre,
                semestre.creditos,
                this.crearBotonesAccion(semestre.idSemestre)
            ]);
        });
        
        this.dataTable.draw();
    }


    // Crear botones de acción para cada fila
    crearBotonesAccion(idSemestre) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevoSemestre" 
                        title="Editar" 
                        data-id="${idSemestre}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idSemestre}" 
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


    // INSERTAR/EDITAR: Guardar semestre
    async guardarSemestre() {
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Complete correctamente todos los campos.');
            return;
        }
        
        try {
            const nombre = $('#nombreSemestre').val().trim();
            const creditos = parseInt($('#creditoSemestre').val());
            const id = this.modoEdicion ? this.semestreActual.idSemestre : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR: Actualizar registro
                const index = this.semestres.findIndex(s => s.idSemestre === id);
                if (index !== -1) {
                    this.semestres[index].nombre = nombre;
                    this.semestres[index].creditos = creditos;
                    // await fetchSemestre.actualizarSemestreEnBDD({idSemestre: index, nombre: nombre, creditos: creditos})
                    Alerta.exito('Éxito', 'Semestre actualizado correctamente');
                }
            } else {
                // INSERTAR: Crear nuevo registro
                const nuevoSemestre = new m_semestre(id, nombre, creditos);
                this.semestres.push(nuevoSemestre);
                await fetchSemestre.insertarSemestreEnBDD(nuevoSemestre);
                Alerta.exito('Éxito', 'Semestre creado correctamente');
            }
            
            this.actualizarTabla();
            this.guardarSemestresEnSesion();
            this.limpiarFormulario();
            $('#modalNuevoSemestre').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    // EDITAR: Preparar formulario para edición
    prepararEdicion(idSemestre) {
        const semestre = this.semestres.find(s => s.idSemestre == idSemestre);
        
        if (semestre) {
            this.modoEdicion = true;
            this.semestreActual = semestre;
            
            $('#nombreSemestre').val(semestre.nombre);
            $('#creditoSemestre').val(semestre.creditos);
            $('#modalNuevoSemestreLabel').text('Editar semestre');
            
            // Forzar validaciones
            $('#nombreSemestre').trigger('input');
            $('#creditoSemestre').trigger('input');
            
            $('#modalNuevoSemestre').modal('show');
        }
    }


    // DESHABILITAR: Eliminar semestre
    async deshabilitarSemestre(idSemestre) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar este semestre?'
            );
            
            if (confirmacion) {
                // DESHABILITAR: Eliminar de la lista
                this.semestres = this.semestres.filter(s => s.idSemestre != idSemestre);
                this.actualizarTabla();
                this.guardarSemestresEnSesion();
                // await fetchSemestre.deshabilitarSemestreEnBDD(idSemestre);
                Alerta.exito('Éxito', 'Semestre deshabilitado correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    // Limpiar formulario
    limpiarFormulario() {
        $('#nombreSemestre').val('');
        $('#creditoSemestre').val('');
        
        this.nombreValido = false;
        this.creditosValido = false;
        
        $('#nombreSemestre').removeClass('border-success border-danger');
        $('#creditoSemestre').removeClass('border-success border-danger');
        
        $('#erroNombreSemestre').text('').hide();
        $('#errorCreditoSemestre').text('').hide();
        
        this.modoEdicion = false;
        this.semestreActual = null;
        $('#modalNuevoSemestreLabel').text('Agregar nuevo semestre');
    }


    // Guardar en sessionStorage
    guardarSemestresEnSesion() {
        try {
            const semestresData = this.semestres.map(s => ({
                idSemestre: s.idSemestre,
                nombreSemestre: s.nombre,
                creditos: s.creditos
            }));
            
            sessionStorage.setItem('semestres', JSON.stringify(semestresData));
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
    
    const controladorSemestres = new c_semestre();
    
    // Pequeño delay para asegurar que DataTable esté disponible
    setTimeout(() => {
        controladorSemestres.inicializar();
    }, 100);
});