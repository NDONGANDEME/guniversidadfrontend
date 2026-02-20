import { Alerta } from "../utilidades/u_alertas.js";
import { u_utiles } from "../utilidades/u_utiles.js";
import { u_verificaciones } from "../utilidades/u_verificaciones.js";
import { m_soporte } from "./m_soporte.js";

export class m_sesion
{
    constructor(nombreOCorreo, contraseña){
        this.nombreOCorreo = nombreOCorreo;
        this.contraseña = contraseña;
    }

    // guarda la sesion
    static guardarSesion(clave, objeto){
        sessionStorage.clear();
        sessionStorage.setItem(clave, JSON.stringify(objeto));
    }

    // lee la sesion
    static leerSesion(clave){
        let datoGuardado = {};
        return datoGuardado = JSON.parse(sessionStorage.getItem(clave));
    }

    // cerra la sesión
    /*static cerrarSesion()
    {
        try {
            let usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (usuarioActual) {
                let usuarioVacio = {};
                for (let clave in usuarioActual) { usuarioVacio[clave] = null; }
                
                m_sesion.guardarSesion('usuarioActivo', usuarioVacio);
            } else {
                m_sesion.guardarSesion('usuarioActivo', { nombreOCorreo: null, contraseña: null });
            }
            
            Alerta.cargarSimple(1500, 'Cerrando sesión. Redirigiendo, espere por favor...', '/guniversidadfrontend/index.html');
        } catch (error) {
            sessionStorage.removeItem('usuarioActivo');
            Alerta.cargarSimple(1500, 'Error al cerrar sesión. Redirigiendo, espere por favor...', '/guniversidadfrontend/index.html');
        }
    }*/

    // cerra la sesión
    /*static cerrarSesion() {
        try {
            let usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (usuarioActual) {
                let usuarioVacio = {};
                for (let clave in usuarioActual) { usuarioVacio[clave] = null; }
                
                m_sesion.guardarSesion('usuarioActivo', usuarioVacio);
            } else {
                m_sesion.guardarSesion('usuarioActivo', { nombreOCorreo: null, contraseña: null });
            }
            
            Alerta.cargarSimple(1500, 'Cerrando sesión. Redirigiendo, espere por favor...', '/guniversidadfrontend/public/template/html/iniciarSesion.html');
        } catch (error) {
            sessionStorage.removeItem('usuarioActivo');
            Alerta.cargarSimple(1500, 'Error al cerrar sesión. Redirigiendo, espere por favor...', '/guniversidadfrontend/public/template/html/iniciarSesion.html');
        }
    }*/

    /*static cerrarSesion() {
        try {
            let usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (usuarioActual) {
                let usuarioVacio = {};
                for (let clave in usuarioActual) { usuarioVacio[clave] = null; }
                
                m_sesion.guardarSesion('usuarioActivo', usuarioVacio);
            } else {
                m_sesion.guardarSesion('usuarioActivo', { nombreOCorreo: null, contraseña: null });
            }
            
            // Mostrar alerta
            Alerta.cargarSimple(1500, 'Cerrando sesión. Redirigiendo, espere por favor...', null);
            
            setTimeout(() => {
                // Limpiar completamente el historial y redirigir
                window.history.pushState(null, null, window.location.href);
                window.location.replace('/guniversidadfrontend/public/template/html/iniciarSesion.html');
            }, 1500);
            
        } catch (error) {
            sessionStorage.removeItem('usuarioActivo');
            Alerta.cargarSimple(1500, 'Error al cerrar sesión. Redirigiendo, espere por favor...', null);
            
            setTimeout(() => {
                window.history.pushState(null, null, window.location.href);
                window.location.replace('/guniversidadfrontend/public/template/html/iniciarSesion.html');
            }, 1500);
        }
    }*/

