import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_departamento } from "../modelo/m_departamento.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";



export class c_subDepartamento
{
    constructor() {
        this.departamentos = [];
        this.departamentoActual = null;
        this.modoEdicion = false;
        this.contadorId = 2;
        this.dataTable = null;
        
        // Variables para validación
        this.nombreValido = false;
        this.telefonoValido = false;

        this.facultades = [];
    }



    // Método principal para iniciar todo
    inicializar() {
        this.cargarFacultadesDeSesion();
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.configurarDataTable();
    }



    // Cargar datos iniciales
    cargarDatosIniciales() {
        // let todosDepartamentos = await fetchDepartamento.cargarTodosDepartamentosDelBackend();      <-- para cuando haya backend

        // Datos de ejemplo
        this.departamentos = [
            new m_departamento(1, "Informatica", "+240 222 345 789", null)
        ];
        
        this.actualizarTabla();
    }



    // Configurar eventos básicos
    configurarEventos() {
        const self = this;
        
        // Botón para guardar departamento
        $('#btnGuardarFacultad').on('click', function() {
            self.guardarDepartamento();
        });
        
        // Botón cancelar
        $('.cancelar').on('click', function() {
            self.limpiarFormulario();
            $(this).closest('.modal').modal('hide');
        });
        
        // Evento cuando se abre el modal para nuevo departamento
        $('.btn-primary[data-bs-target="#modalNuevoDepartamento"]').on('click', function() {
            if (!$(this).hasClass('btn-outline-warning')) {
                self.modoEdicion = false;
                self.departamentoActual = null;
                $('#modalNuevoDepartamentoLabel').text('Agregar nuevo departamento');
                self.limpiarFormulario();
            }
        });
        
        // Botón para guardar asignación de facultad
        $('#btnGuardarAsignación').on('click', function() {
            self.asignarFacultad();
        });
        
        // Delegación para botones de asignar facultad
        $(document).on('click', '.fa-hand-point-right', function() {
            const id = $(this).closest('tr').find('.btn-outline-info').data('id');
            self.prepararAsignacion(id);
        });
        
        // Delegación para botones de editar
        $(document).on('click', '.fa-edit', function() {
            const id = $(this).closest('tr').find('.btn-outline-warning').data('id');
            self.prepararEdicion(id);
        });
        
        // Delegación para botones de deshabilitar
        $(document).on('click', '.deshabilitar', function() {
            const id = $(this).closest('tr').find('.btn-outline-danger').data('id');
            self.deshabilitarDepartamento(id);
        });

        // Cuando se abre el modal de asignación, refrescar facultades
        $('#modalAsignacion').on('show.bs.modal', function() {
            self.refrescarFacultadesEnSelect();
        });
    }



    // Configurar validaciones en tiempo real
    configurarValidaciones() {
        const self = this;
        
        // Validar nombre
        $('#nombreDepartamento').on('input', function() {
            const valor = $(this).val().trim();
            self.nombreValido = u_verificaciones.validarTexto(valor);
            
            if (self.nombreValido) {
                $(this).removeClass('border-danger');
                $(this).addClass('border-success');
                $('#errorNombreDepartamento').text('').hide();
            } else {
                $(this).removeClass('border-success');
                $(this).addClass('border-danger');
                $('#errorNombreDepartamento').text('El nombre debe tener entre 3 y 100 caracteres').show();
            }
        });
        
        // Validar teléfono
        $('#telefonoDepartamento').on('input', function() {
            const valor = $(this).val().trim();
            self.telefonoValido = u_verificaciones.validarTelefono(valor);
            
            if (self.telefonoValido) {
                $(this).removeClass('border-danger');
                $(this).addClass('border-success');
                $('#errorTelefonoDepartamento').text('').hide();
            } else {
                $(this).removeClass('border-success');
                $(this).addClass('border-danger');
                $('#errorTelefonoDepartamento').text('Formato: +240 222 123 456').show();
            }
        });
    }



    // Configurar DataTable
    configurarDataTable() {
        this.dataTable = $('#tablaDepartamento').DataTable();
    }



