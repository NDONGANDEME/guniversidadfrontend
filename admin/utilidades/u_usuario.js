import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_usuario {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar nombre de usuario o correo
    static validarLogin(valor) {
        return u_verificaciones.validarTexto(valor) || u_verificaciones.validarCorreo(valor);
    }
    
    // Validar nombre personal
    static validarNombre(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar apellidos
    static validarApellidos(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar correo electrónico
    static validarCorreo(valor) {
        return u_verificaciones.validarCorreo(valor);
    }
    
    // Validar teléfono
    static validarTelefono(valor) {
        return u_verificaciones.validarTelefono(valor);
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Mostrar/ocultar panel de datos personales según el rol
    static togglePanelDatosPersonales(rol) {
        const panel = document.getElementById('panelDatosPersonales');
        if (rol === 'Secretario' || rol === 'Administrador') {
            panel.classList.remove('d-none');
        } else {
            panel.classList.add('d-none');
        }
    }
    
    // Limpiar formulario
    static limpiarFormulario() {
        document.getElementById('formUsuario').reset();
        
        // Limpiar clases de validación
        document.querySelectorAll('#formUsuario input, #formUsuario select').forEach(campo => {
            campo.classList.remove('border-success', 'border-danger');
        });
        
        // Limpiar mensajes de error
        document.querySelectorAll('.errorMensaje').forEach(error => {
            error.textContent = '';
            error.classList.add('d-none');
        });
        
        // Ocultar panel de datos personales
        document.getElementById('panelDatosPersonales').classList.add('d-none');
        
        // Resetear selects
        document.getElementById('rolUsuario').value = 'Ninguno';
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario(modoEdicion = false) {
        const datos = {
            nombreUsuario: document.getElementById('nombreOCorreoUsuario').value.trim(),
            rol: document.getElementById('rolUsuario').value,
            envioSMS: document.getElementById('envioSMS').checked,
            envioCorreo: document.getElementById('envioCorreo').checked
        };
        
        // Si el panel de datos personales está visible, obtener esos datos
        if (!document.getElementById('panelDatosPersonales').classList.contains('d-none')) {
            datos.nombre = document.getElementById('nombreUsuario').value.trim();
            datos.apellidos = document.getElementById('apellidosUsuario').value.trim();
            datos.correoPersonal = document.getElementById('correoUsuario').value.trim();
            datos.telefono = document.getElementById('telefonoUsuario').value.trim();
            datos.idFacultad = document.getElementById('facultadesUsuario').value;
        }
        
        return datos;
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(usuario, estado) {
        const icono = estado === 'Habilitado' ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = estado === 'Habilitado' ? 'Deshabilitar' : 'Habilitar';
        const claseBoton = estado === 'Habilitado' ? 'deshabilitar' : 'habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevoUsuario" 
                        title="Editar" 
                        data-id="${usuario.idUsuario}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ${claseBoton}" 
                        title="${titulo}" 
                        data-id="${usuario.idUsuario}">
                    <i class="fas ${icono}"></i>
                </button>
            </div>
        `;
    }
    
    // Aplicar estilo a fila deshabilitada
    static aplicarEstiloFila(fila, deshabilitado) {
        if (deshabilitado) {
            fila.classList.add('bg-light', 'text-muted');
            fila.querySelectorAll('td:not(:last-child)').forEach(td => {
                td.style.opacity = '0.6';
            });
        } else {
            fila.classList.remove('bg-light', 'text-muted');
            fila.querySelectorAll('td').forEach(td => {
                td.style.opacity = '1';
            });
        }
    }
    
    // Generar contraseña aleatoria
    static generarContraseña() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let contraseña = '';
        for (let i = 0; i < 10; i++) {
            contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return contraseña;
    }
    
    // Enviar credenciales (simulado)
    static enviarCredenciales(usuario, contraseña, telefono, correo) {
        const envioSMS = document.getElementById('envioSMS').checked;
        const envioCorreo = document.getElementById('envioCorreo').checked;
        
        let mensajes = [];
        
        if (envioSMS && telefono) {
            mensajes.push(`📱 SMS enviado a ${telefono}`);
        }
        
        if (envioCorreo && correo) {
            mensajes.push(`📧 Correo enviado a ${correo}`);
        }
        
        if (mensajes.length > 0) {
            console.log('=== CREDENCIALES ===');
            console.log(`Usuario: ${usuario}`);
            console.log(`Contraseña: ${contraseña}`);
            console.log(mensajes.join('\n'));
            
            Alerta.exito(
                'Credenciales generadas',
                `Usuario: ${usuario}\nContraseña: ${contraseña}\n${mensajes.join('\n')}`,
                { timeout: 8000 }
            );
        }
    }
}