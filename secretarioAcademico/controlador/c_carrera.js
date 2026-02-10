import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_carrera } from "../modelo/m_carrera.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";

export class c_carrera
{
    constructor() {
        this.carreras = [];
        this.carreraActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.dataTable = null;
        this.departamentos = [];
        this.nombreValido = false;
        this.departamentoValido = false;
    }


    // Método principal para iniciar todo
    inicializar() {
        this.cargarDepartamentosDeSesion();
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.cargarDepartamentosEnSelect();
        this.obtenerDataTable();
    }


    // Cargar departamentos desde sessionStorage
    cargarDepartamentosDeSesion() {
        try {
            const departamentosJSON = sessionStorage.getItem('departamentos');
            if (departamentosJSON) {
                const datosDepartamentos = JSON.parse(departamentosJSON);
                this.departamentos = datosDepartamentos.map(d => ({
                    idDepartamento: d.idDepartamento,
                    nombre: d.nombreDepartamento
                }));
            } else {
                Alerta.advertencia('Advertencia', 'No hay departamentos registrados. Por favor, agregue departamentos primero.');
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar departamentos: ${error}`);
        }
    }


    // Llenar select con departamentos
    cargarDepartamentosEnSelect() {
        // let todosDepartamentos = await fetchDepartamento.obtenerDepartamentosDeBDD();

        const select = $('#departamentosCarrera');
        select.empty();
        select.append('<option value="Ninguno">Seleccione...</option>');
        
        // Agregar departamentos desde sessionStorage
        this.departamentos.forEach(departamento => {
            select.append(`<option value="${departamento.idDepartamento}">${departamento.nombre}</option>`);
        });
    }


    // Cargar carreras desde sessionStorage
    cargarCarrerasDeSesion() {
        try {
            const carrerasJSON = sessionStorage.getItem('carreras');
            if (carrerasJSON) {
                return JSON.parse(carrerasJSON);
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar carreras: ${error}`);
        }
        return null;
    }