    // inicia sesion
    static iniciarSesion()
    {
        const formIniciarSesion = document.querySelector('#formIniciarSesion');
        const inputs = document.querySelectorAll('#formIniciarSesion input');
        const correoONombre = document.querySelector('#correoONombre');
        const contraseña = document.querySelector('#contraseña');

        // Elementos del modal de soporte
        const panelSoporte = document.querySelector('#panelSoporte');
        const formSoporte = document.querySelector('#formSoporte');
        const correoSoporte = document.querySelector('#correoSoporte');
        const motivoSoporte = document.querySelector('#motivoSoporte');
        const enviarSoporte = document.querySelector('#enviarSoporte');

        let validados = { correoONombre : false, contraseña : false };
        let validadosSoporte = { correo : false, motivo : false };

        let intentos = 0;
        const maxIntentos = 3;
        const modalSoporte = new bootstrap.Modal(panelSoporte);

        // Validación en tiempo real para cada input
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                switch(this.id) {
                    case 'correoONombre':
                        validados.correoONombre = u_verificaciones.validarNombreOCorreo(correoONombre.value.trim());
                        u_utiles.colorearCampo(validados.correoONombre, '#correoONombre');
                        break;
                    case 'contraseña':
                        validados.contraseña = u_verificaciones.validarContraseña(contraseña.value.trim());
                        u_utiles.colorearCampo(validados.contraseña, '#contraseña');
                        break;
                }
            });
        });

        formIniciarSesion.addEventListener('submit', async function(e) {
            e.preventDefault();

            if(!u_utiles.validarTodosCampos(validados)) {
                Alerta.notificarAdvertencia('Por favor, rellene correctamente los campos en rojo.', 3000);
                return;
            }

            try {
                const nuevaS = new m_sesion(correoONombre.value.trim(), contraseña.value.trim());

                
                let secretario = (nuevaS.nombreOCorreo == 'secretario' || nuevaS.nombreOCorreo == 'secretario@email.com') && nuevaS.contraseña == 'secretario1234';
                let administrador = (nuevaS.nombreOCorreo == 'admin' || nuevaS.nombreOCorreo == 'admin@email.com') && nuevaS.contraseña == 'admin1234';

                if(secretario || administrador){
                    intentos = 0;
                    m_sesion.guardarSesion('usuarioActivo', nuevaS);

                    switch(administrador ? 'Administrador' : 'Secretario') // Reemplazar con variable rol
                    {
                        case 'Administrador': 
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/admin/index.html');
                            break;
                        case 'Profesor': 
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                            break;
                        case 'Estudiante': 
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                            break;
                        case 'Secretario':
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/secretarioAcademico/index.html');
                            break;
                    }

                   formIniciarSesion.reset();
                }else {
                    if(intentos >= maxIntentos) {
                        Alerta.notificarError(`Credenciales incorrectas. Intento ${intentos} de ${maxIntentos}. Por favor, contacte a soporte.`, 3000);
                        modalSoporte.show();
                        return;
                    }else{
                        intentos++;
                        Alerta.notificarError(`Credenciales incorrectas. Intento ${intentos} de ${maxIntentos}.`, 3000);
                        return;
                    }
                }

                /*PARTE REAL
                let usuarioVerificado = await fetchSesion.verificarCredencialesEnBackend(nuevaS);
                if (usuarioVerificado) {
                    intentos = 0;   // Reiniciar contador de intentos al iniciar sesión exitosamente

                    m_sesion.guardarSesion('usuarioActivo', usuarioVerificado);

                    let rol = usuarioVerificado.rol;
                    switch (rol) {
                        case 'Administrador':
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/admin/index.html');
                            break;
                        case 'Profesor':
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                            break;
                        case 'Estudiante':
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                            break;
                        case 'Secretario':
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/secretarioAcademico/index.html');
                            break;
                    }

                    formIniciarSesion.reset();
                }else {
                    intentos++;
                    
                    if(intentos >= maxIntentos) {
                        Alerta.notificarError(`Credenciales incorrectas. Intento ${intentos} de ${maxIntentos}. Por favor, contacte a soporte.`, 3000);

                        // Mostrar el modal de soporte
                        if (panelSoporte) {
                            panelSoporte.style.display = 'block';
                        }
                        return;
                    }
                }*/
            } catch(error) {
                Alerta.notificarError(`Error de verificación [m_sesion]: ${error}.`, 3000);
                return;
            }
        });


        // ============================================
        // PARTE DEL SOPORTE
        // ============================================

        // Validación en tiempo real para el correo en el modal de soporte
        if (correoSoporte) {
            correoSoporte.addEventListener('input', function() {
                validadosSoporte.correo = u_verificaciones.validarCorreo(correoSoporte.value.trim());
                if (!validadosSoporte.correo) {
                    u_utiles.colorearCampo(validadosSoporte.correo, '#correoSoporte', '#errorCorreoSoporte', 'Formato de correo inválido');
                } else {
                    u_utiles.colorearCampo(validadosSoporte.correo, '#correoSoporte', '#errorCorreoSoporte', '');
                }
            });
        }

        // Validación para el motivo
        if (motivoSoporte) {
            motivoSoporte.addEventListener('input', function() {
                validadosSoporte.motivo = u_verificaciones.validarMensaje(motivoSoporte.value.trim()); 
                if (!validadosSoporte.motivo) {
                    u_utiles.colorearCampo(validadosSoporte.motivo, '#motivoSoporte', '#errorMotivoSoporte', 'El motivo debe tener al menos 10 caracteres');
                } else {
                    u_utiles.colorearCampo(validadosSoporte.motivo, '#motivoSoporte', '#errorMotivoSoporte', '');
                }
            });
        }

        // Manejar el envío del formulario de soporte
        if (enviarSoporte) {
            enviarSoporte.addEventListener('click', async function() {
                if(!u_utiles.validarTodosCampos(validadosSoporte)) {
                    Alerta.notificarAdvertencia('Por favor, rellene correctamente los campos en rojo.', 3000);
                    return;
                }

                try {
                    // Verificar si el correo existe en la base de datos
                    // const correoExiste = await fetchSesion.verificarExistenciaCorreoEnBackend(correoSoporte.value.trim());
                    const correoExiste = 'admin@email.com';
                    
                    /*if (!correoExiste) {
                        u_utiles.colorearCampo(correoExiste, '#correoSoporte', '#errorCorreoSoporte', 
                            'Este correo no existe en la base de datos. No se puede enviar la solicitud.');
                        return;
                    }*/

                    if (correoExiste != 'admin@email.com'){
                        u_utiles.colorearCampo(correoExiste, '#correoSoporte', '#errorCorreoSoporte', 
                            'Este correo no existe en la base de datos. No se puede enviar la solicitud.');
                        return;
                    }

                    // Si el correo existe, enviar la solicitud de soporte
                    const nuevaSolicitud = new m_soporte(null, correoSoporte.value.trim(), motivoSoporte.value.trim());
                    //let solicitudGuardada = await fetchSoporte.guardarCredencialesSoporteEnBackend(nuevaSolicitud);
                    let solicitudGuardada = 1;

                    if (!solicitudGuardada) {
                        Alerta.notificarError('Solicitud no enviada. Inténtelo de nuevo', 3000);
                        return;
                    }
                    
                    Alerta.notificarExito('Solicitud enviada correctamente. Pronto recibirá un mensaje por su correo.', 3000);
                    
                    // Limpiar y cerrar el modal
                    formSoporte.reset();
                    modalSoporte.hide();
                    
                } catch (error) {
                    Alerta.notificarError('Error al verificar el correo. Inténtelo de nuevo.', 3000);
                }
            });
        }
    }

    static cerrarSesion() {
        try {
            let usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (usuarioActual) {
                let usuarioVacio = {};
                for (let clave in usuarioActual) { usuarioVacio[clave] = null; }
                m_sesion.guardarSesion('usuarioActivo', usuarioVacio);
            } else {
                m_sesion.guardarSesion('usuarioActivo', { nombreOCorreo: null, contraseña: null });
            }
            
            // Mostrar alerta
            Alerta.cargarSimple(1500, 'Cerrando sesión. Redirigiendo, espere por favor...', null);
            
            setTimeout(() => {
                this._prevenirRetornoYRedirigir('/guniversidadfrontend/public/template/html/iniciarSesion.html');
            }, 1500);
            
        } catch (error) {
            sessionStorage.removeItem('usuarioActivo');
            Alerta.cargarSimple(1500, 'Error al cerrar sesión. Redirigiendo, espere por favor...', null);
            
            setTimeout(() => {
                this._prevenirRetornoYRedirigir('/guniversidadfrontend/public/template/html/iniciarSesion.html');
            }, 1500);
        }
    }

    // Método privado para prevenir el botón atrás
    static _prevenirRetornoYRedirigir(url) {
        // Reemplazar la página actual en el historial
        window.location.replace(url);
        
        // Agregar múltiples entradas en el historial para "bloquear" el botón atrás
        window.history.pushState(null, null, url);
        window.history.pushState(null, null, url);
        
        // Listener para detectar intentos de navegación hacia atrás
        window.addEventListener('popstate', function preventBack() {
            window.history.pushState(null, null, url);
            window.location.replace(url);
        });
        
        // También prevenir la tecla de retroceso del navegador
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && 
                !e.target.matches('input, textarea, [contenteditable]')) {
                e.preventDefault();
                window.location.replace(url);
            }
        });
    }
}