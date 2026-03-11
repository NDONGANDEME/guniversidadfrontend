// u_gestion_usuarios.js
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_gestion_usuarios {
    
    // ========== VALIDACIONES ESPECÍFICAS PARA GESTIÓN DE USUARIOS ==========
    
    static validarNombreUsuario(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombreOCorreo(valor);
    }
    
    static validarCorreo(valor) {
        if (!valor) return false;
        return u_verificaciones.validarCorreo(valor);
    }
    
    static validarRol(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarNombrePersona(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarApellidos(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarTelefono(valor) {
        if (!valor) return false;
        return u_verificaciones.validarTelefono(valor);
    }
    
    static validarFacultad(valor) {
        return valor && valor !== '';
    }

    static validarDepartamento(valor) {
        return valor && valor !== '';
    }

    static esRolConDatosPersonales(rol) {
        // Roles que requieren datos personales adicionales
        const rolesConDatos = ['Secretario', 'Administrativo', 'Profesor', 'Estudiante'];
        return rolesConDatos.includes(rol);
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre de usuario o correo
        $('#nombreOCorreoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const esCorreo = valor.includes('@');
            let valido;
            let mensaje;
            
            if (esCorreo) {
                valido = u_gestion_usuarios.validarCorreo(valor);
                mensaje = 'Correo inválido (ej: usuario@dominio.com)';
            } else {
                valido = u_gestion_usuarios.validarNombreUsuario(valor);
                mensaje = 'Mínimo 3 caracteres, solo letras y números';
            }
            
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', mensaje);
        });

        // Validación del rol
        $('#rolUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_gestion_usuarios.validarRol(valor);
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Seleccione un rol');
            
            // Mostrar u ocultar panel de datos personales según el rol
            const necesitaDatos = u_gestion_usuarios.esRolConDatosPersonales(valor);
            
            if (necesitaDatos) {
                $('#panelDatosPersonales').removeClass('d-none');
                // Activar validaciones de datos personales
                $('#nombrePersona, #apellidosPersona, #correoPersonal, #telefonoPersona, #facultadPersona, #departamentoPersona').trigger('input');
            } else {
                $('#panelDatosPersonales').addClass('d-none');
                // Limpiar validaciones de datos personales
                $('#nombrePersona, #apellidosPersona, #correoPersonal, #telefonoPersona, #facultadPersona, #departamentoPersona').removeClass('border-success border-danger');
                $('#errorNombrePersona, #errorApellidosPersona, #errorCorreoPersonal, #errorTelefonoPersona, #errorFacultadPersona, #errorDepartamentoPersona').text('').addClass('d-none');
            }
        });

        // Validaciones de datos personales
        $('#nombrePersona').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_gestion_usuarios.validarNombrePersona(valor);
            u_utiles.colorearCampo(valido, '#nombrePersona', '#errorNombrePersona', 'Mínimo 3 caracteres, solo letras');
        });

        $('#apellidosPersona').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_gestion_usuarios.validarApellidos(valor);
            u_utiles.colorearCampo(valido, '#apellidosPersona', '#errorApellidosPersona', 'Mínimo 3 caracteres, solo letras');
        });

        $('#correoPersonal').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_gestion_usuarios.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoPersonal', '#errorCorreoPersonal', 'Correo inválido (ej: usuario@dominio.com)');
        });

        $('#telefonoPersona').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_gestion_usuarios.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoPersona', '#errorTelefonoPersona', 'Formato: +240 222 123 456');
        });

        $('#facultadPersona').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_gestion_usuarios.validarFacultad(valor);
            u_utiles.colorearCampo(valido, '#facultadPersona', '#errorFacultadPersona', 'Seleccione una facultad');
        });

        $('#departamentoPersona').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_gestion_usuarios.validarDepartamento(valor);
            u_utiles.colorearCampo(valido, '#departamentoPersona', '#errorDepartamentoPersona', 'Seleccione un departamento');
        });
    }

    // ========== RENDERIZADO DE TARJETAS ==========
    
    static generarTarjetaUsuario(usuario, personaData = null, vistaActual = 'tarjetas') {
        const estadoClass = usuario.estado === 'Activo' ? 'success' : 'secondary';
        const estadoIcon = usuario.estado === 'Activo' ? 'fa-check-circle' : 'fa-ban';
        const foto = usuario.foto || '../../public/img/default-avatar.png';
        const nombreCompleto = personaData ? 
            `${personaData.nombre || ''} ${personaData.apellidos || ''}`.trim() : 
            usuario.nombreUsuario;
        
        return `
            <div class="col-12 ${vistaActual === 'tarjetas' ? 'col-md-6 col-lg-4' : ''}">
                <div class="usuario-tarjeta" data-id="${usuario.idUsuario}">
                    <img src="${foto}" alt="Foto de ${usuario.nombreUsuario}" class="foto-perfil" 
                         onerror="this.onerror=null; this.src='../../public/img/default-avatar.png';">
                    
                    <div class="info-usuario">
                        <div class="nombre-usuario">${usuario.nombreUsuario}</div>
                        ${nombreCompleto !== usuario.nombreUsuario ? 
                            `<div class="nombre-completo text-muted small">${nombreCompleto}</div>` : ''}
                        <div class="correo-usuario">${usuario.correo}</div>
                        <div class="rol-usuario">
                            <span class="badge bg-info">${usuario.rol}</span>
                        </div>
                        <div class="estado-usuario">
                            <span class="badge bg-${estadoClass}">
                                <i class="fas ${estadoIcon} me-1"></i> ${usuario.estado}
                            </span>
                        </div>
                    </div>
                    
                    <div class="acciones-usuario">
                        <button class="btn btn-sm btn-info btn-accion ver-usuario" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning btn-accion editar-usuario" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm ${usuario.estado === 'Activo' ? 'btn-secondary' : 'btn-success'} btn-accion cambiar-estado" 
                                title="${usuario.estado === 'Activo' ? 'Deshabilitar' : 'Habilitar'}">
                            <i class="fas ${usuario.estado === 'Activo' ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static renderizarVacia(mensaje = 'No hay usuarios para mostrar') {
        return `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-users fa-4x text-muted mb-3"></i>
                    <h5 class="text-muted">${mensaje}</h5>
                    <p class="text-muted">Prueba con otros filtros o crea un nuevo usuario</p>
                </div>
            </div>
        `;
    }

    // ========== MANEJO DE IMAGEN ==========
    
    static configurarSubidaImagen() {
        $('#btnAgregarImagen').off('click').on('click', function() {
            $('#campoArchivoFotoPerfil').click();
        });

        $('#campoArchivoFotoPerfil').off('change').on('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                // Validar que sea imagen
                if (!archivo.type.match('image.*')) {
                    Alerta.notificarAdvertencia('Solo se permiten imágenes PNG, JPG o JPEG', 1500);
                    $(this).val('');
                    return;
                }
                
                // Validar tamaño (máximo 2MB)
                if (archivo.size > 2 * 1024 * 1024) {
                    Alerta.notificarAdvertencia('La imagen no debe superar los 2MB', 1500);
                    $(this).val('');
                    return;
                }
                
                // Guardar el archivo en el data del formulario para usarlo después
                $('#formUsuario').data('imagen-perfil', archivo);
                
                // Mostrar preview
                const lector = new FileReader();
                lector.onload = function(e) {
                    $('#contenedorFotoPerfil').html(`
                        <div class="position-relative">
                            <img src="${e.target.result}" class="img-fluid rounded-3 border border-2 border-warning" 
                                style="width: 120px; height: 120px; object-fit: cover;">
                            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0" 
                                    style="width: 24px; height: 24px;" id="btnEliminarImagenTemp">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `);
                    
                    // Botón para eliminar la imagen temporal
                    $('#btnEliminarImagenTemp').off('click').on('click', function() {
                        u_gestion_usuarios.limpiarImagen();
                    });
                };
                lector.readAsDataURL(archivo);
            }
        });
    }

    static limpiarImagen() {
        $('#contenedorFotoPerfil').html(`
            <div class="d-flex justify-content-center align-items-center bg-light rounded-3 border" 
                style="width: 120px; height: 120px;">
                <i class="fas fa-user text-secondary" style="font-size: 3rem;"></i>
            </div>
        `);
        $('#campoArchivoFotoPerfil').val('');
        $('#formUsuario').removeData('imagen-perfil');
    }

    static obtenerImagenParaSubir() { 
        return $('#formUsuario').data('imagen-perfil'); 
    }

    // ========== MODO EDICIÓN ==========
    
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalUsuarioLabel').text('Editar usuario');
            $('#btnGuardarUsuario').text('Actualizar Usuario');
        } else {
            $('#modalUsuarioLabel').text('Agregar nuevo usuario');
            $('#btnGuardarUsuario').text('Guardar Usuario');
        }
    }

    // ========== LIMPIEZA DE MODAL ==========
    
    static limpiarModal() {
        $('#formUsuario')[0].reset();
        $('#panelDatosPersonales').addClass('d-none');
        $('#rolUsuario').val('Ninguno');
        
        // Limpiar todos los mensajes de error
        $('.errorMensaje').text('').addClass('d-none');
        
        // Quitar clases de validación de todos los campos
        $('#formUsuario input, #formUsuario select').removeClass('border-success border-danger');
        
        // Limpiar imagen
        this.limpiarImagen();
        
        // Eliminar cualquier contraseña generada previamente
        $('#formUsuario').removeData('contrasena-generada');
        $('#formUsuario').removeData('imagen-perfil');
    }

    // ========== CARGA DE DATOS EN MODAL PARA EDICIÓN ==========
    
    static async cargarDatosEnModal(usuario, personaData = null, facultades = [], departamentos = []) {
        // Limpiar primero
        this.limpiarModal();

        const baseUrl = '/guniversidadfrontend/public/img/';
        
        // Cargar datos básicos
        $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
        $('#rolUsuario').val(usuario.rol || 'Ninguno');
        
        // Validar campos cargados (para que se pongan en verde)
        $('#nombreOCorreoUsuario').trigger('input');
        $('#rolUsuario').trigger('change');
        
        // Mostrar imagen existente
        if (usuario.foto) {
            const fotoUrl = usuario.foto.startsWith('http') ? usuario.foto : baseUrl + usuario.foto;
            $('#contenedorFotoPerfil').html(`
                <div class="position-relative">
                    <img src="${fotoUrl}" class="img-fluid rounded-3 border border-2 border-warning" 
                        style="width: 120px; height: 120px; object-fit: cover;"
                        onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'d-flex justify-content-center align-items-center bg-light rounded-3 border\\' style=\\'width: 120px; height: 120px;\\'><i class=\\'fas fa-user text-secondary\\' style=\\'font-size: 3rem;\\'></i></div>';">
                </div>
            `);
        }
        
        // Si el rol requiere datos personales y tenemos datos
        if (this.esRolConDatosPersonales(usuario.rol) && personaData) {
            // Cargar facultades y departamentos primero
            await this.cargarFacultadesEnSelect(facultades);
            
            $('#nombrePersona').val(personaData.nombre || '');
            $('#apellidosPersona').val(personaData.apellidos || '');
            $('#correoPersonal').val(personaData.correo || '');
            $('#telefonoPersona').val(personaData.telefono || '');
            
            if (personaData.idFacultad) {
                $('#facultadPersona').val(personaData.idFacultad);
                // Cargar departamentos de esa facultad
                if (departamentos.length > 0) {
                    const depsFiltrados = departamentos.filter(d => d.idFacultad == personaData.idFacultad);
                    this.cargarDepartamentosEnSelect(depsFiltrados);
                    if (personaData.idDepartamento) {
                        $('#departamentoPersona').val(personaData.idDepartamento);
                    }
                }
            }
            
            // Validar campos cargados
            $('#nombrePersona, #apellidosPersona, #correoPersonal, #telefonoPersona, #facultadPersona, #departamentoPersona').trigger('input');
        }
        
        // En edición, no generamos nueva contraseña
        $('#formUsuario').removeData('contrasena-generada');
    }

    // ========== GENERAR CONTRASEÑA PARA NUEVO USUARIO ==========
    
    static generarContrasena(longitud = 10) {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%^&*';
        let contrasena = '';
        
        // Asegurar al menos un carácter de cada tipo
        contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
        contrasena += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
        contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
        contrasena += especiales.charAt(Math.floor(Math.random() * especiales.length));
        
        // Completar el resto de la longitud
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 4; i < longitud; i++) {
            contrasena += todos.charAt(Math.floor(Math.random() * todos.length));
        }
        
        // Mezclar la contraseña
        return contrasena.split('').sort(() => 0.5 - Math.random()).join('');
    }

    static prepararNuevoUsuario() {
        const nuevaContrasena = this.generarContrasena(10);
        $('#formUsuario').data('contrasena-generada', nuevaContrasena);
    }

    static obtenerContrasenaGenerada() { 
        return $('#formUsuario').data('contrasena-generada'); 
    }

    // ========== CARGA DE SELECTORES ==========
    
    static cargarFacultadesEnSelect(facultades) {
        const select = $('#facultadPersona');
        select.empty();
        select.append('<option value="">Seleccione facultad...</option>');
        
        facultades.forEach(f => {
            select.append(`<option value="${f.idFacultad}">${f.nombreFacultad}</option>`);
        });
    }

    static cargarDepartamentosEnSelect(departamentos) {
        const select = $('#departamentoPersona');
        select.empty();
        select.append('<option value="">Seleccione departamento...</option>');
        
        departamentos.forEach(d => {
            select.append(`<option value="${d.idDepartamento}">${d.nombreDepartamento}</option>`);
        });
    }

    // ========== VALIDACIÓN COMPLETA DEL FORMULARIO ==========
    
    static validarFormularioCompleto(modoEdicion = false) {
        const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
        const rol = $('#rolUsuario').val();
        
        // Validar nombre o correo
        const esCorreo = nombreOCorreo.includes('@');
        let validoNombreOCorreo;
        
        if (esCorreo) {
            validoNombreOCorreo = u_gestion_usuarios.validarCorreo(nombreOCorreo);
        } else {
            validoNombreOCorreo = u_gestion_usuarios.validarNombreUsuario(nombreOCorreo);
        }
        
        if (!validoNombreOCorreo) return false;
        if (!u_gestion_usuarios.validarRol(rol)) return false;
        
        // Si el rol requiere datos personales, validarlos
        if (this.esRolConDatosPersonales(rol)) {
            const nombre = $('#nombrePersona').val().trim();
            const apellidos = $('#apellidosPersona').val().trim();
            const correo = $('#correoPersonal').val().trim();
            const telefono = $('#telefonoPersona').val().trim();
            const facultad = $('#facultadPersona').val();
            const departamento = $('#departamentoPersona').val();
            
            if (!u_gestion_usuarios.validarNombrePersona(nombre)) return false;
            if (!u_gestion_usuarios.validarApellidos(apellidos)) return false;
            if (!u_gestion_usuarios.validarCorreo(correo)) return false;
            if (!u_gestion_usuarios.validarTelefono(telefono)) return false;
            if (!u_gestion_usuarios.validarFacultad(facultad)) return false;
            if (!u_gestion_usuarios.validarDepartamento(departamento)) return false;
        }
        
        return true;
    }

    // ========== AJUSTE DE MODAL PARA NAVBAR FIJA ==========
    
    static ajustarModalParaNavbarFija() {
        // Ajustar el modal para que no quede detrás de la navbar fija
        $(document).on('show.bs.modal', '.modal', function() {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            $('body').css('padding-right', scrollBarWidth);
            $('body').addClass('modal-open');
        });

        $(document).on('hidden.bs.modal', '.modal', function() {
            $('body').css('padding-right', '');
            $('body').removeClass('modal-open');
        });
    }
}