    // Cargar datos iniciales de carreras
    cargarDatosIniciales() {
        // let todasCarreras = await fetchCarrera.obtenerCarrerasDeBDD();

        const carrerasGuardadas = this.cargarCarrerasDeSesion();
        
        if (carrerasGuardadas && carrerasGuardadas.length > 0) {
            this.carreras = carrerasGuardadas.map(c => 
                new m_carrera(c.idCarrera, c.nombreCarrera, c.idDepartamento)
            );
        } else {
            // Datos de ejemplo
            this.carreras = [
                new m_carrera(1, "Ingeniería Informática", null)
            ];
            
            this.guardarCarrerasEnSesion();
        }
        
        // Actualizar contadorId basado en el ID más alto
        if (this.carreras.length > 0) {
            const maxId = Math.max(...this.carreras.map(c => c.idCarrera));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // Configurar todos los eventos
    configurarEventos() {
        // Guardar carrera
        $('#btnGuardarCarrera').on('click', () => this.guardarCarrera());
        
        // Nuevo registro
        $('.nuevo').on('click', () => {
            this.modoEdicion = false;
            this.carreraActual = null;
            $('#modalNuevaCarreraLabel').text('Agregar nueva carrera');
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
            this.deshabilitarCarrera(id);
        });
    }


    // Configurar validaciones
    configurarValidaciones() {
        // Validar nombre
        $('#nombreCarrera').on('input', () => {
            const valor = $('#nombreCarrera').val().trim();
            this.nombreValido = u_verificaciones.validarTexto(valor);
            
            if (this.nombreValido) {
                $('#nombreCarrera')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorNombreCarrera').text('').hide();
            } else {
                $('#nombreCarrera')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorNombreCarrera')
                    .text('El nombre debe tener entre 3 y 100 caracteres')
                    .show();
            }
        });
        
        // Validar departamento (opcional)
        $('#departamentosCarrera').on('change', () => {
            const valor = $('#departamentosCarrera').val();
            this.departamentoValido = valor !== "Ninguno";
            
            if (this.departamentoValido) {
                $('#departamentosCarrera')
                    .removeClass('border-danger')
                    .addClass('border-success');
                $('#errorDepartamentosCarrera').text('').hide();
            } else {
                $('#departamentosCarrera')
                    .removeClass('border-success')
                    .addClass('border-danger');
                $('#errorDepartamentosCarrera')
                    .text('Seleccione un departamento (opcional)')
                    .show();
            }
        });
    }


    // Obtener referencia a DataTable
    obtenerDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaCarreras')) {
            this.dataTable = $('#tablaCarreras').DataTable();
        } else {
            this.dataTable = $('#tablaCarreras').DataTable({
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
        
        this.carreras.forEach(carrera => {
            const nombreDepartamento = this.obtenerNombreDepartamento(carrera.idDepartamento);
            
            this.dataTable.row.add([
                carrera.nombre,
                nombreDepartamento,
                this.crearBotonesAccion(carrera.idCarrera)
            ]);
        });
        
        this.dataTable.draw();
    }


    // Obtener nombre de departamento por ID
    obtenerNombreDepartamento(idDepartamento) {
        if (!idDepartamento) return "Ninguno";
        
        const departamento = this.departamentos.find(d => d.idDepartamento == idDepartamento);
        return departamento ? departamento.nombre : "Departamento no encontrado";
    }


    // Crear botones de acción para cada fila
    crearBotonesAccion(idCarrera) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevaCarrera" 
                        title="Editar" 
                        data-id="${idCarrera}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idCarrera}" 
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


    // INSERTAR/EDITAR: Guardar carrera
    async guardarCarrera() {
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Complete correctamente el nombre de la carrera.');
            return;
        }
        
        try {
            const nombre = $('#nombreCarrera').val().trim();
            const idDepartamento = $('#departamentosCarrera').val() !== "Ninguno" 
                ? parseInt($('#departamentosCarrera').val()) 
                : null;
            
            const id = this.modoEdicion ? this.carreraActual.idCarrera : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR: Actualizar registro
                const index = this.carreras.findIndex(c => c.idCarrera === id);
                if (index !== -1) {
                    this.carreras[index].nombre = nombre;
                    this.carreras[index].idDepartamento = idDepartamento;
                    // await fetchCarrera.actualizarCarreraEnBDD({idCarrera: index, nombre: nombre, idDepartamento: idDepartamento});
                    Alerta.exito('Éxito', 'Carrera actualizada correctamente');
                }
            } else {
                // INSERTAR: Crear nuevo registro
                const nuevaCarrera = new m_carrera(id, nombre, idDepartamento);
                this.carreras.push(nuevaCarrera);
                // await fetchCarrera.insertarCarreraEnBDD(nuevaCarrera);
                Alerta.exito('Éxito', 'Carrera creada correctamente');
            }
            
            this.actualizarTabla();
            this.guardarCarrerasEnSesion();
            this.limpiarFormulario();
            $('#modalNuevaCarrera').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    // EDITAR: Preparar formulario para edición
    prepararEdicion(idCarrera) {
        const carrera = this.carreras.find(c => c.idCarrera == idCarrera);
        
        if (carrera) {
            this.modoEdicion = true;
            this.carreraActual = carrera;
            
            $('#nombreCarrera').val(carrera.nombre);
            $('#departamentosCarrera').val(carrera.idDepartamento || "Ninguno");
            $('#modalNuevaCarreraLabel').text('Editar carrera');
            
            // Forzar validaciones
            $('#nombreCarrera').trigger('input');
            $('#departamentosCarrera').trigger('change');
            
            $('#modalNuevaCarrera').modal('show');
        }
    }


    // DESHABILITAR: Eliminar carrera
    async deshabilitarCarrera(idCarrera) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar esta carrera?'
            );
            
            if (confirmacion) {
                // DESHABILITAR: Eliminar de la lista
                this.carreras = this.carreras.filter(c => c.idCarrera != idCarrera);
                this.actualizarTabla();
                this.guardarCarrerasEnSesion();
                // await fetchCarrera.deshabilitarCarreraEnBDD(idCarrera);
                Alerta.exito('Éxito', 'Carrera deshabilitada correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    // Limpiar formulario
    limpiarFormulario() {
        $('#nombreCarrera').val('');
        $('#departamentosCarrera').val('Ninguno');
        
        this.nombreValido = false;
        this.departamentoValido = false;
        
        $('#nombreCarrera').removeClass('border-success border-danger');
        $('#departamentosCarrera').removeClass('border-success border-danger');
        
        $('#errorNombreCarrera').text('').hide();
        $('#errorDepartamentosCarrera').text('').hide();
        
        this.modoEdicion = false;
        this.carreraActual = null;
        $('#modalNuevaCarreraLabel').text('Agregar nueva carrera');
    }


    // Guardar carreras en sessionStorage
    guardarCarrerasEnSesion() {
        try {
            const carrerasData = this.carreras.map(c => ({
                idCarrera: c.idCarrera,
                nombreCarrera: c.nombre,
                idDepartamento: c.idDepartamento
            }));
            
            sessionStorage.setItem('carreras', JSON.stringify(carrerasData));
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
    
    const controladorCarreras = new c_carrera();
    
    // Pequeño delay para asegurar que DataTable esté disponible
    setTimeout(() => {
        controladorCarreras.inicializar();
    }, 100);
});