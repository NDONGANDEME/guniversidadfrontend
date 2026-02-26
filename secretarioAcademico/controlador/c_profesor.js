import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_profesor } from "../modelo/m_profesor.js";
import { m_formacion } from "../modelo/m_formacion.js";
import { u_profesor } from "../utilidades/u_profesor.js";
import { m_archivo } from "../../public/modelo/m_archivo.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { m_facultad } from "../../admin/modelo/m_facultad.js";
import { m_departamento } from "../../admin/modelo/m_departamento.js";

export class c_profesor {
    constructor() {
        // Profesores
        this.profesores = [];
        this.profesorActual = null;
        this.modoEdicion = false;
        this.dataTableProfesores = null;
        
        // Datos relacionados
        this.usuarios = [];
        this.facultades = [];
        this.departamentos = [];
        this.formaciones = [];
        
        // Modal
        this.modalInstance = null;
        this.modalDetallesInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            this.inicializarDataTables();
            
            await this.cargarFacultades();
            await this.cargarDepartamentos();
            await this.cargarUsuarios();
            await this.cargarProfesores();
            await this.cargarFormaciones();
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarCombos();
            this.configurarArchivos();
            this.configurarImagen();
            
            // Inicializar modales
            const modalElement = document.getElementById('modalNuevoProfesor');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            const modalDetallesElement = document.getElementById('modalVerDetallesProfesor');
            if (modalDetallesElement) {
                this.modalDetallesInstance = new bootstrap.Modal(modalDetallesElement);
            }
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        if ($.fn.dataTable.isDataTable('#tablaProfesores')) {
            $('#tablaProfesores').DataTable().destroy();
        }
        this.dataTableProfesores = $('#tablaProfesores').DataTable({
            language: { 
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' 
            },
            columnDefs: [{ orderable: false, targets: [3] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades() || [];
        } catch (error) {
            console.error('Error cargando facultades:', error);
            this.facultades = [];
        }
    }

    async cargarDepartamentos() {
        try {
            this.departamentos = await m_departamento.obtenerDepartamentos() || [];
            u_profesor.cargarDepartamentos(this.departamentos);
        } catch (error) {
            console.error('Error cargando departamentos:', error);
            this.departamentos = [];
        }
    }

    async cargarUsuarios() {
        try {
            this.usuarios = await m_usuario.obtenerUsuarios() || [];
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.usuarios = [];
        }
    }

    async cargarProfesores() {
        try {
            this.profesores = await m_profesor.obtenerProfesoresPorFacultad() || [];
            this.actualizarTablaProfesores();
        } catch (error) {
            console.error('Error cargando profesores:', error);
            Alerta.error('Error', 'Fallo al cargar profesores');
            this.profesores = [];
        }
    }

    async cargarFormaciones() {
        try {
            // Cargar formaciones para todos los profesores (esto podría optimizarse)
            const todasFormaciones = [];
            for (const profesor of this.profesores) {
                const formacion = await m_formacion.obtenerFormacionPorProfesor(profesor.idProfesor);
                if (formacion) {
                    todasFormaciones.push(formacion);
                }
            }
            this.formaciones = todasFormaciones;
        } catch (error) {
            console.error('Error cargando formaciones:', error);
            this.formaciones = [];
        }
    }

    async obtenerFormacionPorProfesor(idProfesor) {
        try {
            return await m_formacion.obtenerFormacionPorProfesor(idProfesor);
        } catch (error) {
            console.error('Error obteniendo formación:', error);
            return null;
        }
    }

    async obtenerUsuarioPorId(idUsuario) {
        return this.usuarios.find(u => u.idUsuario == idUsuario) || null;
    }

    async obtenerDepartamentoPorId(idDepartamento) {
        return this.departamentos.find(d => d.idDepartamento == idDepartamento) || null;
    }

    // ========== CONFIGURACIÓN ==========
    configurarValidaciones() {
        u_profesor.configurarValidaciones();
    }

    configurarCombos() {
        u_profesor.inicializarComboDepartamentos();
        u_profesor.renderizarDropdownDepartamentos();
    }

    configurarArchivos() {
        u_profesor.configurarSubidaArchivos();
    }

    configurarImagen() {
        u_profesor.configurarSubidaImagen();
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Botón nuevo profesor
        $('.nuevo').off('click').on('click', () => {
            this.modoEdicion = false;
            this.profesorActual = null;
            u_profesor.limpiarModal();
            u_profesor.configurarModoEdicion(false);
        });

        // Navegación entre secciones
        $('#siguiente').off('click').on('click', () => {
            u_profesor.irSiguiente();
        });

        $('#anterior').off('click').on('click', () => {
            u_profesor.irAnterior();
        });

        // Guardar profesor
        $('#btnGuardarProfesor').off('click').on('click', () => this.guardarProfesor());

        // Eventos de la tabla
        $(document).off('click', '.editar-profesor').on('click', '.editar-profesor', (e) => {
            e.stopPropagation();
            this.editarProfesor($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.ver-detalles-profesor').on('click', '.ver-detalles-profesor', (e) => {
            e.stopPropagation();
            this.verDetallesProfesor($(e.currentTarget).data('id'));
        });

        // Cuando se cierra el modal
        $('#modalNuevoProfesor').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_profesor.limpiarModal();
            }
        });

        // Forzar rol Profesor
        $('#rolUsuario').off('change').on('change', function() {
            if ($(this).val() !== 'Profesor') {
                $(this).val('Profesor');
                Alerta.advertencia('Rol fijo', 'Los profesores solo pueden tener el rol de Profesor');
            }
        });
    }

    // ========== FUNCIONES PARA PROFESORES ==========
    
    async guardarProfesor() {
        // Validar todas las secciones
        if (!u_profesor.validarSeccion1() || !u_profesor.validarSeccion2() || !u_profesor.validarSeccion3()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente todos los campos');
            return;
        }
        
        try {
            // ===== 1. CREAR O ACTUALIZAR USUARIO =====
            const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
            const esCorreo = nombreOCorreo.includes('@');
            
            let idUsuario;
            
            if (this.modoEdicion && this.profesorActual?.idUsuario) {
                // Actualizar usuario existente
                idUsuario = this.profesorActual.idUsuario;
                
                const datosUsuario = {
                    idUsuario: idUsuario,
                    nombreUsuario: esCorreo ? nombreOCorreo.split('@')[0] : nombreOCorreo,
                    correo: esCorreo ? nombreOCorreo : `${nombreOCorreo}@profesor.com`,
                    rol: 'Profesor'
                };
                
                // Si hay nueva imagen
                const archivoImagen = $('#campoArchivoFotoPerfil')[0].files[0];
                if (archivoImagen) {
                    // Aquí iría la lógica para subir la imagen
                    datosUsuario.foto = 'ruta/de/la/imagen.jpg';
                }
                
                await m_usuario.actualizarUsuario(datosUsuario);
                
            } else {
                // Crear nuevo usuario
                const datosUsuario = {
                    nombreUsuario: esCorreo ? nombreOCorreo.split('@')[0] : nombreOCorreo,
                    correo: esCorreo ? nombreOCorreo : `${nombreOCorreo}@profesor.com`,
                    contrasena: 'temporal123', // Se cambia en primer inicio
                    rol: 'Profesor',
                    estado: 1
                };
                
                // Si hay imagen
                const archivoImagen = $('#campoArchivoFotoPerfil')[0].files[0];
                if (archivoImagen) {
                    datosUsuario.foto = 'ruta/de/la/imagen.jpg';
                }
                
                const resultado = await m_usuario.insertarUsuario(datosUsuario);
                idUsuario = resultado?.idUsuario || resultado?.id;
            }
            
            if (!idUsuario) {
                throw new Error('No se pudo crear/actualizar el usuario');
            }

            // ===== 2. CREAR O ACTUALIZAR PROFESOR =====
            const idDepartamento = u_profesor.getDepartamentoSeleccionado();
            
            const datosProfesor = {
                idUsuario: idUsuario,
                nombreProfesor: $('#nombreProfesor').val().trim(),
                apellidosProfesor: $('#apellidosProfesor').val().trim(),
                dipProfesor: $('#dipProfesor').val().trim(),
                especialidad: $('#especialidadFormacionProfesor').val().trim(),
                gradoEstudio: $('#gradoFormacionProfesor').val().trim(),
                idDepartamento: idDepartamento,
                genero: $('#generosProfesor').val(),
                nacionalidad: $('#nacionalidadProfesor').val().trim(),
                responsabilidad: $('#responsabilidadProfesor').val(),
                correoProfesor: $('#correoProfesor').val().trim(),
                telefonoProfesor: $('#telefonoProfesor').val().trim()
            };
            
            let idProfesor;
            
            if (this.modoEdicion) {
                datosProfesor.idProfesor = this.profesorActual.idProfesor;
                await m_profesor.actualizarProfesor(datosProfesor);
                idProfesor = this.profesorActual.idProfesor;
            } else {
                const resultado = await m_profesor.insertarProfesor(datosProfesor);
                idProfesor = resultado?.idProfesor || resultado?.id;
            }

            // ===== 3. CREAR O ACTUALIZAR FORMACIÓN =====
            if (idProfesor) {
                const formacionExistente = await this.obtenerFormacionPorProfesor(idProfesor);
                
                const datosFormacion = {
                    idProfesor: idProfesor,
                    institucion: $('#institucionFormacionProfesor').val().trim(),
                    tipoFormacion: $('#tiposFormacionesProfesor').val(),
                    nivel: $('#nivelesFormacionesProfesor').val(),
                    titulo: $('#titulosProfesor').val().trim()
                };
                
                if (formacionExistente) {
                    datosFormacion.idFormacion = formacionExistente.idFormacion;
                    await m_formacion.actualizarFormacion(datosFormacion);
                } else {
                    await m_formacion.insertarFormacion(datosFormacion);
                }
            }

            // ===== 4. SUBIR ARCHIVOS ADJUNTOS =====
            const archivos = u_profesor.obtenerArchivosParaEnviar();
            if (archivos.length > 0 && idProfesor) {
                for (let archivo of archivos) {
                    // Aquí iría la lógica para subir el archivo al servidor
                    await m_archivo.insertarArchivo({
                        url: 'ruta/del/archivo', // URL después de subir
                        tipoArchivo: archivo.type.startsWith('image/') ? 'foto' : 'pdf',
                        idReferencia: idProfesor,
                        tablaReferencia: 'profesores'
                    });
                }
            }

            // ===== 5. RECARGAR Y CERRAR =====
            await this.cargarUsuarios();
            await this.cargarProfesores();
            await this.cargarFormaciones();
            
            if (this.modalInstance) {
                this.modalInstance.hide();
            }
            
            Alerta.exito('Éxito', this.modoEdicion ? 'Profesor actualizado' : 'Profesor creado');

        } catch (error) {
            console.error('Error al guardar profesor:', error);
            Alerta.error('Error', 'No se pudo guardar el profesor');
        }
    }

    async editarProfesor(id) {
        const profesor = this.profesores.find(p => p.idProfesor == id);
        if (!profesor) return;
        
        this.modoEdicion = true;
        this.profesorActual = profesor;
        
        // Obtener datos relacionados
        const usuario = await this.obtenerUsuarioPorId(profesor.idUsuario);
        const formacion = await this.obtenerFormacionPorProfesor(id);
        const departamento = await this.obtenerDepartamentoPorId(profesor.idDepartamento);
        
        // ===== CARGAR DATOS EN EL FORMULARIO =====
        
        // Sección 1 - Datos personales
        $('#nombreProfesor').val(profesor.nombreProfesor || '');
        $('#apellidosProfesor').val(profesor.apellidosProfesor || '');
        $('#dipProfesor').val(profesor.dipProfesor || '');
        $('#nacionalidadProfesor').val(profesor.nacionalidad || '');
        $('#generosProfesor').val(profesor.genero || 'Ninguno');
        $('#correoProfesor').val(profesor.correoProfesor || '');
        $('#telefonoProfesor').val(profesor.telefonoProfesor || '');
        
        // Sección 2 - Datos de formación
        if (formacion) {
            $('#institucionFormacionProfesor').val(formacion.institucion || '');
            $('#tiposFormacionesProfesor').val(formacion.tipoFormacion || 'Ninguno');
            $('#nivelesFormacionesProfesor').val(formacion.nivel || 'Ninguno');
            $('#titulosProfesor').val(formacion.titulo || '');
        }
        
        $('#especialidadFormacionProfesor').val(profesor.especialidad || '');
        $('#gradoFormacionProfesor').val(profesor.gradoEstudio || '');
        
        // Departamento
        if (departamento) {
            $('#comboDepartamentosProfesor').val(departamento.nombre);
            $('#comboDepartamentosProfesor').data('selected', departamento.idDepartamento);
        }
        
        $('#responsabilidadProfesor').val(profesor.responsabilidad || 'Ninguno');
        
        // Sección 3 - Datos de usuario
        if (usuario) {
            // Determinar si es correo o nombre de usuario
            if (usuario.correo && usuario.correo.includes('@')) {
                $('#nombreOCorreoUsuario').val(usuario.correo);
            } else {
                $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
            }
            
            // Si tiene foto, mostrarla
            if (usuario.foto) {
                $('#contenedorFotoPerfil').html(`<img src="${usuario.foto}" class="img-fluid rounded-3" style="max-height: 100px;">`);
            }
            
            $('#rolUsuario').val('Profesor');
        }
        
        u_profesor.configurarModoEdicion(true);
        
        // Reiniciar secciones y mostrar primera
        u_profesor.reiniciarSecciones();
        
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    async verDetallesProfesor(id) {
        const profesor = this.profesores.find(p => p.idProfesor == id);
        if (!profesor) return;
        
        try {
            const usuario = await this.obtenerUsuarioPorId(profesor.idUsuario);
            const formacion = await this.obtenerFormacionPorProfesor(id);
            const departamento = await this.obtenerDepartamentoPorId(profesor.idDepartamento);
            
            const html = u_profesor.generarDetallesProfesorHTML(profesor, usuario, formacion, departamento);
            $('#modalVerDetallesProfesor .card-body').html(html);
            
            if (this.modalDetallesInstance) {
                this.modalDetallesInstance.show();
            }
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }

    actualizarTablaProfesores() {
        u_profesor.actualizarTablaProfesores(this.dataTableProfesores, this.profesores, this.departamentos);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_profesor();
    await controlador.inicializar();
});