    // Actualizar tabla
    actualizarTabla() {
        if (!this.dataTable) {
            this.configurarDataTable();
        }
        
        // Limpiar tabla
        this.dataTable.clear();
        
        // Agregar filas
        this.departamentos.forEach(departamento => {
            // Determinar texto de facultad
            let textoFacultad = "Ninguno";
            let claseFacultad = "text-muted";
            
            if (departamento.idFacultad) {
                const facultad = this.facultades.find(f => f.idfacultad == departamento.idFacultad);
                textoFacultad = facultad ? facultad.NombreFacultad : `Facultad ${departamento.idFacultad}`;
                claseFacultad = "";
            }

            this.dataTable.row.add([
                departamento.NombreDepartamento,
                departamento.TelefonoDepartamento,
                `<span class="${claseFacultad}">${textoFacultad}</span>`,
                `<div class="d-flex justify-content-center align-items-center gap-1">
                    <button class="btn btn-sm btn-outline-info me-1" 
                            data-bs-toggle="modal" 
                            data-bs-target="#modalAsignacion" 
                            data-id="${departamento.iddepartamento}"
                            title="Asignar">
                        <i class="fas fa-hand-point-right"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1" 
                            data-bs-toggle="modal" 
                            data-bs-target="#modalNuevoDepartamento" 
                            title="Editar" 
                            data-id="${departamento.iddepartamento}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger me-1 deshabilitar" 
                            data-id="${departamento.iddepartamento}" 
                            title="Deshabilitar">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>`
            ]);
        });
        
        // Dibujar tabla
        this.dataTable.draw();
    }



    // Validar formulario de departamento
    validarFormularioDepartamento() {
        return this.nombreValido && this.telefonoValido;
    }



