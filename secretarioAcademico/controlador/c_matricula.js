import { sesiones } from "../../public/core/sesiones.js"
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_matricula } from "../modelo/m_matricula.js";
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class c_matricula
{
    constructor() {
        // Entidades principales
        this.matriculas = [];
        this.matriculaActual = null;
        this.modoEdicion = false;
        this.contadorId = 1;
        this.contadorFamiliar = 1;
        this.dataTable = null;
        
        // Datos de sessionStorage
        this.facultades = [];
        this.carreras = [];
        this.cursos = [];
        this.estudiantes = [];
        this.familiares = [];
        this.usuarios = [];
        
        // Variables de validación
        this.validaciones = {
            estudiante: {
                nombre: false,
                apellidos: false,
                fechaNacimiento: false,
                nacionalidad: false,
                centroProcedencia: false,
                telefono: false,
                genero: false
            },
            matricula: {
                fecha: false,
                anoAcademico: false,
                periodo: false,
                facultad: false,
                carrera: false,
                curso: false
            },
            usuario: {
                login: false,
                rol: false
            }
        };
        
        // Familiares múltiples
        this.familiaresTemp = [];
        this.contadorFamiliarTemp = 1;
        
        // Control de secciones
        this.seccionActual = 1;
        this.totalSecciones = 4;
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
            // Cargar facultades
            const facultadesJSON = sessionStorage.getItem('facultades');
            if (facultadesJSON) {
                const datos = JSON.parse(facultadesJSON);
                this.facultades = datos.map(f => ({ idFacultad: f.idFacultad, nombre: f.nombreFacultad }));
            }
            
            // Cargar carreras
            const carrerasJSON = sessionStorage.getItem('carreras');
            if (carrerasJSON) {
                const datos = JSON.parse(carrerasJSON);
                this.carreras = datos.map(c => ({ idCarrera: c.idCarrera, nombre: c.nombreCarrera }));
            }
            
            // Cargar cursos
            const cursosJSON = sessionStorage.getItem('cursos');
            if (cursosJSON) {
                const datos = JSON.parse(cursosJSON);
                this.cursos = datos.map(c => ({ idCurso: c.idCurso, nombre: c.nombreCurso, creditos: c.creditos }));
            }
            
            // Cargar estudiantes, familiares y usuarios
            this.estudiantes = JSON.parse(sessionStorage.getItem('estudiantes') || '[]');
            this.familiares = JSON.parse(sessionStorage.getItem('familiares') || '[]');
            this.usuarios = JSON.parse(sessionStorage.getItem('usuarios') || '[]');
            
            console.log('Datos cargados:', { 
                facultades: this.facultades.length, 
                carreras: this.carreras.length, 
                cursos: this.cursos.length,
                estudiantes: this.estudiantes.length,
                familiares: this.familiares.length,
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
        this.cargarFacultadesEnSelect();
        this.cargarCarrerasEnSelect();
        this.cargarCursosEnSelect();
    }


    cargarFacultadesEnSelect() {
        // let todasFacultades = await fetchFacultad.obtenerFacultadesDeBDD();

        const select = $('#facultadesMatricula');
        select.empty();
        select.append('<option value="Ninguno">Seleccione facultad...</option>');
        
        this.facultades.forEach(facultad => {
            select.append(`<option value="${facultad.idFacultad}">${facultad.nombre}</option>`);
        });
    }


    cargarCarrerasEnSelect() {
        const select = $('#carrerasMatricula');
        select.empty();
        select.append('<option value="Ninguno">Seleccione carrera...</option>');
        
        this.carreras.forEach(carrera => {
            select.append(`<option value="${carrera.idCarrera}">${carrera.nombre}</option>`);
        });
    }


    cargarCursosEnSelect() {
        const select = $('#cursoMatricula');
        select.empty();
        select.append('<option value="Ninguno">Seleccione curso...</option>');
        
        this.cursos.forEach(curso => {
            select.append(`<option value="${curso.idCurso}">${curso.nombre} (${curso.creditos} créd.)</option>`);
        });
    }


    // ============================================
    // GESTIÓN DE FAMILIARES MÚLTIPLES
    // ============================================
    inicializarFamiliares() {
        this.familiaresTemp = [{
            id: this.contadorFamiliarTemp++,
            nombre: '',
            apellidos: '',
            relacion: '',
            contacto: '',
            correo: ''
        }];
        this.renderizarFamiliares();
    }


    agregarFamiliar() {
        this.familiaresTemp.push({
            id: this.contadorFamiliarTemp++,
            nombre: '',
            apellidos: '',
            relacion: '',
            contacto: '',
            correo: ''
        });
        this.renderizarFamiliares();
    }


    eliminarFamiliar(id) {
        if (this.familiaresTemp.length > 1) {
            this.familiaresTemp = this.familiaresTemp.filter(f => f.id !== id);
            this.renderizarFamiliares();
        } else {
            Alerta.advertencia('No se puede eliminar', 'Debe haber al menos un familiar');
        }
    }


    renderizarFamiliares() {
        const $contenedor = $('#familiaresContainer');
        if ($contenedor.length === 0) {
            // Crear contenedor si no existe
            $('#seccion2').append('<div id="familiaresContainer"></div>');
        }
        
        let html = '';
        this.familiaresTemp.forEach((familiar, index) => {
            html += `
                <div class="familiar-item  mb-3 p-3" data-id="${familiar.id}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="text-primary mb-0">
                            <i class="fas fa-user-friends me-2"></i>Familiar ${index + 1}
                        </h6>
                        ${this.familiaresTemp.length > 1 ? 
                            `<button type="button" class="btn btn-sm btn-outline-danger eliminarFamiliar" data-id="${familiar.id}">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>` : ''
                        }
                    </div>
                    
                    <div class="row">
                        <div class="col-6 mb-2">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control familiar-nombre" 
                                   data-id="${familiar.id}" value="${familiar.nombre}" 
                                   placeholder="Ej: Luisa">
                        </div>
                        <div class="col-6 mb-2">
                            <label class="form-label">Apellidos</label>
                            <input type="text" class="form-control familiar-apellidos" 
                                   data-id="${familiar.id}" value="${familiar.apellidos}" 
                                   placeholder="Ej: Lola">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-4 mb-2">
                            <label class="form-label">Relación</label>
                            <input type="text" class="form-control familiar-relacion" 
                                   data-id="${familiar.id}" value="${familiar.relacion}" 
                                   placeholder="Ej: Madre">
                        </div>
                        <div class="col-4 mb-2">
                            <label class="form-label">Contacto</label>
                            <input type="tel" class="form-control familiar-contacto" 
                                   data-id="${familiar.id}" value="${familiar.contacto}" 
                                   placeholder="Ej: +240 123 456">
                        </div>
                        <div class="col-4 mb-2">
                            <label class="form-label">Correo</label>
                            <input type="email" class="form-control familiar-correo" 
                                   data-id="${familiar.id}" value="${familiar.correo}" 
                                   placeholder="Ej: ejemplo@email.com">
                        </div>
                    </div>
                </div>
            `;
        });
        
        $('#familiaresContainer').html(html);
        
        // Agregar eventos a los inputs de familiares
        this.configurarValidacionesFamiliares();
        
        // Agregar eventos a botones de eliminar
        $('.eliminarFamiliar').off('click').on('click', (e) => {
            const id = parseInt($(e.currentTarget).data('id'));
            this.eliminarFamiliar(id);
        });
    }


    configurarValidacionesFamiliares() {
        // Validar cada familiar
        $('.familiar-nombre').off('input').on('input', (e) => {
            const id = parseInt($(e.currentTarget).data('id'));
            const valor = $(e.currentTarget).val().trim();
            const familiar = this.familiaresTemp.find(f => f.id === id);
            if (familiar) familiar.nombre = valor;
        });
        
        $('.familiar-apellidos').off('input').on('input', (e) => {
            const id = parseInt($(e.currentTarget).data('id'));
            const valor = $(e.currentTarget).val().trim();
            const familiar = this.familiaresTemp.find(f => f.id === id);
            if (familiar) familiar.apellidos = valor;
        });
        
        $('.familiar-relacion').off('input').on('input', (e) => {
            const id = parseInt($(e.currentTarget).data('id'));
            const valor = $(e.currentTarget).val().trim();
            const familiar = this.familiaresTemp.find(f => f.id === id);
            if (familiar) familiar.relacion = valor;
        });
        
        $('.familiar-contacto').off('input').on('input', (e) => {
            const id = parseInt($(e.currentTarget).data('id'));
            const valor = $(e.currentTarget).val().trim();
            const familiar = this.familiaresTemp.find(f => f.id === id);
            if (familiar) familiar.contacto = valor;
        });
        
        $('.familiar-correo').off('input').on('input', (e) => {
            const id = parseInt($(e.currentTarget).data('id'));
            const valor = $(e.currentTarget).val().trim();
            const familiar = this.familiaresTemp.find(f => f.id === id);
            if (familiar) familiar.correo = valor;
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
            $('#btnGuardarMatricula').show();
        } else {
            $('#siguiente').show();
            $('#btnGuardarMatricula').hide();
        }
    }


    validarSeccionActual() {
        switch(this.seccionActual) {
            case 1: return this.validarSeccionEstudiante();
            case 2: return this.validarSeccionFamiliar();
            case 3: return this.validarSeccionMatricula();
            case 4: return this.validarSeccionUsuario();
            default: return true;
        }
    }


    // ============================================
    // VALIDACIONES POR SECCIÓN
    // ============================================
    validarSeccionEstudiante() {
        const campos = [
            { id: '#nombreEstudianteMatricula', valido: this.validaciones.estudiante.nombre, msg: 'Complete el nombre' },
            { id: '#apellidosEstudianteMatricula', valido: this.validaciones.estudiante.apellidos, msg: 'Complete los apellidos' },
            { id: '#fechaNacimientoEstudianteMatricula', valido: this.validaciones.estudiante.fechaNacimiento, msg: 'Complete la fecha de nacimiento' },
            { id: '#nacionalidadEstudianteMatricula', valido: this.validaciones.estudiante.nacionalidad, msg: 'Complete la nacionalidad' },
            { id: '#telefonoEstudianteMatricula', valido: this.validaciones.estudiante.telefono, msg: 'Complete el teléfono'},
            { id: '#centroProcedenciaEstudianteMatricula', valido: this.validaciones.estudiante.centroProcedencia, msg: 'Complete el centro de procedencia' },
            { id: '#generosEstudianteMatricula', valido: this.validaciones.estudiante.genero, msg: 'Seleccione el género' }
        ];
        
        const camposInvalidos = campos.filter(c => !c.valido);
        
        if (camposInvalidos.length > 0) {
            Alerta.advertencia('Campos incompletos', 'Complete todos los datos del estudiante');
            return false;
        }
        
        return true;
    }


    validarSeccionFamiliar() {
        // Verificar que al menos haya datos en el primer familiar
        const familiar = this.familiaresTemp[0];
        
        if (!familiar.nombre || !familiar.apellidos || !familiar.relacion || !familiar.contacto) {
            Alerta.advertencia('Campos incompletos', 'Complete al menos los datos del familiar principal');
            return false;
        }
        
        return true;
    }


    validarSeccionMatricula() {
        const campos = [
            { id: '#fechaMatricula', valido: this.validaciones.matricula.fecha, msg: 'Complete la fecha' },
            { id: '#anoAcademicoMatricula', valido: this.validaciones.matricula.anoAcademico, msg: 'Complete el año académico' },
            { id: '#periodoMatricula', valido: this.validaciones.matricula.periodo, msg: 'Complete el periodo' },
            { id: '#facultadesMatricula', valido: this.validaciones.matricula.facultad, msg: 'Seleccione una facultad' },
            { id: '#carrerasMatricula', valido: this.validaciones.matricula.carrera, msg: 'Seleccione una carrera' },
            { id: '#cursoMatricula', valido: this.validaciones.matricula.curso, msg: 'Seleccione un curso' }
        ];
        
        const camposInvalidos = campos.filter(c => !c.valido);
        
        if (camposInvalidos.length > 0) {
            Alerta.advertencia('Campos incompletos', 'Complete todos los datos de la matrícula');
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
        // Guardar matrícula
        $('#btnGuardarMatricula').off('click').on('click', () => this.guardarMatricula());
        
        // Botón para agregar familiar
        $('.btn-outline-secondary').off('click').on('click', (e) => {
            if ($(e.currentTarget).find('.fa-plus').length) {
                this.agregarFamiliar();
            }
        });
        
        // Nuevo registro
        $('.nuevo').off('click').on('click', () => {
            this.modoEdicion = false;
            this.matriculaActual = null;
            this.inicializarFamiliares();
            $('#modalNuevaMatriculaLabel').text('Agregar nueva matrícula');
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
            this.deshabilitarMatricula(id);
        });
        
        // Ver detalles (delegación)
        $(document).off('click', '.verDetalles').on('click', '.verDetalles', (e) => {
            const id = $(e.currentTarget).data('id');
            this.mostrarDetallesMatricula(id);
        });
    }


    configurarValidaciones() {
        // Validaciones Estudiante
        $('#nombreEstudianteMatricula').on('input', () => {
            const valor = $('#nombreEstudianteMatricula').val().trim();
            this.validaciones.estudiante.nombre = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#nombreEstudianteMatricula', this.validaciones.estudiante.nombre, '#errorNombreEstudianteMatricula');
        });

        $('#apellidosEstudianteMatricula').on('input', () => {
            const valor = $('#apellidosEstudianteMatricula').val().trim();
            this.validaciones.estudiante.apellidos = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#apellidosEstudianteMatricula', this.validaciones.estudiante.apellidos, '#errorApellidosEstudianteMatricula');
        });

        $('#fechaNacimientoEstudianteMatricula').on('change', () => {
            const valor = $('#fechaNacimientoEstudianteMatricula').val();
            this.validaciones.estudiante.fechaNacimiento = valor !== '' && valor !== null;
            this.aplicarValidacion('#fechaNacimientoEstudianteMatricula', this.validaciones.estudiante.fechaNacimiento, '#errorFechaNacimientoEstudianteMatricula');
        });

        $('#nacionalidadEstudianteMatricula').on('input', () => {
            const valor = $('#nacionalidadEstudianteMatricula').val().trim();
            this.validaciones.estudiante.nacionalidad = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#nacionalidadEstudianteMatricula', this.validaciones.estudiante.nacionalidad, '#errorNacionalidadEstudianteMatricula');
        });

        $('#telefonoEstudianteMatricula').on('input', () => {
            const valor = $('#telefonoEstudianteMatricula').val().trim();
            this.validaciones.estudiante.telefono = u_verificaciones.validarTelefono(valor);
            this.aplicarValidacion('#telefonoEstudianteMatricula', this.validaciones.estudiante.telefono, '#errorTelefonoEstudianteMatricula');
        });

        $('#centroProcedenciaEstudianteMatricula').on('input', () => {
            const valor = $('#centroProcedenciaEstudianteMatricula').val().trim();
            this.validaciones.estudiante.centroProcedencia = u_verificaciones.validarTexto(valor);
            this.aplicarValidacion('#centroProcedenciaEstudianteMatricula', this.validaciones.estudiante.centroProcedencia, '#errorCentroProcedenciaEstudianteMatricula');
        });

        $('#generosEstudianteMatricula').on('change', () => {
            const valor = $('#generosEstudianteMatricula').val();
            this.validaciones.estudiante.genero = valor !== 'Ninguno' && valor !== null;
            this.aplicarValidacion('#generosEstudianteMatricula', this.validaciones.estudiante.genero, '#errorGenerosMatricula');
        });

        // Validaciones Matrícula
        $('#fechaMatricula').on('change', () => {
            const valor = $('#fechaMatricula').val();
            this.validaciones.matricula.fecha = valor !== '' && valor !== null;
            this.aplicarValidacion('#fechaMatricula', this.validaciones.matricula.fecha, '#errorFechaMatricula');
        });

        $('#anoAcademicoMatricula').on('input', () => {
            const valor = $('#anoAcademicoMatricula').val().trim();
            this.validaciones.matricula.anoAcademico = /^\d{4}\/\d{4}$/.test(valor);
            this.aplicarValidacion('#anoAcademicoMatricula', this.validaciones.matricula.anoAcademico, '#errorAnoAcademicoMatricula');
        });

        $('#periodoMatricula').on('input', () => {
            const valor = $('#periodoMatricula').val().trim();
            this.validaciones.matricula.periodo = valor.length >= 5;
            this.aplicarValidacion('#periodoMatricula', this.validaciones.matricula.periodo, '#errorPeriodoMatricula');
        });

        $('#facultadesMatricula').on('change', () => {
            const valor = $('#facultadesMatricula').val();
            this.validaciones.matricula.facultad = valor !== "Ninguno";
            this.aplicarValidacion('#facultadesMatricula', this.validaciones.matricula.facultad, '#errorFacultadesMatricula');
        });

        $('#carrerasMatricula').on('change', () => {
            const valor = $('#carrerasMatricula').val();
            this.validaciones.matricula.carrera = valor !== "Ninguno";
            this.aplicarValidacion('#carrerasMatricula', this.validaciones.matricula.carrera, '#errorCarrerasMatricula');
        });

        $('#cursoMatricula').on('change', () => {
            const valor = $('#cursoMatricula').val();
            this.validaciones.matricula.curso = valor !== "Ninguno";
            this.aplicarValidacion('#cursoMatricula', this.validaciones.matricula.curso, '#errorCursosMatricula');
        });

        // Validaciones Usuario
        $('#nombreOCorreoUsuario').on('input', () => {
            const valor = $('#nombreOCorreoUsuario').val().trim();
            this.validaciones.usuario.login = u_verificaciones.validarTexto(valor) || u_verificaciones.validarCorreo(valor);
            this.aplicarValidacion('#nombreOCorreoUsuario', this.validaciones.usuario.login, '#errorNombreOCorreoUsuario');
        });

        $('#rolesUsuario').on('change', () => {
            const valor = $('#rolesUsuario').val();
            this.validaciones.usuario.rol = valor !== '' && valor !== null;
            this.aplicarValidacion('#rolesUsuario', this.validaciones.usuario.rol, '#errorRolesUsuario');
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
            '#nombreEstudianteMatricula': 'El nombre debe tener entre 3 y 100 caracteres',
            '#apellidosEstudianteMatricula': 'Los apellidos deben tener entre 3 y 100 caracteres',
            '#fechaNacimientoEstudianteMatricula': 'La fecha de nacimiento es obligatoria',
            '#nacionalidadEstudianteMatricula': 'La nacionalidad debe tener entre 3 y 50 caracteres',
            '#telefonoEstudianteMatricula': 'El teléfono debe tener formato válido (+240 123 456)',
            '#centroProcedenciaEstudianteMatricula': 'El centro de procedencia debe tener entre 3 y 100 caracteres',
            '#generosEstudianteMatricula': 'Seleccione un género',
            '#fechaMatricula': 'La fecha de matrícula es obligatoria',
            '#anoAcademicoMatricula': 'Formato: YYYY/YYYY (ej: 2025/2026)',
            '#periodoMatricula': 'El periodo debe tener al menos 5 caracteres',
            '#facultadesMatricula': 'Seleccione una facultad',
            '#carrerasMatricula': 'Seleccione una carrera',
            '#cursoMatricula': 'Seleccione un curso',
            '#nombreOCorreoUsuario': 'Ingrese un nombre de usuario o correo válido',
            '#rolesUsuario': 'Seleccione un rol'
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
            const longitud = Math.floor(Math.random() * 5) + 8; // 8-12 caracteres
            contraseña = '';
            for (let i = 0; i < longitud; i++) {
                contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            
            // Verificar si la contraseña ya existe
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
        
        if (enviarSMS || enviarAmbos) {
            mensajes.push(`📱 SMS enviado al ${$('#telefonoEstudianteMatricula').val()}`);
        }
        
        if (enviarCorreo || enviarAmbos) {
            mensajes.push(`📧 Correo enviado a ${usuario.login}`);
        }
        
        if (mensajes.length > 0) {
            // Simular envío
            console.log('=== CREDENCIALES ENVIADAS ===');
            console.log(`Usuario: ${usuario.login}`);
            console.log(`Contraseña: ${contraseña}`);
            console.log('Métodos:', mensajes.join(', '));
            
            // Mostrar alerta con las credenciales (solo para desarrollo)
            Alerta.exito(
                'Credenciales generadas',
                `Usuario: ${usuario.login}\nContraseña: ${contraseña}\n${mensajes.join('\n')}`,
                { timeout: 10000 }
            );
        }
    }


    // ============================================
    // DATATABLE
    // ============================================
    obtenerDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaMatriculas')) {
            this.dataTable = $('#tablaMatriculas').DataTable();
        } else {
            this.dataTable = $('#tablaMatriculas').DataTable({
                language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
            });
        }
    }


    // ============================================
    // CARGA DE DATOS INICIALES
    // ============================================
    cargarMatriculasDeSesion() {
        try {
            const matriculasJSON = sessionStorage.getItem('matriculas');
            if (matriculasJSON) {
                return JSON.parse(matriculasJSON);
            }
        } catch (error) {
            console.error('Error cargando matrículas:', error);
        }
        return null;
    }


    cargarDatosIniciales() {
        const matriculasGuardadas = this.cargarMatriculasDeSesion();
        
        if (matriculasGuardadas && matriculasGuardadas.length > 0) {
            this.matriculas = matriculasGuardadas.map(m => 
                new m_matricula(
                    m.idMatricula,
                    m.codigo,
                    m.fecha,
                    m.idCarrera,
                    m.añoAcademico,
                    m.idCurso,
                    m.periodo,
                    m.idFacultad
                )
            );
        } else {
            // Datos de ejemplo
            const fechaActual = new Date().toISOString().split('T')[0];
            this.matriculas = [
                new m_matricula(1, "EST-2025-001", fechaActual, 1, "2025/2026", 1, "Tiempo completo", 1)
            ];
            this.guardarMatriculasEnSesion();
        }
        
        if (this.matriculas.length > 0) {
            const maxId = Math.max(...this.matriculas.map(m => m.idMatricula));
            this.contadorId = maxId + 1;
        }
        
        this.actualizarTabla();
    }


    // ============================================
    // OPERACIONES CRUD
    // ============================================
    async guardarMatricula() {
        if (!this.validarSeccionActual()) {
            return;
        }
        
        try {
            // Generar código de estudiante único
            const codigoEstudiante = this.generarCodigoEstudiante();
            
            const id = this.modoEdicion ? this.matriculaActual.idMatricula : this.contadorId++;
            
            if (this.modoEdicion) {
                // EDITAR - Solo actualizar matrícula
                const index = this.matriculas.findIndex(m => m.idMatricula === id);
                if (index !== -1) {
                    this.matriculas[index].fecha = $('#fechaMatricula').val();
                    this.matriculas[index].idCarrera = parseInt($('#carrerasMatricula').val());
                    this.matriculas[index].añoAcademico = $('#anoAcademicoMatricula').val();
                    this.matriculas[index].idCurso = parseInt($('#cursoMatricula').val());
                    this.matriculas[index].periodo = $('#periodoMatricula').val();
                    this.matriculas[index].idFacultad = parseInt($('#facultadesMatricula').val());
                    
                    Alerta.exito('Éxito', 'Matrícula actualizada correctamente');
                }
            } else {
                // INSERTAR - Nuevo registro completo
                const nuevaMatricula = new m_matricula(
                    id,
                    codigoEstudiante,
                    $('#fechaMatricula').val(),
                    parseInt($('#carrerasMatricula').val()),
                    $('#anoAcademicoMatricula').val(),
                    parseInt($('#cursoMatricula').val()),
                    $('#periodoMatricula').val(),
                    parseInt($('#facultadesMatricula').val())
                );
                this.matriculas.push(nuevaMatricula);
                
                // Guardar estudiante
                const idUsuario = this.guardarEstudianteEnSesion(codigoEstudiante);
                
                // Guardar familiares
                this.guardarFamiliaresEnSesion(codigoEstudiante);
                
                // Guardar usuario y enviar credenciales
                const usuario = this.guardarUsuarioEnSesion(idUsuario);
                
                // Enviar credenciales (solo para nuevos estudiantes)
                this.enviarCredenciales(usuario, usuario.contraseña);
                
                Alerta.exito('Éxito', 'Matrícula creada correctamente');
            }
            
            this.actualizarTabla();
            this.guardarMatriculasEnSesion();
            this.limpiarFormulario();
            $('#modalNuevaMatricula').modal('hide');
            
        } catch (error) {
            Alerta.error('Error', `Error al guardar: ${error}`);
        }
    }


    generarCodigoEstudiante() {
        const year = new Date().getFullYear();
        const secuencial = String(this.contadorId).padStart(3, '0');
        return `EST-${year}-${secuencial}`;
    }


    guardarEstudianteEnSesion(codigo) {
        try {
            const idUsuario = this.contadorId + 2000;
            
            const nuevoEstudiante = {
                codigo: codigo,
                idUsuario: idUsuario,
                nombre: $('#nombreEstudianteMatricula').val().trim(),
                apellidos: $('#apellidosEstudianteMatricula').val().trim(),
                fechaNacimiento: $('#fechaNacimientoEstudianteMatricula').val(),
                nacionalidad: $('#nacionalidadEstudianteMatricula').val().trim(),
                telefono: $('#telefonoEstudianteMatricula').val().trim(),
                centroProcedencia: $('#centroProcedenciaEstudianteMatricula').val().trim(),
                genero: $('#generosEstudianteMatricula').val()
            };
            
            this.estudiantes.push(nuevoEstudiante);
            sessionStorage.setItem('estudiantes', JSON.stringify(this.estudiantes));
            
            return idUsuario;
        } catch (error) {
            console.error('Error guardando estudiante:', error);
            return null;
        }
    }


    guardarFamiliaresEnSesion(codigoEstudiante) {
        try {
            this.familiaresTemp.forEach((familiar, index) => {
                if (familiar.nombre && familiar.apellidos && familiar.relacion && familiar.contacto) {
                    const idFamiliar = parseInt(`${this.contadorId}${index}${Date.now()}`.slice(0, 8));
                    
                    const nuevoFamiliar = {
                        idFamiliar: idFamiliar,
                        codigoEstudiante: codigoEstudiante,
                        nombre: familiar.nombre,
                        apellidos: familiar.apellidos,
                        relacion: familiar.relacion,
                        contacto: familiar.contacto,
                        correo: familiar.correo || ''
                    };
                    
                    this.familiares.push(nuevoFamiliar);
                }
            });
            
            sessionStorage.setItem('familiares', JSON.stringify(this.familiares));
        } catch (error) {
            console.error('Error guardando familiares:', error);
        }
    }


    guardarUsuarioEnSesion(idUsuario) {
        try {
            const contraseña = this.generarContraseñaUnica();
            
            const nuevoUsuario = {
                idUsuario: idUsuario,
                login: $('#nombreOCorreoUsuario').val().trim(),
                contraseña: contraseña,
                rol: 'Estudiante', // Fijo para matrículas
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


    prepararEdicion(idMatricula) {
        const matricula = this.matriculas.find(m => m.idMatricula == idMatricula);
        
        if (matricula) {
            this.modoEdicion = true;
            this.matriculaActual = matricula;
            
            // Cargar datos de la matrícula
            $('#fechaMatricula').val(matricula.fecha);
            $('#anoAcademicoMatricula').val(matricula.añoAcademico);
            $('#periodoMatricula').val(matricula.periodo);
            $('#facultadesMatricula').val(matricula.idFacultad || "Ninguno");
            $('#carrerasMatricula').val(matricula.idCarrera || "Ninguno");
            $('#cursoMatricula').val(matricula.idCurso || "Ninguno");
            
            $('#modalNuevaMatriculaLabel').text('Editar matrícula');
            this.mostrarSeccion(3); // Ir directamente a sección de matrícula
            
            // Forzar validaciones
            $('#fechaMatricula').trigger('change');
            $('#anoAcademicoMatricula').trigger('input');
            $('#periodoMatricula').trigger('input');
            $('#facultadesMatricula').trigger('change');
            $('#carrerasMatricula').trigger('change');
            $('#cursoMatricula').trigger('change');
            
            $('#modalNuevaMatricula').modal('show');
        }
    }


    async deshabilitarMatricula(idMatricula) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar', 
                '¿Está seguro de deshabilitar esta matrícula?'
            );
            
            if (confirmacion) {
                this.matriculas = this.matriculas.filter(m => m.idMatricula != idMatricula);
                this.actualizarTabla();
                this.guardarMatriculasEnSesion();
                Alerta.exito('Éxito', 'Matrícula deshabilitada correctamente');
            }
        } catch (error) {
            Alerta.error('Error', `Error al deshabilitar: ${error}`);
        }
    }


    mostrarDetallesMatricula(idMatricula) {
        const matricula = this.matriculas.find(m => m.idMatricula == idMatricula);
        
        if (matricula) {
            // Buscar estudiante
            const estudiante = this.estudiantes.find(e => e.codigo === matricula.codigo);
            
            // Buscar familiares del estudiante
            const familiaresEstudiante = this.familiares.filter(f => f.codigoEstudiante === matricula.codigo);
            
            // Obtener datos relacionados
            const carrera = this.carreras.find(c => c.idCarrera == matricula.idCarrera);
            const curso = this.cursos.find(c => c.idCurso == matricula.idCurso);
            const facultad = this.facultades.find(f => f.idFacultad == matricula.idFacultad);
            
            // Construir HTML de detalles completo
            let html = `
                <div class="card shadow">
                    <div class="card-header py-3 bg-primary text-white">
                        <h6 class="m-0 font-weight-bold">
                            <i class="fas fa-graduation-cap me-2"></i>Información de Matrícula
                        </h6>
                    </div>
                    <div class="card-body">
                        <!-- Cabecera con foto y código -->
                        <div class="d-flex align-items-center gap-4 mb-4 p-3 bg-light rounded">
                            <div class="imgCarnet">
                                <img src="../../../public/img/undraw_profile.svg" alt="Foto carnet" 
                                     class="rounded-circle border" style="width: 100px; height: 100px;">
                            </div>
                            <div>
                                <h4 class="mb-1">${estudiante ? `${estudiante.nombre} ${estudiante.apellidos}` : 'Estudiante'}</h4>
                                <p class="mb-0 text-muted">
                                    <i class="fas fa-qrcode me-2"></i>Código: ${matricula.codigo}
                                </p>
                                <p class="mb-0 text-muted">
                                    <i class="fas fa-venus-mars me-2"></i>${estudiante ? estudiante.genero : ''}
                                </p>
                            </div>
                        </div>
                        
                        <div class="row">
                            <!-- Datos del Estudiante -->
                            <div class="col-md-6 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-user-graduate me-2"></i>Datos del Estudiante
                                    </h6>
                                    ${estudiante ? `
                                        <p><strong>Nombre completo:</strong> ${estudiante.nombre} ${estudiante.apellidos}</p>
                                        <p><strong>Fecha nacimiento:</strong> ${this.formatearFecha(estudiante.fechaNacimiento)}</p>
                                        <p><strong>Nacionalidad:</strong> ${estudiante.nacionalidad}</p>
                                        <p><strong>Teléfono:</strong> ${estudiante.telefono}</p>
                                        <p><strong>Centro procedencia:</strong> ${estudiante.centroProcedencia}</p>
                                        <p><strong>Género:</strong> ${estudiante.genero}</p>
                                    ` : '<p class="text-muted">No hay datos del estudiante</p>'}
                                </div>
                            </div>
                            
                            <!-- Datos de Matrícula -->
                            <div class="col-md-6 mb-3">
                                <div class="border rounded p-3 h-100">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-file-signature me-2"></i>Datos de Matrícula
                                    </h6>
                                    <p><strong>Fecha matrícula:</strong> ${this.formatearFecha(matricula.fecha)}</p>
                                    <p><strong>Año académico:</strong> ${matricula.añoAcademico}</p>
                                    <p><strong>Periodo:</strong> ${matricula.periodo}</p>
                                    <p><strong>Facultad:</strong> ${facultad ? facultad.nombre : 'Ninguno'}</p>
                                    <p><strong>Carrera:</strong> ${carrera ? carrera.nombre : 'Ninguno'}</p>
                                    <p><strong>Curso:</strong> ${curso ? `${curso.nombre} (${curso.creditos} créd.)` : 'Ninguno'}</p>
                                </div>
                            </div>
                        </div>
            `;
            
            // Familiares
            if (familiaresEstudiante.length > 0) {
                html += `
                    <div class="row mt-2">
                        <div class="col-12">
                            <div class="border rounded p-3">
                                <h6 class="text-primary mb-3">
                                    <i class="fas fa-user-friends me-2"></i>Familiares (${familiaresEstudiante.length})
                                </h6>
                                <div class="row">
                `;
                
                familiaresEstudiante.forEach((familiar, idx) => {
                    html += `
                        <div class="col-md-6 mb-2">
                            <div class="bg-light p-2 rounded">
                                <p class="mb-1"><strong>Familiar ${idx + 1}:</strong> ${familiar.nombre} ${familiar.apellidos}</p>
                                <p class="mb-1"><small><strong>Relación:</strong> ${familiar.relacion}</small></p>
                                <p class="mb-1"><small><strong>Contacto:</strong> ${familiar.contacto}</small></p>
                                ${familiar.correo ? `<p class="mb-0"><small><strong>Correo:</strong> ${familiar.correo}</small></p>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                html += `
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Usuario
            const usuario = this.usuarios.find(u => u.idUsuario === (estudiante ? estudiante.idUsuario : null));
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
                                <p class="text-muted small">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Las credenciales fueron enviadas al momento de la matrícula
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
            
            $('#modalVerDetallesMatricula .modal-body').html(html);
            $('#modalVerDetallesMatricula').modal('show');
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
        
        this.matriculas.forEach(matricula => {
            const estudiante = this.estudiantes.find(e => e.codigo === matricula.codigo);
            const nombreEstudiante = estudiante ? `${estudiante.nombre} ${estudiante.apellidos}` : `Estudiante ${matricula.codigo}`;
            const fechaFormateada = this.formatearFecha(matricula.fecha);
            
            this.dataTable.row.add([
                nombreEstudiante,
                fechaFormateada,
                matricula.añoAcademico,
                this.crearBotonesAccion(matricula.idMatricula)
            ]);
        });
        
        this.dataTable.draw();
    }


    crearBotonesAccion(idMatricula) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info verDetalles" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalVerDetallesMatricula" 
                        title="Ver detalles" 
                        data-id="${idMatricula}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevaMatricula" 
                        title="Editar" 
                        data-id="${idMatricula}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idMatricula}" 
                        title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }


    // ============================================
    // UTILIDADES
    // ============================================
    formatearFecha(fecha) {
        if (!fecha) return "Sin fecha";
        const partes = fecha.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return fecha;
    }


    limpiarFormulario() {
        // Limpiar todos los campos
        $('input, select', '#formMatricula').val('');
        
        // Resetear selects a valores por defecto
        $('#generosEstudianteMatricula').val('Ninguno');
        $('#rolesUsuario').val('Estudiante');
        $('#facultadesMatricula').val('Ninguno');
        $('#carrerasMatricula').val('Ninguno');
        $('#cursoMatricula').val('Ninguno');
        
        // Resetear checkboxes
        $('#envioSMS, #envioCorreo, #envioAmbos').prop('checked', false);
        
        // Resetear validaciones
        Object.keys(this.validaciones).forEach(seccion => {
            Object.keys(this.validaciones[seccion]).forEach(campo => {
                this.validaciones[seccion][campo] = false;
            });
        });
        
        // Quitar clases de validación
        $('input, select', '#formMatricula').removeClass('border-success border-danger');
        $('.errorMensaje').text('').hide();
        
        // Inicializar familiares
        this.inicializarFamiliares();
        
        this.modoEdicion = false;
        this.matriculaActual = null;
        $('#modalNuevaMatriculaLabel').text('Agregar nueva matrícula');
    }


    guardarMatriculasEnSesion() {
        try {
            const matriculasData = this.matriculas.map(m => ({
                idMatricula: m.idMatricula,
                codigo: m.codigo,
                fecha: m.fecha,
                idCarrera: m.idCarrera,
                añoAcademico: m.añoAcademico,
                idCurso: m.idCurso,
                periodo: m.periodo,
                idFacultad: m.idFacultad
            }));
            
            sessionStorage.setItem('matriculas', JSON.stringify(matriculasData));
            console.log('Matrículas guardadas en sessionStorage:', matriculasData.length);
        } catch (error) {
            console.error('Error guardando matrículas:', error);
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
    
    const controladorMatriculas = new c_matricula();
    
    setTimeout(() => {
        controladorMatriculas.inicializar();
    }, 100);
});