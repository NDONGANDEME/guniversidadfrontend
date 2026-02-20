// ============================================
// UTILIDADES PARA EL MÓDULO DE USUARIOS
// ============================================

import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_usuario
{
    /**
     * Genera una contraseña aleatoria segura
     */
    static generarContraseña()
    {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let contraseña = '';
        for (let i = 0; i < 10; i++) {
            contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return contraseña;
    }

    /**
     * Configura las validaciones en tiempo real del formulario
     */
    static configurarValidaciones(controlador)
    {
        // Validar nombre
        $('#nombreUsuario').on('input', () => {
            const valor = $('#nombreUsuario').val().trim();
            controlador.nombreValido = u_verificaciones.validarTexto(valor);
            u_utiles.colorearCampo(controlador.nombreValido, '#nombreUsuario', '#errorNombreUsuario', 
                'El nombre debe tener entre 3 y 100 caracteres');
        });

        // Validar apellidos
        $('#apellidosUsuario').on('input', () => {
            const valor = $('#apellidosUsuario').val().trim();
            controlador.apellidosValidos = u_verificaciones.validarTexto(valor);
            u_utiles.colorearCampo(controlador.apellidosValidos, '#apellidosUsuario', '#errorApellidosUsuario', 
                'Los apellidos deben tener entre 3 y 100 caracteres');
        });

        // Validar teléfono
        $('#telefonoUsuario').on('input', () => {
            const valor = $('#telefonoUsuario').val().trim();
            controlador.telefonoValido = u_verificaciones.validarTelefono(valor);
            u_utiles.colorearCampo(controlador.telefonoValido, '#telefonoUsuario', '#errorTelefonoUsuario', 
                'El teléfono debe tener formato válido (+240 123 456 789)');
        });

        // Validar correo (opcional)
        $('#correoUsuario').on('input', () => {
            const valor = $('#correoUsuario').val().trim();
            if (valor === '') {
                controlador.correoValido = true;
                $('#correoUsuario').removeClass('border-success border-danger');
                $('#errorCorreoUsuario').text('').hide();
            } else {
                controlador.correoValido = u_verificaciones.validarCorreo(valor);
                u_utiles.colorearCampo(controlador.correoValido, '#correoUsuario', '#errorCorreoUsuario', 
                    'Ingrese un correo válido');
            }
        });

        // Validar login (nombre de usuario o correo)
        $('#nombreOCorreoUsuario').on('input', () => {
            const valor = $('#nombreOCorreoUsuario').val().trim();
            controlador.loginValido = u_verificaciones.validarTexto(valor) || u_verificaciones.validarCorreo(valor);
            u_utiles.colorearCampo(controlador.loginValido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 
                'Ingrese un nombre de usuario o correo válido');
        });

        // Validar rol
        $('#rolUsuario').on('change', () => {
            controlador.rolValido = $('#rolUsuario').val() !== 'Ninguno';
            u_utiles.colorearCampo(controlador.rolValido, '#rolUsuario', '#errorRolUsuario', 
                'Seleccione un rol');
            controlador.mostrarCampoFacultad();
        });

        // Validar facultad (solo cuando está visible)
        $(document).on('change', '#facultadSecretario', () => {
            controlador.facultadValida = $('#facultadSecretario').val() !== 'Ninguno';
            u_utiles.colorearCampo(controlador.facultadValida, '#facultadSecretario', '#errorFacultadSecretario', 
                'Seleccione una facultad para el secretario');
        });
    }

    /**
     * Valida el formulario completo
     */
    /*static validarFormulario(controlador)
    {
        if (!controlador.nombreValido || !controlador.apellidosValidos || !controlador.telefonoValido || !controlador.correoValido) {
            Alerta.notificarAdvertencia('Complete todos los datos personales correctamente', 3000);
            return false;
        }

        if (!controlador.loginValido || !controlador.rolValido) {
            Alerta.notificarAdvertencia('Complete todos los datos de sesión correctamente', 3000);
            return false;
        }

        if ($('#rolUsuario').val() === 'Secretario' && !controlador.facultadValida) {
            Alerta.notificarAdvertencia('Seleccione una facultad para el secretario', 3000);
            return false;
        }

        if (!controlador.modoEdicion) {
            if (!$('#envioSMS').is(':checked') && !$('#envioCorreo').is(':checked') && !$('#envioAmbos').is(':checked')) {
                Alerta.notificarAdvertencia('Seleccione al menos un método de envío para las credenciales', 3000);
                return false;
            }
        }

        return true;
    }*/

    static validarFormulario(controlador)
    {
        if (!controlador.nombreValido || !controlador.apellidosValidos || !controlador.telefonoValido || !controlador.correoValido) {
            Alerta.advertencia('Campos incompletos', 'Complete todos los datos personales correctamente');
            return false;
        }

        if (!controlador.loginValido || !controlador.rolValido) {
            Alerta.advertencia('Campos incompletos', 'Complete todos los datos de sesión correctamente');
            return false;
        }

        // Validar facultad SOLO si el rol es Secretario
        if ($('#rolUsuario').val() === 'Secretario') {
            if ($('#facultadSecretario').val() === 'Ninguno') {
                Alerta.advertencia('Campo requerido', 'Debe seleccionar una facultad para el secretario');
                return false;
            }
        }

        if (!controlador.modoEdicion) {
            if (!$('#envioSMS').is(':checked') && !$('#envioCorreo').is(':checked') && !$('#envioAmbos').is(':checked')) {
                Alerta.advertencia('Método de envío', 'Seleccione al menos un método de envío para las credenciales');
                return false;
            }
        }

        return true;
    }

    /**
     * Limpia el formulario
     */
    static limpiarFormulario()
    {
        $('#formUsuario')[0].reset();
        
        // Limpiar estilos
        $('.form-control, .form-select').removeClass('border-success border-danger');
        $('.errorMensaje').text('').hide();
        
        // Ocultar campo facultad
        $('#filaFacultadSecretario').hide();
        
        // Resetear checkboxes
        $('#envioSMS, #envioCorreo, #envioAmbos').prop('checked', false);
    }

    /**
     * Muestra las credenciales generadas
     */
    static mostrarCredenciales(usuario, contraseña, datosPersonales)
    {
        const enviarSMS = $('#envioSMS').is(':checked');
        const enviarCorreo = $('#envioCorreo').is(':checked');
        const enviarAmbos = $('#envioAmbos').is(':checked');
        
        let mensajes = [];
        
        if (enviarSMS || enviarAmbos) {
            mensajes.push(`📱 SMS enviado al ${datosPersonales.telefono}`);
        }
        if (enviarCorreo || enviarAmbos) {
            mensajes.push(`📧 Correo enviado a ${datosPersonales.correo || 'No especificado'}`);
        }

        Alerta.exito(
            'Credenciales generadas',
            `Usuario: ${usuario.login}\nContraseña: ${contraseña}\n\n${mensajes.join('\n')}`,
            { timeout: 10000 }
        );
    }

    /**
     * Crea los botones de acción para la tabla de usuarios
     */
    static crearBotonesAccion(idUsuario, estado, rol)
    {
        if (rol !== 'Secretario') {
            return '<span class="text-muted"><small>Sin acciones</small></span>';
        }

        if (estado === 'Inactivo') {
            return `
                <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-sm btn-outline-success activar" data-id="${idUsuario}" title="Activar">
                        <i class="fas fa-check-circle"></i>
                    </button>
                </div>
            `;
        }

        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editarUsuario" 
                        data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario"
                        title="Editar" data-id="${idUsuario}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idUsuario}" title="Deshabilitar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }

    /**
     * Crea badge para rol
     */
    static crearBadgeRol(rol)
    {
        const colores = {
            'Administrador': 'bg-danger',
            'Secretario': 'bg-primary',
            'Profesor': 'bg-info',
            'Estudiante': 'bg-success'
        };
        return `<span class="badge ${colores[rol] || 'bg-secondary'} p-2">${rol}</span>`;
    }

    /**
     * Crea badge para estado
     */
    static crearBadgeEstado(estado)
    {
        const color = estado === 'Activo' ? 'bg-success' : 'bg-secondary';
        return `<span class="badge ${color} p-2">${estado}</span>`;
    }
}