    // Guardar departamento (crear o editar)
    async guardarDepartamento() {
        // Validar formulario
        if (!this.validarFormularioDepartamento()) {
            Alerta.advertencia('¡Atención!', 'Por favor, complete correctamente todos los campos.');
            return;
        }
        
        try {
            // Crear objeto departamento
            const nuevoDepartamento = new m_departamento(
                this.modoEdicion ? this.departamentoActual.iddepartamento : this.contadorId++,
                $('#nombreDepartamento').val().trim(),
                $('#telefonoDepartamento').val().trim(),
                this.modoEdicion ? this.departamentoActual.idFacultad : null
            );
            
            if (this.modoEdicion) {
                // await fetchDepartamento.enviarDatosAActualizarDepartamentoAlBackend(nuevoDepartamento);
                
                // Simulación: actualizar en array
                const index = this.departamentos.findIndex(d => d.iddepartamento === nuevoDepartamento.iddepartamento);
                if (index !== -1) {
                    this.departamentos[index] = nuevoDepartamento;
                }
                
                Alerta.exito('Éxito', 'Departamento actualizado correctamente');
            } else {
                // await fetchDepartamento.enviarDatosAInsertarDepartamentoAlBackend(nuevoDepartamento);
                
                // Simulación: agregar al array
                this.departamentos.push(nuevoDepartamento);
                
                Alerta.exito('Éxito', 'Departamento creado correctamente');
            }
            
            // Actualizar tabla y limpiar formulario
            this.actualizarTabla();
            this.limpiarFormulario();
            $('#modalNuevoDepartamento').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar el departamento: ${error}`);
        }
    }



    // Preparar edición
    prepararEdicion(idDepartamento) {
        const departamento = this.departamentos.find(d => d.iddepartamento == idDepartamento);
        
        if (departamento) {
            this.modoEdicion = true;
            this.departamentoActual = departamento;
            
            // Llenar formulario
            $('#nombreDepartamento').val(departamento.NombreDepartamento);
            $('#telefonoDepartamento').val(departamento.TelefonoDepartamento);
            
            // Actualizar título
            $('#modalNuevoDepartamentoLabel').text('Editar departamento');
            
            // Forzar validaciones
            $('#nombreDepartamento').trigger('input');
            $('#telefonoDepartamento').trigger('input');
            
            // Mostrar modal
            $('#modalNuevoDepartamento').modal('show');
        }
    }



    // Preparar asignación de facultad
    prepararAsignacion(idDepartamento) {
        const departamento = this.departamentos.find(d => d.iddepartamento == idDepartamento);
        
        if (departamento) {
            this.departamentoActual = departamento;
            
            // REFRESCAR facultades del select (carga las más recientes)
            this.refrescarFacultadesEnSelect();
            
            // Seleccionar facultad actual si existe
            if (departamento.idFacultad) {
                $('#facultadDepartamentoAsignado').val(departamento.idFacultad);
            }
            
            // Mostrar modal de asignación
            $('#modalAsignacion').modal('show');
        } else {
            Alerta.error('Error', 'No se encontró el departamento seleccionado.');
        }
    }



    // Cargar facultades en el select
    cargarFacultadesEnSelect() {
        const select = $('#facultadDepartamentoAsignado');
        select.empty();
        select.append('<option value="">Seleccione...</option>');

        // let todasFacultades = await fetchFacultad.cargarTodasFacultadesDelBackend();
        
        // USAR this.facultades (cargadas de sessionStorage) en lugar de facultadesEjemplo
        if (this.facultades && this.facultades.length > 0) {
            this.facultades.forEach(facultad => {
                select.append(`<option value="${facultad.idfacultad}">${facultad.NombreFacultad}</option>`);
            });
        } else {
            // Si no hay facultades, mostrar mensaje
            select.append('<option value="" disabled>No hay facultades disponibles</option>');
        }
    }



    refrescarFacultadesEnSelect() {
        // Recargar facultades de sessionStorage
        this.cargarFacultadesDeSesion();
        
        // Actualizar el select
        this.cargarFacultadesEnSelect();
    }



    cargarFacultadesDeSesion() {
        try {
            // Intentamos obtener facultades de sessionStorage
            const facultadesGuardadas = sessionStorage.getItem('facultades');
            
            if (facultadesGuardadas) {
                this.facultades = JSON.parse(facultadesGuardadas);
            } else {
                // Si no hay en sessionStorage, usar datos de ejemplo
                this.facultades = [
                    { idfacultad: 1, NombreFacultad: "Ingenierías" },
                    { idfacultad: 2, NombreFacultad: "Ciencias de la Salud" },
                    { idfacultad: 3, NombreFacultad: "Humanidades" }
                ];
                
                // Guardar en sessionStorage para futuras cargas
                sessionStorage.setItem('facultades', JSON.stringify(this.facultades));
            }
        } catch (error) {
            Alerta.error('Error', `Error al cargar facultades: ${error}`);
            this.facultades = [];
        }
    }



    // Asignar facultad a departamento
    async asignarFacultad() {
        const facultadId = $('#facultadDepartamentoAsignado').val();
        
        if (!facultadId) {
            Alerta.advertencia('¡Atención!', 'Por favor, seleccione una facultad.');
            return;
        }
        
        if (!this.departamentoActual) {
            Alerta.error('Error', 'No hay departamento seleccionado.');
            return;
        }
        
        try {
            // Corrección: Enviar datos correctos al backend
            // await fetchDepartamento.asignarFacultadAlDepartamento(this.departamentoActual.iddepartamento, facultadId);
            
            // Simulación: actualizar en array
            const departamento = this.departamentos.find(d => d.iddepartamento === this.departamentoActual.iddepartamento);
            if (departamento) {
                departamento.idFacultad = parseInt(facultadId); // Convertir a número si es string
            }
            
            // Actualizar tabla y cerrar modal
            this.actualizarTabla();
            $('#modalAsignacion').modal('hide');
            
            Alerta.exito('Éxito', 'Facultad asignada correctamente');
            
        } catch (error) {
            Alerta.error('Error', `Error al asignar facultad: ${error}`);
        }
    }



    // Deshabilitar departamento
    async deshabilitarDepartamento(idDepartamento) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar este departamento?',
                {}
            );
            
            if (confirmacion) {
                // await fetchDepartamento.enviarDatoADeshabilitarDepartamentoAlBackend(idDepartamento);
                
                // Simulación: eliminar del array
                this.departamentos = this.departamentos.filter(d => d.iddepartamento != idDepartamento);
                this.actualizarTabla();
                
                Alerta.exito('Éxito', 'Departamento deshabilitado correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }



    // Limpiar formulario
    limpiarFormulario() {
        // Resetear campos departamento
        $('#nombreDepartamento').val('');
        $('#telefonoDepartamento').val('');
        
        // Resetear validaciones
        this.nombreValido = false;
        this.telefonoValido = false;
        
        // Resetear estilos
        $('#nombreDepartamento, #telefonoDepartamento').removeClass('border-success border-danger');
        
        // Ocultar errores
        $('#errorNombreDepartamento, #errorTelefonoDepartamento').text('').hide();
        
        // Resetear modo
        this.modoEdicion = false;
        this.departamentoActual = null;
        
        // Resetear título del modal
        $('#modalNuevoDepartamentoLabel').text('Agregar nuevo departamento');
        
        // Resetear select de facultad
        $('#facultadDepartamentoAsignado').val('');
    }
}





// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    sesiones.verificarExistenciaSesion();

    // Cargar componentes
    u_utilesSA.cargarArchivosImportadosHTML('Sidebar', '.importandoSidebar');
    u_utilesSA.cargarArchivosImportadosHTML('Navbar', '.importandoNavbar');
    u_utilesSA.botonesNavegacionWrapper();

    u_utilesSA.manejoTabla('#tablaDepartamento');

    // Inicializar funcionalidad de departamentos
    const controladorDepartamentos = new c_subDepartamento();
    
    setTimeout(() => {
        controladorDepartamentos.inicializar();
    }, 100);
});