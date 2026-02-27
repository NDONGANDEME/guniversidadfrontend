import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_usuario {
    
    // ========== GENERAR CONTRASEÑA ALEATORIA DE 10 CARACTERES ==========
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
        
        // Completar el resto de la longitud (hasta 10)
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 4; i < longitud; i++) {
            contrasena += todos.charAt(Math.floor(Math.random() * todos.length));
        }
        
        // Mezclar la contraseña para que no siempre empiece con los mismos tipos
        return contrasena.split('').sort(() => 0.5 - Math.random()).join('');
    }
    
    // ========== VALIDACIONES ==========
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

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static  configurarValidaciones() {
        // Validación del nombre de usuario o correo
        $('#nombreOCorreoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const esCorreo = valor.includes('@');
            let valido;
            let mensaje;
            
            if (esCorreo) {
                valido = u_usuario.validarCorreo(valor);
                mensaje = 'Correo inválido (ej: usuario@dominio.com)';
            } else {
                valido = u_usuario.validarNombreUsuario(valor);
                mensaje = 'Mínimo 3 caracteres, solo letras y números';
            }
            
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', mensaje);
        });

        // Validación del rol
        $('#rolUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_usuario.validarRol(valor);
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Seleccione un rol');
            
            // Mostrar u ocultar panel de datos personales según el rol
            if (valor === 'Secretario') {
                $('#panelDatosPersonales').removeClass('d-none');
                // Activar validaciones de datos personales
                $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').trigger('input');
            } else {
                $('#panelDatosPersonales').addClass('d-none');
                // Limpiar validaciones de datos personales
                $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').removeClass('border-success border-danger');
                $('#errorNombreUsuario, #errorApellidosUsuario, #errorCorreoUsuario, #errorTelefonoUsuario, #errorFacultadesUsuario').text('').addClass('d-none');
            }
        });

        // Validaciones de datos personales
        $('#nombreUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarNombrePersona(valor);
            u_utiles.colorearCampo(valido, '#nombreUsuario', '#errorNombreUsuario', 'Mínimo 3 caracteres, solo letras');
        });

        $('#apellidosUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarApellidos(valor);
            u_utiles.colorearCampo(valido, '#apellidosUsuario', '#errorApellidosUsuario', 'Mínimo 3 caracteres, solo letras');
        });

        $('#correoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoUsuario', '#errorCorreoUsuario', 'Correo inválido (ej: usuario@dominio.com)');
        });

        $('#telefonoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoUsuario', '#errorTelefonoUsuario', 'Formato: +240 222 123 456');
        });

        $('#facultadesUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_usuario.validarFacultad(valor);
            u_utiles.colorearCampo(valido, '#facultadesUsuario', '#errorFacultadesUsuario', 'Seleccione una facultad');
        });
    }

    // ========== MANEJO DE IMAGEN ==========
    static configurarSubidaImagen() {
        $('#añadirImagen').off('click').on('click', function() {
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
                
                // Guardar el archivo en el data del formulario para usarlo después
                console.log(archivo);
                $('#formUsuario').data('imagen-perfil', archivo);
                
                // Mostrar preview
                const lector = new FileReader();
                lector.onload = function(e) {
                    $('#contenedorFotoPerfil').html(`<img src="${e.target.result}" class="img-fluid rounded-3" style="max-width: 100%;">`);
                };
                lector.readAsDataURL(archivo);
            }
        });
    }

    static limpiarImagen() {
        $('#contenedorFotoPerfil').html('<i class="fas fa-user" style="font-size: 1.5rem;"></i>');
        $('#campoArchivoFotoPerfil').val('');
        $('#formUsuario').removeData('imagen-perfil'); // Limpiar archivo guardado
    }

    // ========== OBTENER IMAGEN PARA SUBIR ==========
    static obtenerImagenParaSubir() { return $('#formUsuario').data('imagen-perfil'); }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoUsuarioLabel').text('Editar usuario');
            $('#btnGuardarUsuario').text('Actualizar Usuario');
        } else {
            $('#modalNuevoUsuarioLabel').text('Agregar nuevo usuario');
            $('#btnGuardarUsuario').text('Guardar Usuario');
        }
    }

    // ========== GENERAR BOTONES PARA USUARIO ==========
    static generarBotonesUsuario(id, estado) {
        const iconoToggle = estado === 'activo' ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = estado === 'activo' ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = estado === 'activo' ? 'Habilitar' : 'Deshabilitar';

        /*<button class="btn btn-sm ${claseToggle} toggle-estado-usuario" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
                </button>*/
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-usuario" title="Editar" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE USUARIOS ==========
    static actualizarTablaUsuarios(dataTable, usuarios) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        usuarios.forEach(u => {
            const estadoTexto = u.estado == 'activo' ? 'Activo' : 'Inactivo';
            
            let imagenHtml = '<span class="text-muted">Sin imagen</span>';
            if (u.foto) {
                imagenHtml = `<img src="${u.foto}" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">`;
            }
            
            const fila = [
                imagenHtml, u.nombreUsuario || 'Sin nombre', u.correo || 'Sin correo', '**********',
                u.rol || 'Sin rol', estadoTexto, this.generarBotonesUsuario(u.idUsuario, estadoTexto)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            if (u.estado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }

    // ========== ACTUALIZAR TABLA DE ADMINISTRATIVOS ==========
    static actualizarTablaAdministrativos(dataTable, administrativos, usuarios, facultades) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        administrativos.forEach(a => {
            const usuario = usuarios.find(u => u.idUsuario == a.idUsuario);
            const facultad = facultades.find(f => f.idFacultad == a.idFacultad);
            const nombreFacultad = facultad ? facultad.nombreFacultad : 'Ninguna';
            
            let imagenHtml = '<span class="text-muted">Sin imagen</span>';
            if (usuario && usuario.foto) {
                imagenHtml = `<img src="${usuario.foto}" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">`;
            }
            
            const fila = [
                imagenHtml, `${a.nombreAdministrativo || ''} ${a.apellidosAdministrativo || ''}`, 
                a.correo || usuario?.correo || 'Sin correo', a.telefono || 'Sin teléfono', usuario?.rol || 'Sin rol', nombreFacultad
            ];
            
            dataTable.row.add(fila).draw();
        });
        
        dataTable.draw();
    }

    // ========== CARGAR FACULTADES EN EL SELECT ==========
    static cargarFacultadesEnSelect(facultades) {
        const select = $('#facultadesUsuario');
        select.empty();
        select.append('<option value="">Seleccione...</option>');
        
        facultades.forEach(f => {
            select.append(`<option value="${f.idFacultad}">${f.nombreFacultad}</option>`);
        });
    }

    // ========== LIMPIAR MODAL ==========
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
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(usuario, administrativo, facultades) {
        // Limpiar primero
        this.limpiarModal();
        
        // Cargar datos básicos
        $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
        $('#rolUsuario').val(usuario.rol || 'Ninguno');
        
        // Validar campos cargados (para que se pongan en verde)
        $('#nombreOCorreoUsuario').trigger('input');
        $('#rolUsuario').trigger('change');
        
        if (usuario.foto) {
            $('#contenedorFotoPerfil').html(`<img src="${usuario.foto}" class="img-fluid rounded-3" style="max-height: 100px; max-width: 100%;">`);
        }
        
        // Si es administrativo, cargar datos personales
        if ((usuario.rol === 'Secretario') && administrativo) {
            $('#nombreUsuario').val(administrativo.nombreAdministrativo || '');
            $('#apellidosUsuario').val(administrativo.apellidosAdministrativo || '');
            $('#correoUsuario').val(administrativo.correo || '');
            $('#telefonoUsuario').val(administrativo.telefono || '');
            
            // Cargar facultades primero
            this.cargarFacultadesEnSelect(facultades);
            $('#facultadesUsuario').val(administrativo.idFacultad || '');
            
            // Validar campos cargados
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').trigger('input');
        }
        
        // En edición, no generamos nueva contraseña
        $('#formUsuario').removeData('contrasena-generada');
    }

    // ========== GENERAR CONTRASEÑA SOLO PARA NUEVO USUARIO ==========
    static prepararNuevoUsuario() {
        // Generar contraseña pero no mostrarla
        const nuevaContrasena = this.generarContrasena(10);
        $('#formUsuario').data('contrasena-generada', nuevaContrasena);
    }

    // ========== OBTENER CONTRASEÑA GENERADA ==========
    static obtenerContrasenaGenerada() { return $('#formUsuario').data('contrasena-generada'); }

    // ========== VALIDAR FORMULARIO COMPLETO ==========
    static validarFormularioCompleto(_modoEdicion = false) {
        const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
        const rol = $('#rolUsuario').val();
        
        // Validar nombre o correo
        const esCorreo = nombreOCorreo.includes('@');
        let validoNombreOCorreo;
        
        if (esCorreo) {
            validoNombreOCorreo = u_usuario.validarCorreo(nombreOCorreo);
        } else {
            validoNombreOCorreo = u_usuario.validarNombreUsuario(nombreOCorreo);
        }
        
        if (!validoNombreOCorreo) return false;
        if (!u_usuario.validarRol(rol)) return false;
        
        // Si es administrativo, validar datos personales
        if (rol === 'Secretario') {
            const nombre = $('#nombreUsuario').val().trim();
            const apellidos = $('#apellidosUsuario').val().trim();
            const correo = $('#correoUsuario').val().trim();
            const telefono = $('#telefonoUsuario').val().trim();
            const facultad = $('#facultadesUsuario').val();
            
            if (!u_usuario.validarNombrePersona(nombre)) return false;
            if (!u_usuario.validarApellidos(apellidos)) return false;
            if (!u_usuario.validarCorreo(correo)) return false;
            if (!u_usuario.validarTelefono(telefono)) return false;
            if (!u_usuario.validarFacultad(facultad)) return false;
        }
        
        return true;
    }
}