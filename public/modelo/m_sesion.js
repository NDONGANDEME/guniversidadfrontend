import { fetchSesion } from "../servicios/fetchSesion.js";
import { Alerta } from "../utilidades/u_alertas.js";
import { u_utiles } from "../utilidades/u_utiles.js";
import { u_verificaciones } from "../utilidades/u_verificaciones.js";

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
    static cerrarSesion()
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
    }

    // inicia sesion
    static iniciarSesion()
    {
        const formIniciarSesion = document.querySelector('#formIniciarSesion');
        const inputs = document.querySelectorAll('#formIniciarSesion input');
        const correoONombre = document.querySelector('#correoONombre');
        const contraseña = document.querySelector('#contraseña');

        let validados = { correoONombre : false, contraseña : false };

        let intentos = 0;
        const maxIntentos = 3;

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

                
                /*let secretario = (nuevaS.nombreOCorreo == 'secretario' || nuevaS.nombreOCorreo == 'secretario@email.com') && nuevaS.contraseña == 'secretario1234';
                let administrador = (nuevaS.nombreOCorreo == 'admin' || nuevaS.nombreOCorreo == 'admin@email.com') && nuevaS.contraseña == 'admin1234';
                let profesor = (nuevaS.nombreOCorreo == 'profesor' || nuevaS.nombreOCorreo == 'profesor@email.com') && nuevaS.contraseña == 'profesor1234';

                if(secretario || profesor || administrador){
                    intentos = 0;
                    m_sesion.guardarSesion('usuarioActivo', nuevaS);

                    switch(profesor ? 'Profesor' : 'Secretario') // Reemplazar con variable rol
                    {
                        case 'Administrador': 
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/admin/index.html');
                            break;
                        case 'Profesor': 
                            Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/profesor/index.html');
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
                }*/

                //*PARTE REAL
                let usuarioVerificado = await fetchSesion.verificarCredencialesEnBackend(nuevaS); console.log(usuarioVerificado);

                if (usuarioVerificado) {
                    intentos = 0;   // Reiniciar contador de intentos al iniciar sesión exitosamente

                    m_sesion.guardarSesion('usuarioActivo', usuarioVerificado[0]);

                    let estado = usuarioVerificado[0].estado; console.log(usuarioVerificado[0].estado)

                    if (estado == 'activo') {
                        let rol = usuarioVerificado[0].rol;

                        switch (rol) {
                            case 'Administrador':
                                Alerta.cargarSimple(1500, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/admin/index.html');
                                break;
                            case 'Profesor':
                                Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                                break;
                            case 'Estudiante':
                                Alerta.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                                break;
                            case 'Secretario':
                                Alerta.cargarSimple(1500, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/secretarioAcademico/index.html');
                                break;
                        }

                        formIniciarSesion.reset();
                    } else {
                        Alerta.informacion('Usuario inactivo', 'Usted no cuenta con el permiso de acceder al sistema. Porfavor, contacte con el administrador.');
                    }

                }else {
                    if(intentos >= maxIntentos) {
                        Alerta.notificarError(`Credenciales incorrectas. Intento ${intentos} de ${maxIntentos}. Por favor, contacte a soporte.`, 3000);
                        return;
                    }else{
                        intentos++;
                        Alerta.notificarError(`Credenciales incorrectas. Intento ${intentos} de ${maxIntentos}.`, 3000);
                        return;
                    }
                }
            } catch(error) {
                Alerta.notificarError(`Error de verificación [m_sesion]: ${error}.`, 3000);
                return;
            }
        });
    }
}