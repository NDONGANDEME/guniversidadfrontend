import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_profesor } from "../modelo/m_profesor.js";
import { m_formacion } from "../modelo/m_formacion.js";
import { u_profesor } from "../utilidades/u_profesor.js";
import { m_archivo } from "../../public/modelo/m_archivo.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { m_facultad } from "../../admin/modelo/m_facultad.js";
import { m_departamento } from "../../admin/modelo/m_departamento.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";

export class c_profesor {
    constructor() {
        this.profesores = [];
        this.profesorActual = null;
        this.modoEdicion = false;
        this.dataTableProfesores = null;
        
        this.usuarios = [];
        this.facultades = [];
        this.departamentos = [];
        this.formaciones = [];
        
        this.modalInstance = null;
        this.modalDetallesInstance = null;
        
        this.actorConectado = null;
    }

    async inicializar() {
        try {
            this.actorConectado = m_sesion.leerSesion('usuarioActivo');
            
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            this.inicializarDataTables();
            
            await this.cargarFacultades();
            await this.cargarDepartamentos();
            await this.cargarUsuarios();
            await this.cargarProfesores();
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarArchivos();
            this.configurarImagen();
            
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

    async cargarFacultades() {
        try {
            const datos = await m_facultad.obtenerFacultades();
            this.facultades = datos || [];
        } catch (error) {
            console.error('Error cargando facultades:', error);
            this.facultades = [];
        }
    }

    async cargarDepartamentos() {
        try {
            $('#comboDepartamentosProfesor').prop('disabled', true).val('Cargando departamentos...');
            
            const datos = await m_departamento.obtenerDepartamentos();
            this.departamentos = datos || [];
            
            u_profesor.inicializarComboDepartamentos(this.departamentos);
            
            $('#comboDepartamentosProfesor').prop('disabled', false).val('');
            
        } catch (error) {
            console.error('Error cargando departamentos:', error);
            Alerta.error('Error', 'No se pudieron cargar los departamentos');
            this.departamentos = [];
            u_profesor.inicializarComboDepartamentos([]);
            $('#comboDepartamentosProfesor').prop('disabled', false).val('');
        }
    }

    async cargarUsuarios() {
        try {
            const datos = await m_usuario.obtenerUsuarios();
            this.usuarios = datos || [];
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.usuarios = [];
        }
    }

    async cargarProfesores() {
        let idFacultadActor = this.actorConectado?.datos_rol?.idFacultad;

        try {
            const datos = await m_profesor.obtenerProfesoresPorFacultad(idFacultadActor);
            this.profesores = datos || [];
            
            await this.cargarFormaciones();
            
            this.actualizarTablaProfesores();
        } catch (error) {
            console.error('Error cargando profesores:', error);
            Alerta.error('Error', 'Fallo al cargar profesores');
            this.profesores = [];
        }
    }

    async cargarFormaciones() {
        try {
            this.formaciones = [];
            for (const profesor of this.profesores) {
                const formacion = await this.obtenerFormacionPorProfesor(profesor.idProfesor);
                if (formacion) {
                    this.formaciones.push(formacion);
                }
            }
        } catch (error) {
            console.error('Error cargando formaciones:', error);
            this.formaciones = [];
        }
    }

    async obtenerFormacionPorProfesor(idProfesor) {
        try {
            const resultado = await m_formacion.obtenerFormacionPorProfesor(idProfesor);
            if (Array.isArray(resultado) && resultado.length > 0) {
                return resultado[0];
            }
            return resultado || null;
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

    configurarValidaciones() {
        u_profesor.configurarValidaciones();
    }

    configurarArchivos() {
        u_profesor.configurarSubidaArchivos();
    }

    configurarImagen() {
        u_profesor.configurarSubidaImagen();
    }

    configurarEventos() {
        $('.nuevo').off('click').on('click', () => {
            this.modoEdicion = false;
            this.profesorActual = null;
            u_profesor.limpiarModal();
            u_profesor.configurarModoEdicion(false);
            u_profesor.prepararNuevoUsuario();
        });

        $('#siguiente').off('click').on('click', () => {
            u_profesor.irSiguiente();
        });

        $('#anterior').off('click').on('click', () => {
            u_profesor.irAnterior();
        });

        $('#btnGuardarProfesor').off('click').on('click', () => this.guardarProfesor());

        $(document).off('click', '.editar-profesor').on('click', '.editar-profesor', (e) => {
            e.stopPropagation();
            this.editarProfesor($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.ver-detalles-profesor').on('click', '.ver-detalles-profesor', (e) => {
            e.stopPropagation();
            this.verDetallesProfesor($(e.currentTarget).data('id'));
        });

        $('#modalNuevoProfesor').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_profesor.limpiarModal();
            }
        });
    }

    prepararDatosUsuario() {
        const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
        const esCorreo = nombreOCorreo.includes('@');
        
        const datosUsuario = {
            nombreUsuario: esCorreo ? nombreOCorreo.split('@')[0] : nombreOCorreo,
            correo: esCorreo ? nombreOCorreo : `${nombreOCorreo}@profesor.com`,
            rol: 'Profesor',
            estado: 'activo'
        };

        if (!this.modoEdicion) {
            const contrasenaGenerada = u_profesor.obtenerContrasenaGenerada();
            if (!contrasenaGenerada) {
                throw new Error('No se pudo generar la contraseña');
            }
            datosUsuario.contrasena = contrasenaGenerada;
        }

        const archivoImagen = u_profesor.obtenerImagenParaSubir();
        if (archivoImagen) {
            datosUsuario.foto = archivoImagen;
        }

        return datosUsuario;
    }

    prepararDatosProfesor(idUsuario) {
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

        if (this.modoEdicion && this.profesorActual) {
            datosProfesor.idProfesor = this.profesorActual.idProfesor;
        }

        return datosProfesor;
    }

    prepararDatosFormacion(idProfesor) {
        const datosFormacion = {
            idProfesor: idProfesor,
            institucion: $('#institucionFormacionProfesor').val().trim(),
            tipoFormacion: $('#tiposFormacionesProfesor').val(),
            nivel: $('#nivelesFormacionesProfesor').val(),
            titulo: $('#titulosProfesor').val().trim()
        };

        return datosFormacion;
    }

    async guardarProfesor() {
        if (!u_profesor.validarFormularioCompleto(this.modoEdicion)) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente todos los campos');
            return;
        }

        const idDepartamento = u_profesor.getDepartamentoSeleccionado();
        if (!idDepartamento) {
            Alerta.advertencia('Campo requerido', 'Debe seleccionar un departamento');
            return;
        }
        
        try {
            let idUsuario = null;
            let idProfesor = null;
            
            const datosUsuario = this.prepararDatosUsuario();
            
            if (this.modoEdicion && this.profesorActual?.idUsuario) {
                datosUsuario.idUsuario = this.profesorActual.idUsuario;
                await m_usuario.actualizarUsuario(datosUsuario);
                idUsuario = this.profesorActual.idUsuario;
            } else {
                const resultado = await m_usuario.insertarUsuario(datosUsuario);
                idUsuario = resultado?.idUsuario || resultado?.id;
            }
            
            if (!idUsuario) {
                throw new Error('No se pudo crear/actualizar el usuario');
            }

            const datosProfesor = this.prepararDatosProfesor(idUsuario);
            
            if (this.modoEdicion && this.profesorActual) {
                await m_profesor.actualizarProfesor(datosProfesor);
                idProfesor = this.profesorActual.idProfesor;
            } else {
                const resultado = await m_profesor.insertarProfesor(datosProfesor);
                idProfesor = resultado?.idProfesor || resultado?.id;
            }
            
            if (!idProfesor) {
                throw new Error('No se pudo crear/actualizar el profesor');
            }

            const formacionExistente = await this.obtenerFormacionPorProfesor(idProfesor);
            const datosFormacion = this.prepararDatosFormacion(idProfesor);
            
            if (formacionExistente) {
                datosFormacion.idFormacion = formacionExistente.idFormacion;
                await m_formacion.actualizarFormacion(datosFormacion);
            } else {
                await m_formacion.insertarFormacion(datosFormacion);
            }

            if (!this.modoEdicion) {
                const contrasenaGenerada = u_profesor.obtenerContrasenaGenerada();
                await Alerta.informacion(
                    'Profesor creado correctamente', 
                    `La contraseña para el usuario es: ${contrasenaGenerada}\n\nGuárdala en un lugar seguro.`
                );
            }
            
            await this.cargarUsuarios();
            await this.cargarProfesores();
            
            if (this.modalInstance) {
                this.modalInstance.hide();
            }
            
            Alerta.exito('Éxito', this.modoEdicion ? 'Profesor actualizado' : 'Profesor creado');
            
        } catch (error) {
            console.error('Error al guardar profesor:', error);
            
            if (error.mensaje) {
                Alerta.error('Error', error.mensaje);
            } else {
                Alerta.error('Error', 'No se pudo guardar el profesor');
            }
        }
    }

    async editarProfesor(id) {
        const profesor = this.profesores.find(p => p.idProfesor == id);
        if (!profesor) return;
        
        this.modoEdicion = true;
        this.profesorActual = profesor;
        
        try {
            const usuario = await this.obtenerUsuarioPorId(profesor.idUsuario);
            const formacion = await this.obtenerFormacionPorProfesor(id);
            const departamento = await this.obtenerDepartamentoPorId(profesor.idDepartamento);
            
            u_profesor.cargarDatosEnModal(profesor, usuario, formacion, departamento, this.facultades);
            
            if (departamento) {
                u_profesor.setDepartamentoSeleccionado(departamento.idDepartamento, departamento.nombre);
            }
            
            u_profesor.configurarModoEdicion(true);
            
            if (this.modalInstance) {
                this.modalInstance.show();
            }
        } catch (error) {
            console.error('Error al cargar datos para edición:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos del profesor');
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

$(document).ready(async function() {
    const controlador = new c_profesor();
    await controlador.inicializar();
});