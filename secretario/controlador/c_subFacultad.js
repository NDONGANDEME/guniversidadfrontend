import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";



export class c_subFacultad
{
    constructor() {
        this.facultades = [];
        this.facultadActual = null;
        this.modoEdicion = false;
        this.contadorId = 4;
        this.dataTable = null;
        
        // Variables para validación
        this.nombreValido = false;
        this.telefonoValido = false;
        this.direccionValido = false;
    }



    // Método principal para iniciar todo
    inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.configurarDataTable();
    }



    // Cargar datos iniciales
    cargarDatosIniciales() {
        // let todasFacultades = await fetchFacultad.cargarTodasFacultadesDelBackend();    <-- para cuando haya backend

        // Datos de ejemplo
        this.facultades = [
            new m_facultad(1, "Ingenierías", "+240 222 174 324", "Al lado del rectorado"),
            new m_facultad(2, "Ciencias de la Salud", "+240 222 174 325", "Edificio principal"),
            new m_facultad(3, "Humanidades", "+240 222 174 326", "Ala norte")
        ];
        
        this.actualizarTabla();
    }



    // Configurar eventos básicos
    configurarEventos() {
        const self = this;
        
        // Botón para guardar facultad
        $('#btnGuardarFacultad').on('click', function() {
            self.guardarFacultad();
        });
        
        // Botón cancelar
        $('.cancelar').on('click', function() {
            self.limpiarFormulario();
            $('#modalNuevaFacultad').modal('hide');
        });
        
        // Evento cuando se abre el modal para nueva facultad
        $('.btn-primary[data-bs-target="#modalNuevaFacultad"]').on('click', function() {
            if (!$(this).hasClass('btn-outline-warning')) {
                self.modoEdicion = false;
                self.facultadActual = null;
                $('#modalNuevaFacultadLabel').text('Agregar nueva facultad');
                self.limpiarFormulario();
            }
        });
        
        // Delegación para botones de editar
        $(document).on('click', '.btn-outline-warning', function() {
            const id = $(this).data('id');
            self.prepararEdicion(id);
        });
        
        // Delegación para botones de deshabilitar
        $(document).on('click', '.deshabilitar', function() {
            const id = $(this).data('id');
            self.deshabilitarFacultad(id);
        });
    }



    // Configurar validaciones en tiempo real
    configurarValidaciones() {
        const self = this;
        
        // Validar nombre
        $('#nombreFacultad').on('input', function() {
            const valor = $(this).val().trim();
            self.nombreValido = u_verificaciones.validarTexto(valor);
            
            if (self.nombreValido) {
                $(this).removeClass('border-danger');
                $(this).addClass('border-success');
                $('#errorNombreFacultad').text('').hide();
            } else {
                $(this).removeClass('border-success');
                $(this).addClass('border-danger');
                $('#errorNombreFacultad').text('El nombre debe tener entre 3 y 100 caracteres').show();
            }
        });
        
        // Validar teléfono
        $('#telefonoFacultad').on('input', function() {
            const valor = $(this).val().trim();
            self.telefonoValido = u_verificaciones.validarTelefono(valor);
            
            if (self.telefonoValido) {
                $(this).removeClass('border-danger');
                $(this).addClass('border-success');
                $('#errorTelefonoFacultad').text('').hide();
            } else {
                $(this).removeClass('border-success');
                $(this).addClass('border-danger');
                $('#errorTelefonoFacultad').text('Formato: +240 222 123 456').show();
            }
        });
        
        // Validar dirección
        $('#direccionFacultad').on('input', function() {
            const valor = $(this).val().trim();
            self.direccionValido = valor.length >= 5 && valor.length <= 200;
            
            if (self.direccionValido) {
                $(this).removeClass('border-danger');
                $(this).addClass('border-success');
                $('#errorDireccionFacultad').text('').hide();
            } else {
                $(this).removeClass('border-success');
                $(this).addClass('border-danger');
                $('#errorDireccionFacultad').text('La dirección debe tener entre 5 y 200 caracteres').show();
            }
        });
    }



    // Configurar DataTable
    configurarDataTable() {
        this.dataTable = $('#tablaFacultades').DataTable();
    }



    // Actualizar tabla (sincronizada con DataTable)
    actualizarTabla() {
        if (!this.dataTable) {
            this.configurarDataTable();
        }
        
        // Limpiar tabla
        this.dataTable.clear();
        
        // Agregar filas
        this.facultades.forEach(facultad => {
            this.dataTable.row.add([
                facultad.NombreFacultad,
                facultad.TelefonoFacultad,
                facultad.DireccionFacultad,
                `<div class="d-flex justify-content-center align-items-center gap-1">
                    <button class="btn btn-sm btn-outline-warning me-1" 
                            data-bs-toggle="modal" 
                            data-bs-target="#modalNuevaFacultad" 
                            title="Editar" 
                            data-id="${facultad.idfacultad}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger me-1 deshabilitar" 
                            data-id="${facultad.idfacultad}" 
                            title="Deshabilitar">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>`
            ]);
        });
        
        // Dibujar tabla
        this.dataTable.draw();
    }



    // Validar todos los campos
    validarFormulario() {
        return this.nombreValido && this.telefonoValido && this.direccionValido;
    }



    // Guardar facultad (crear o editar)
    async guardarFacultad() {
        // Validar formulario
        if (!this.validarFormulario()) {
            Alerta.advertencia('¡Atención!', 'Por favor, complete correctamente todos los campos.');
            return;
        }
        
        try {
            // Crear objeto facultad
            const nuevaFacultad = new m_facultad(
                this.modoEdicion ? this.facultadActual.idfacultad : this.contadorId++,
                $('#nombreFacultad').val().trim(),
                $('#telefonoFacultad').val().trim(),
                $('#direccionFacultad').val().trim()
            );
            
            if (this.modoEdicion) {
                // await fetchFacultad.enviarDatosAActualizarFacultadAlBackend(nuevaFacultad);
                
                // Simulación: actualizar en array
                const index = this.facultades.findIndex(f => f.idfacultad === nuevaFacultad.idfacultad);
                if (index !== -1) {
                    this.facultades[index] = nuevaFacultad;
                }
                
                Alerta.exito('Éxito', 'Facultad actualizada correctamente');
            } else {
                // await fetchFacultad.enviarDatosAInsertarFacultadAlBackend(nuevaFacultad);
                
                // Simulación: agregar al array
                this.facultades.push(nuevaFacultad);
                
                Alerta.exito('Éxito', 'Facultad creada correctamente');
            }
            
            // Actualizar tabla y limpiar formulario
            this.actualizarTabla();

            // Añade esta línea:
            this.guardarFacultadesEnSesion();

            this.limpiarFormulario();
            $('#modalNuevaFacultad').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar la facultad: ${error}`);
        }
    }



    // Preparar edición
    prepararEdicion(idFacultad) {
        const facultad = this.facultades.find(f => f.idfacultad == idFacultad);
        
        if (facultad) {
            this.modoEdicion = true;
            this.facultadActual = facultad;
            
            // Llenar formulario
            $('#nombreFacultad').val(facultad.NombreFacultad);
            $('#telefonoFacultad').val(facultad.TelefonoFacultad);
            $('#direccionFacultad').val(facultad.DireccionFacultad);
            
            // Actualizar título
            $('#modalNuevaFacultadLabel').text('Editar facultad');
            
            // Forzar validaciones
            $('#nombreFacultad').trigger('input');
            $('#telefonoFacultad').trigger('input');
            $('#direccionFacultad').trigger('input');
            
            // Mostrar modal
            $('#modalNuevaFacultad').modal('show');
        }
    }



    // Deshabilitar facultad
    async deshabilitarFacultad(idFacultad) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar esta facultad?',
                {}
            );
            
            if (confirmacion) {
                // await fetchFacultad.enviarDatosADeshabilitarFacultadAlBackend(idFacultad);
                
                // Simulación: eliminar del array
                this.facultades = this.facultades.filter(f => f.idfacultad != idFacultad);
                this.actualizarTabla();

                this.guardarFacultadesEnSesion();
                
                Alerta.exito('Éxito', 'Facultad deshabilitada correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }



    // Limpiar formulario
    limpiarFormulario() {
        // Resetear campos
        $('#nombreFacultad').val('');
        $('#telefonoFacultad').val('');
        $('#direccionFacultad').val('');
        
        // Resetear validaciones
        this.nombreValido = false;
        this.telefonoValido = false;
        this.direccionValido = false;
        
        // Resetear estilos
        $('#nombreFacultad, #telefonoFacultad, #direccionFacultad').removeClass('border-success border-danger');
        
        // Ocultar errores
        $('#errorNombreFacultad, #errorTelefonoFacultad, #errorDireccionFacultad').text('').hide();
        
        // Resetear modo
        this.modoEdicion = false;
        this.facultadActual = null;
        
        // Resetear título del modal
        $('#modalNuevaFacultadLabel').text('Agregar nueva facultad');
    }

    

    // Guardar facultades en sessionStorage
    guardarFacultadesEnSesion() {
        try {
            // Guardar solo los datos necesarios para departamentos
            const facultadesSimplificadas = this.facultades.map(f => ({
                idfacultad: f.idfacultad,
                NombreFacultad: f.NombreFacultad
            }));
            
            sessionStorage.setItem('facultades', JSON.stringify(facultadesSimplificadas));
            console.log('Facultades guardadas en sessionStorage:', facultadesSimplificadas);
        } catch (error) {
            console.error('Error al guardar facultades:', error);
        }
    }
}





document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    sesiones.verificarExistenciaSesion();

    // Cargar componentes
    u_utilesSA.cargarArchivosImportadosHTML('Sidebar', '.importandoSidebar');
    u_utilesSA.cargarArchivosImportadosHTML('Navbar', '.importandoNavbar');
    u_utilesSA.botonesNavegacionWrapper();

    u_utilesSA.manejoTabla('#tablaFacultades');

    // Inicializar funcionalidad de facultades
    const controladorFacultades = new c_subFacultad();
    
    setTimeout(() => {
        controladorFacultades.inicializar();
    }, 100);
});