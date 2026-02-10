import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_profesor } from "../modelo/m_profesor.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class c_profesor
{
    constructor() {
        // Entidades principales
        this.profesores = [];
        this.profesorActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.dataTable = null;
        
        // Datos de sessionStorage
        this.departamentos = [];
        this.usuarios = [];
        
        // Variables de validación
        this.validaciones = {
            profesor: {
                nombre: false,
                apellidos: false,
                correo: false,
                telefono: false,
                nacionalidad: false,
                genero: false,
                departamento: false,
                estado: false,
                responsabilidad: false
            },
            usuario: {
                login: false,
                rol: false
            }
        };
        
        // Control de secciones
        this.seccionActual = 1;
        this.totalSecciones = 3;
    }


    // ============================================
    // MÉTODO PRINCIPAL DE INICIALIZACIÓN
    // ============================================
    inicializar() {
        this.cargarDatosDeSesion();
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
        this.cargarSelectores();
        this.obtenerDataTable();
        this.inicializarNavegacionSecciones();
    }


    // ============================================
    // CARGA DE DATOS DESDE SESSIONSTORAGE
    // ============================================
    cargarDatosDeSesion() {
        try {
            // Cargar departamentos
            const departamentosJSON = sessionStorage.getItem('departamentos');
            if (departamentosJSON) {
                const datos = JSON.parse(departamentosJSON);
                this.departamentos = datos.map(d => ({ 
                    idDepartamento: d.idDepartamento, 
                    nombre: d.nombreDepartamento 
                }));
            }
            
            // Cargar usuarios
            this.usuarios = JSON.parse(sessionStorage.getItem('usuarios') || '[]');
            
            console.log('Datos cargados:', { 
                departamentos: this.departamentos.length,
                usuarios: this.usuarios.length
            });
        } catch (error) {
            console.error('Error cargando datos de sesión:', error);
        }
    }


    // ============================================
    // CARGA DE SELECTORES
    // ============================================
    cargarSelectores() {
        this.cargarDepartamentosEnSelect();
    }


    cargarDepartamentosEnSelect() {
        const select = $('#departamentosProfesor');
        select.empty();
        select.append('<option value="Ninguno">Seleccione departamento...</option>');
        
        this.departamentos.forEach(departamento => {
            select.append(`<option value="${departamento.idDepartamento}">${departamento.nombre}</option>`);
        });
    }


    // ============================================
    // NAVEGACIÓN POR SECCIONES CON ANIMACIONES
    // ============================================
    inicializarNavegacionSecciones() {
        this.mostrarSeccion(1);
        
        // Botón siguiente
        $('#siguiente').off('click').on('click', () => {
            if (this.validarSeccionActual()) {
                if (this.seccionActual < this.totalSecciones) {
                    this.animarCambioSeccion(this.seccionActual, this.seccionActual + 1, 'siguiente');
                    this.seccionActual++;
                    this.actualizarBotonesNavegacion();
                }
            }
        });
        
        // Botón anterior
        $('#anterior').off('click').on('click', () => {
            if (this.seccionActual > 1) {
                this.animarCambioSeccion(this.seccionActual, this.seccionActual - 1, 'anterior');
                this.seccionActual--;
                this.actualizarBotonesNavegacion();
            }
        });
    }


    animarCambioSeccion(seccionSalida, seccionEntrada, direccion) {
        const $seccionSalida = $(`#seccion${seccionSalida}`);
        const $seccionEntrada = $(`#seccion${seccionEntrada}`);
        
        $('.seccion').removeClass('izquierda derecha anim-in anim-out anim-in-rev anim-out-rev');
        
        if (direccion === 'siguiente') {
            $seccionSalida.addClass('anim-out');
            $seccionEntrada.addClass('derecha anim-in');
        } else {
            $seccionSalida.addClass('anim-out-rev');
            $seccionEntrada.addClass('izquierda anim-in-rev');
        }
        
        setTimeout(() => {
            $('.seccion').removeClass('active');
            $seccionEntrada.addClass('active');
            $seccionEntrada.removeClass('derecha izquierda anim-in anim-in-rev');
            $seccionSalida.removeClass('anim-out anim-out-rev');
        }, 50);
    }


    mostrarSeccion(numero) {
        $('.seccion').removeClass('active');
        $(`#seccion${numero}`).addClass('active');
        this.seccionActual = numero;
        this.actualizarBotonesNavegacion();
    }


    actualizarBotonesNavegacion() {
        if (this.seccionActual === 1) {
            $('#anterior').hide();
        } else {
            $('#anterior').show();
        }
        
        if (this.seccionActual === this.totalSecciones) {
            $('#siguiente').hide();
            $('#btnGuardarProfesor').show();
        } else {
            $('#siguiente').show();
            $('#btnGuardarProfesor').hide();
        }
    }


    validarSeccionActual() {
        switch(this.seccionActual) {
            case 1: return this.validarSeccionPersonal();
            case 2: return this.validarSeccionProfesional();
            case 3: return this.validarSeccionUsuario();
            default: return true;
        }
    }


    // ============================================
    // VALIDACIONES POR SECCIÓN
    // ============================================
    validarSeccionPersonal() {
        const campos = [
            { id: '#nombreProfesor', valido: this.validaciones.profesor.nombre, msg: 'Complete el nombre' },
            { id: '#apellidosProfesor', valido: this.validaciones.profesor.apellidos, msg: 'Complete los apellidos' },
            { id: '#correoProfesor', valido: this.validaciones.profesor.correo, msg: 'Complete el correo' },
            { id: '#telefonoProfesor', valido: this.validaciones.profesor.telefono, msg: 'Complete el teléfono' },
            { id: '#nacionalidadProfesor', valido: this.validaciones.profesor.nacionalidad, msg: 'Complete la nacionalidad' },
            { id: '#generosProfesor', valido: this.validaciones.profesor.genero, msg: 'Seleccione el género' }
        ];
        
        const camposInvalidos = campos.filter(c => !c.valido);
        
        if (camposInvalidos.length > 0) {
            Alerta.advertencia('Campos incompletos', 'Complete todos los datos personales del profesor');
            return false;
        }
        
        return true;
    }


    validarSeccionProfesional() {
        if (!this.validaciones.profesor.estado) {
            Alerta.advertencia('Campo incompleto', 'Seleccione el estado del profesor');
            return false;
        }
        return true;
    }


    validarSeccionUsuario() {
        if (!this.validaciones.usuario.login) {
            Alerta.advertencia('Campo incompleto', 'Complete el nombre de usuario o correo');
            return false;
        }
        return true;
    }


    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    configurarEventos() {
        // Guardar profesor
        $('#btnGuardarProfesor').off('click').on('click', () => this.guardarProfesor());
        
        // Nuevo registro
        $('.btn-success').filter((i, el) => $(el).find('.fa-plus').length).off('click').on('click', () => {
            this.modoEdicion = false;
            this.profesorActual = null;
            $('#modalNuevoProfesorLabel').text('Agregar nuevo profesor');
            this.limpiarFormulario();
            this.mostrarSeccion(1);
        });
        
        // Editar (delegación)
        $(document).off('click', '.editar').on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.prepararEdicion(id);
        });
        
        // Deshabilitar (delegación)
        $(document).off('click', '.deshabilitar').on('click', '.deshabilitar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.deshabilitarProfesor(id);
        });
        
        // Ver detalles (delegación)
        $(document).off('click', '.verDetalles').on('click', '.verDetalles', (e) => {
            const id = $(e.currentTarget).data('id');
            this.mostrarDetallesProfesor(id);
        });
    }


    configurarValidaciones() {
        // Validaciones Profesor - Sección 1
        $('#nombreProfesor').on('input', () => {
            const valor = $('#nombreProfesor').val().trim();
            this.validaciones.profesor.nombre = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#nombreProfesor', this.validaciones.profesor.nombre, '#errorNombreProfesor');
        });

        $('#apellidosProfesor').on('input', () => {
            const valor = $('#apellidosProfesor').val().trim();
            this.validaciones.profesor.apellidos = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#apellidosProfesor', this.validaciones.profesor.apellidos, '#errorApellidosProfesor');
        });

        $('#correoProfesor').on('input', () => {
            const valor = $('#correoProfesor').val().trim();
            this.validaciones.profesor.correo = u_verificaciones.validarCorreo(valor);
            this.aplicarValidacion('#correoProfesor', this.validaciones.profesor.correo, '#errorCorreoProfesor');
        });

        $('#telefonoProfesor').on('input', () => {
            const valor = $('#telefonoProfesor').val().trim();
            this.validaciones.profesor.telefono = u_verificaciones.validarTelefono(valor);
            this.aplicarValidacion('#telefonoProfesor', this.validaciones.profesor.telefono, '#errorTelefonoProfesor');
        });

        $('#nacionalidadProfesor').on('input', () => {
            const valor = $('#nacionalidadProfesor').val().trim();
            this.validaciones.profesor.nacionalidad = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#nacionalidadProfesor', this.validaciones.profesor.nacionalidad, '#errorNacionalidadProfesor');
        });

        $('#generosProfesor').on('change', () => {
            const valor = $('#generosProfesor').val();
            this.validaciones.profesor.genero = valor !== '' && valor !== null && valor !== 'Ninguno';
            this.aplicarValidacion('#generosProfesor', this.validaciones.profesor.genero, '#errorGenerosProfesor');
        });

        // Validaciones Profesor - Sección 2
        $('#departamentosProfesor').on('change', () => {
            const valor = $('#departamentosProfesor').val();
            this.validaciones.profesor.departamento = true;
            if (valor !== "Ninguno") {
                $('#departamentosProfesor').removeClass('border-danger').addClass('border-success');
                $('#errorDepartamentosProfesor').text('').hide();
            } else {
                $('#departamentosProfesor').removeClass('border-success').addClass('border-danger');
                $('#errorDepartamentosProfesor').text('Seleccione un departamento (opcional)').show();
            }
        });

        $('#estadosProfesor').on('change', () => {
            const valor = $('#estadosProfesor').val();
            this.validaciones.profesor.estado = valor !== '' && valor !== null && valor !== 'Ninguno';
            if (this.validaciones.profesor.estado) {
                $('#estadosProfesor').removeClass('border-danger').addClass('border-success');
            } else {
                $('#estadosProfesor').removeClass('border-success').addClass('border-danger');
            }
        });

        $('#responsabilidadProfesor').on('change', () => {
            this.validaciones.profesor.responsabilidad = true;
            $('#responsabilidadProfesor').removeClass('border-danger border-success');
        });

        // Validaciones Usuario - Sección 3
        $('#nombreOCorreoUsuarioProfesor').on('input', () => {
            const valor = $('#nombreOCorreoUsuarioProfesor').val().trim();
            this.validaciones.usuario.login = u_verificaciones.validarTexto(valor) || u_verificaciones.validarCorreo(valor);
            this.aplicarValidacion('#nombreOCorreoUsuarioProfesor', this.validaciones.usuario.login, '#errorNombreOCorreoUsuarioProfesor');
        });

        $('#rolesUsuarioProfesor').on('change', () => {
            const valor = $('#rolesUsuarioProfesor').val();
            this.validaciones.usuario.rol = valor !== '' && valor !== null && valor !== 'Ninguno';
            if (this.validaciones.usuario.rol) {
                $('#rolesUsuarioProfesor').removeClass('border-danger').addClass('border-success');
                $('#errorRolesUsuarioProfesor').text('').hide();
            } else {
                $('#rolesUsuarioProfesor').removeClass('border-success').addClass('border-danger');
                $('#errorRolesUsuarioProfesor').text('Seleccione un rol').show();
            }
        });
    }


    aplicarValidacion(selector, esValido, errorSelector) {
        if (esValido) {
            $(selector).removeClass('border-danger').addClass('border-success');
            $(errorSelector).text('').hide();
        } else {
            $(selector).removeClass('border-success').addClass('border-danger');
            $(errorSelector).text(this.obtenerMensajeError(selector)).show();
        }
    }


    obtenerMensajeError(selector) {
        const mensajes = {
            '#nombreProfesor': 'El nombre debe tener entre 3 y 100 caracteres',
            '#apellidosProfesor': 'Los apellidos deben tener entre 3 y 100 caracteres',
            '#correoProfesor': 'Ingrese un correo válido',
            '#telefonoProfesor': 'El teléfono debe tener formato válido (+240 123 456)',
            '#nacionalidadProfesor': 'La nacionalidad debe tener entre 3 y 50 caracteres',
            '#generosProfesor': 'Seleccione un género',
            '#nombreOCorreoUsuarioProfesor': 'Ingrese un nombre de usuario o correo válido',
            '#rolesUsuarioProfesor': 'Seleccione un rol'
        };
        return mensajes[selector] || 'Campo inválido';
    }


    // ============================================
    // GENERADOR DE CONTRASEÑA ÚNICA
    // ============================================
    generarContraseñaUnica() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let contraseña;
        let existe;
        
        do {
            const longitud = Math.floor(Math.random() * 5) + 8;
            contraseña = '';
            for (let i = 0; i < longitud; i++) {
                contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            existe = this.usuarios.some(u => u.contraseña === contraseña);
        } while (existe);
        
        return contraseña;
    }


    // ============================================
    // ENVÍO DE CREDENCIALES
    // ============================================
    enviarCredenciales(usuario, contraseña) {
        const enviarSMS = $('#envioSMS').is(':checked');
        const enviarCorreo = $('#envioCorreo').is(':checked');
        const enviarAmbos = $('#envioAmbos').is(':checked');
        
        let mensajes = [];
        let metodosEnvio = [];
        
        if (enviarSMS || enviarAmbos) {
            mensajes.push(`📱 SMS enviado al ${$('#telefonoProfesor').val()}`);
            metodosEnvio.push('SMS');
        }
        
        if (enviarCorreo || enviarAmbos) {
            mensajes.push(`📧 Correo enviado a ${$('#correoProfesor').val()}`);
            metodosEnvio.push('Correo');
        }
        
        if (mensajes.length > 0) {
            console.log('=== CREDENCIALES ENVIADAS ===');
            console.log(`Usuario: ${usuario.login}`);
            console.log(`Contraseña: ${contraseña}`);
            console.log('Métodos:', metodosEnvio.join(', '));
            
            Alerta.exito(
                'Credenciales enviadas',
                `👤 Usuario: ${usuario.login}\n🔑 Contraseña: ${contraseña}\n\n${mensajes.join('\n')}`,
                { timeout: 10000 }
            );
        } else {
            // Si no se seleccionó ningún método, mostrar las credenciales igualmente
            Alerta.exito(
                'Credenciales generadas',
                `👤 Usuario: ${usuario.login}\n🔑 Contraseña: ${contraseña}\n\n📌 No se seleccionó método de envío. Guarde estas credenciales para entregarlas al profesor.`,
                { timeout: 10000 }
            );
        }
    }


    // ============================================
    // DATATABLE
    // ============================================
    obtenerDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaProfesores')) {
            this.dataTable = $('#tablaProfesores').DataTable();
        } else {
            this.dataTable = $('#tablaProfesores').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
            });
        }
    }


    // ============================================
    // CARGA DE DATOS INICIALES
    // ============================================
    cargarProfesoresDeSesion() {
        try {
            const profesoresJSON = sessionStorage.getItem('profesores');
            if (profesoresJSON) {
                return JSON.parse(profesoresJSON);
            }
        } catch (error) {
            console.error('Error cargando profesores:', error);
        }
        return null;
    }


    cargarDatosIniciales() {
        const profesoresGuardados = this.cargarProfesoresDeSesion();
        
        if (profesoresGuardados && profesoresGuardados.length > 0) {
            this.profesores = profesoresGuardados.map(p => 
                new m_profesor(
                    p.idProfesor,
                    p.idUsuario,
                    p.nombre,
                    p.apellidos,
                    p.correo,
                    p.telefono,
                    p.nacionalidad,
                    p.idDepartamento,
                    p.estado,
                    p.genero,
                    p.responsabilidad
                )
            );
        } else {
            // Datos de ejemplo
            this.profesores = [
                new m_profesor(1, 1001, "Samuel", "Elá", "samuel.ela@email.com", 
                              "+240 222 123 456", "ecuatoguineana", null, "Alta", "Masculino", "Ninguna")
            ];
            this.guardarProfesoresEnSesion();
        }
        
        if (this.profesores.length > 0) {
            const maxId = Math.max(...this.profesores.map(p => p.idProfesor));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // ============================================
    // OPERACIONES CRUD
    // ============================================
    async guardarProfesor() {
        if (!this.validarSeccionActual()) {
            return;
        }
        
        try {
            const id = this.modoEdicion ? this.profesorActual.idProfesor : this.contadorId++;
            const idUsuario = this.modoEdicion ? this.profesorActual.idUsuario : this.contadorId + 2000;
            
            if (this.modoEdicion) {
                // EDITAR - Solo actualizar datos del profesor
                const index = this.profesores.findIndex(p => p.idProfesor === id);
                if (index !== -1) {
                    this.profesores[index].nombre = $('#nombreProfesor').val().trim();
                    this.profesores[index].apellidos = $('#apellidosProfesor').val().trim();
                    this.profesores[index].correo = $('#correoProfesor').val().trim();
                    this.profesores[index].telefono = $('#telefonoProfesor').val().trim();
                    this.profesores[index].nacionalidad = $('#nacionalidadProfesor').val().trim();
                    this.profesores[index].genero = $('#generosProfesor').val();
                    this.profesores[index].idDepartamento = $('#departamentosProfesor').val() !== "Ninguno" 
                        ? parseInt($('#departamentosProfesor').val()) : null;
                    this.profesores[index].estado = $('#estadosProfesor').val();
                    this.profesores[index].responsabilidad = $('#responsabilidadProfesor').val();
                    
                    Alerta.exito('Éxito', 'Profesor actualizado correctamente');
                }
            } else {
                // INSERTAR - Nuevo profesor completo
                const nuevoProfesor = new m_profesor(
                    id,
                    idUsuario,
                    $('#nombreProfesor').val().trim(),
                    $('#apellidosProfesor').val().trim(),
                    $('#correoProfesor').val().trim(),
                    $('#telefonoProfesor').val().trim(),
                    $('#nacionalidadProfesor').val().trim(),
                    $('#departamentosProfesor').val() !== "Ninguno" 
                        ? parseInt($('#departamentosProfesor').val()) : null,
                    $('#estadosProfesor').val(),
                    $('#generosProfesor').val(),
                    $('#responsabilidadProfesor').val()
                );
                
                this.profesores.push(nuevoProfesor);
                
                // Guardar usuario
                const usuario = this.guardarUsuarioEnSesion(idUsuario);
                
                // ENVIAR CREDENCIALES (solo para nuevos profesores)
                if (usuario) {
                    this.enviarCredenciales(usuario, usuario.contraseña);
                }
                
                Alerta.exito('Éxito', 'Profesor creado correctamente');
            }
            
            this.actualizarTabla();
            this.guardarProfesoresEnSesion();
            this.limpiarFormulario();
            $('#modalNuevoProfesor').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    guardarUsuarioEnSesion(idUsuario) {
        try {
            const contraseña = this.generarContraseñaUnica();
            
            const nuevoUsuario = {
                idUsuario: idUsuario,
                login: $('#nombreOCorreoUsuarioProfesor').val().trim(),
                contraseña: contraseña,
                rol: 'Profesor',
                estado: 'Activo'
            };
            
            this.usuarios.push(nuevoUsuario);
            sessionStorage.setItem('usuarios', JSON.stringify(this.usuarios));
            
            return nuevoUsuario;
        } catch (error) {
            console.error('Error guardando usuario:', error);
            return null;
        }
    }


    prepararEdicion(idProfesor) {
        const profesor = this.profesores.find(p => p.idProfesor == idProfesor);
        
        if (profesor) {
            this.modoEdicion = true;
            this.profesorActual = profesor;
            
            // Cargar datos personales
            $('#nombreProfesor').val(profesor.nombre);
            $('#apellidosProfesor').val(profesor.apellidos);
            $('#correoProfesor').val(profesor.correo);
            $('#telefonoProfesor').val(profesor.telefono);
            $('#nacionalidadProfesor').val(profesor.nacionalidad);
            $('#generosProfesor').val(profesor.genero);
            
            // Cargar datos profesionales
            $('#departamentosProfesor').val(profesor.idDepartamento || "Ninguno");
            $('#estadosProfesor').val(profesor.estado);
            $('#responsabilidadProfesor').val(profesor.responsabilidad);
            
            // No cargamos datos de usuario en edición
            
            $('#modalNuevoProfesorLabel').text('Editar profesor');
            this.mostrarSeccion(1);
            
            // Forzar validaciones
            $('#nombreProfesor').trigger('input');
            $('#apellidosProfesor').trigger('input');
            $('#correoProfesor').trigger('input');
            $('#telefonoProfesor').trigger('input');
            $('#nacionalidadProfesor').trigger('input');
            $('#generosProfesor').trigger('change');
            $('#departamentosProfesor').trigger('change');
            $('#estadosProfesor').trigger('change');
            
            $('#modalNuevoProfesor').modal('show');
        }
    }


    async deshabilitarProfesor(idProfesor) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar este profesor?'
            );
            
            if (confirmacion) {
                this.profesores = this.profesores.filter(p => p.idProfesor != idProfesor);
                this.actualizarTabla();
                this.guardarProfesoresEnSesion();
                Alerta.exito('Éxito', 'Profesor deshabilitado correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    mostrarDetallesProfesor(idProfesor) {
        const profesor = this.profesores.find(p => p.idProfesor == idProfesor);
        
        if (profesor) {
            // Buscar usuario
            const usuario = this.usuarios.find(u => u.idUsuario === profesor.idUsuario);
            
            // Obtener nombre del departamento
            const departamento = this.departamentos.find(d => d.idDepartamento == profesor.idDepartamento);
            
            // Construir HTML de detalles completo
            let html = `
                <div class="card shadow">
                    <div class="card-header py-3 bg-primary text-white">
                        <h6 class="m-0 font-weight-bold">
                            <i class="fas fa-chalkboard-teacher me-2"></i>Información del Profesor
                        </h6>
                    </div>
                    <div class="card-body">
                        <!-- Cabecera con foto y nombre -->
                        <div class="d-flex align-items-center gap-4 mb-4 p-3 bg-light rounded">
                            <div class="imgCarnet">
                                <img src="../../../public/img/undraw_profile.svg" alt="Foto profesor" 
                                     class="rounded-circle border" style="width: 100px; height: 100px;">
                            </div>
                            <div>
                                <h4 class="mb-1">${profesor.nombre} ${profesor.apellidos}</h4>
                                <p class="mb-0 text-muted">
                                    <i class="fas fa-envelope me-2"></i>${profesor.correo}
                                </p>
                                <p class="mb-0 text-muted">
                                    <i class="fas fa-phone me-2"></i>${profesor.telefono}
                                </p>
                                <p class="mb-0 text-muted">
                                    <i class="fas fa-venus-mars me-2"></i>${profesor.genero}
                                </p>
                            </div>
                        </div>
                        
                        <div class="row">
                            <!-- Datos Personales -->
                            <div class="col-md-6 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-user me-2"></i>Datos Personales
                                    </h6>
                                    <p><strong>Nombre completo:</strong> ${profesor.nombre} ${profesor.apellidos}</p>
                                    <p><strong>Correo:</strong> ${profesor.correo}</p>
                                    <p><strong>Teléfono:</strong> ${profesor.telefono}</p>
                                    <p><strong>Nacionalidad:</strong> ${profesor.nacionalidad}</p>
                                    <p><strong>Género:</strong> ${profesor.genero}</p>
                                </div>
                            </div>
                            
                            <!-- Datos Profesionales -->
                            <div class="col-md-6 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-briefcase me-2"></i>Datos Profesionales
                                    </h6>
                                    <p><strong>Departamento:</strong> ${departamento ? departamento.nombre : 'No asignado'}</p>
                                    <p><strong>Responsabilidad:</strong> ${profesor.responsabilidad || 'Ninguna'}</p>
                                    <p><strong>Estado:</strong> 
                                        <span class="badge ${profesor.estado === 'Alta' ? 'bg-success' : 'bg-danger'}">
                                            ${profesor.estado}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
            `;
            
            // Datos de Usuario (solo si existe)
            if (usuario) {
                html += `
                    <div class="row mt-2">
                        <div class="col-12">
                            <div class="border rounded p-3">
                                <h6 class="text-primary mb-3">
                                    <i class="fas fa-user-lock me-2"></i>Datos de Acceso
                                </h6>
                                <p><strong>Usuario:</strong> ${usuario.login}</p>
                                <p><strong>Rol:</strong> ${usuario.rol}</p>
                                <p><strong>Estado:</strong> <span class="badge bg-success">${usuario.estado}</span></p>
                                <p class="text-muted small mt-2 mb-0">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Las credenciales fueron enviadas al momento del registro
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
            
            $('#modalVerDetallesProfesor .modal-body').html(html);
            $('#modalVerDetallesProfesor').modal('show');
        }
    }


    // ============================================
    // ACTUALIZACIÓN DE TABLA
    // ============================================
    actualizarTabla() {
        if (!this.dataTable) {
            this.obtenerDataTable();
        }
        
        this.dataTable.clear();
        
        this.profesores.forEach(profesor => {
            const nombreCompleto = `${profesor.nombre} ${profesor.apellidos}`;
            const departamento = this.departamentos.find(d => d.idDepartamento == profesor.idDepartamento);
            const nombreDepartamento = departamento ? departamento.nombre : 'No asignado';
            
            this.dataTable.row.add([
                nombreCompleto,
                nombreDepartamento,
                profesor.responsabilidad || 'Ninguna',
                `<span class="badge ${profesor.estado === 'Alta' ? 'bg-success' : 'bg-danger'}">${profesor.estado}</span>`,
                this.crearBotonesAccion(profesor.idProfesor)
            ]);
        });
        
        this.dataTable.draw();
    }


    crearBotonesAccion(idProfesor) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info verDetalles" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalVerDetallesProfesor" 
                        title="Ver detalles" 
                        data-id="${idProfesor}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevoProfesor" 
                        title="Editar" 
                        data-id="${idProfesor}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idProfesor}" 
                        title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }


    // ============================================
    // UTILIDADES
    // ============================================
    limpiarFormulario() {
        // Limpiar todos los campos
        $('input, select', '#formProfesor').val('');
        
        // Resetear selects a valores por defecto
        $('#generosProfesor').val('Ninguno');
        $('#departamentosProfesor').val('Ninguno');
        $('#estadosProfesor').val('Ninguno');
        $('#responsabilidadProfesor').val('Ninguna');
        $('#rolesUsuarioProfesor').val('Ninguno');
        
        // Resetear checkboxes de envío de credenciales
        $('#envioSMS, #envioCorreo, #envioAmbos').prop('checked', false);
        
        // Resetear validaciones
        Object.keys(this.validaciones).forEach(seccion => {
            Object.keys(this.validaciones[seccion]).forEach(campo => {
                this.validaciones[seccion][campo] = false;
            });
        });
        
        // Quitar clases de validación
        $('input, select', '#formProfesor').removeClass('border-success border-danger');
        $('.errorMensaje').text('').hide();
        
        this.modoEdicion = false;
        this.profesorActual = null;
        $('#modalNuevoProfesorLabel').text('Agregar nuevo profesor');
    }


    guardarProfesoresEnSesion() {
        try {
            const profesoresData = this.profesores.map(p => ({
                idProfesor: p.idProfesor,
                idUsuario: p.idUsuario,
                nombre: p.nombre,
                apellidos: p.apellidos,
                correo: p.correo,
                telefono: p.telefono,
                nacionalidad: p.nacionalidad,
                idDepartamento: p.idDepartamento,
                estado: p.estado,
                genero: p.genero,
                responsabilidad: p.responsabilidad
            }));
            
            sessionStorage.setItem('profesores', JSON.stringify(profesoresData));
            console.log('Profesores guardados en sessionStorage:', profesoresData.length);
        } catch (error) {
            console.error('Error guardando profesores:', error);
        }
    }
}


// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    sesiones.verificarExistenciaSesion();
    
    u_utilesSA.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utilesSA.botonesNavegacionWrapper();
    
    const controladorProfesores = new c_profesor();
    
    setTimeout(() => {
        controladorProfesores.inicializar();
    }, 100);
});