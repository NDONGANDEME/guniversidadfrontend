import { Alerta, u_alertas } from "../utilidades/u_alertas.js";
import { u_utiles } from "../utilidades/u_utiles.js";
import { u_verificaciones } from "../utilidades/u_verificaciones.js";

export class m_sesion
{
    constructor(nombreOCorreo, contraseña){
        this.nombreOCorreo = nombreOCorreo;
        this.contraseña = contraseña;
    }



    // metodo para guardar sesion
    static guardarSesion(clave, objeto){
        sessionStorage.clear();
        sessionStorage.setItem(clave, JSON.stringify(objeto));
    }



    // metodo para leer sesion
    static leerSesion(clave){
        let datoGuardado = {};
        return datoGuardado = JSON.parse(sessionStorage.getItem(clave));
    }



    // Método para cerrar sesión
    static cerrarSesion()
    {
        try {
            let usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (usuarioActual) {
                let usuarioVacio = {};
                for (let key in usuarioActual) {
                    usuarioVacio[key] = null;
                }
                
                m_sesion.guardarSesion('usuarioActivo', usuarioVacio);
            } else {
                m_sesion.guardarSesion('usuarioActivo', {
                    nombreOCorreo: null,
                    contraseña: null
                });
            }
            
            u_alertas.cargarSimple(3000, 'Cerrando sesión. Redirigiendo, espere por favor...', '/guniversidadfrontend/index.html');
        } catch (error) {
            sessionStorage.removeItem('usuarioActivo');
            u_alertas.cargarSimple(3000, 'Error al cerrar sesión. Redirigiendo, espere por favor...', '/guniversidadfrontend/index.html');
        }
    }



    // metodo para iniciar sesion
    static iniciarSesion()
    {
        const formIniciarSesion = document.querySelector('#formIniciarSesion');
        const inputs = document.querySelectorAll('#formIniciarSesion input');
        const correoONombre = document.querySelector('#correoONombre');
        const contraseña = document.querySelector('#contraseña');

        let esValido = false;
        let validados = { 
            correoONombre : false, 
            contraseña : false 
        };

        // Validación en tiempo real para cada input
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                switch(this.id) 
                {
                    case 'correoONombre':
                        esValido = u_verificaciones.validarNombreOCorreo(this.value.trim());
                        u_utiles.colorearCampo(esValido, this);
                        break;
                    
                    case 'contraseña':
                        esValido = u_verificaciones.validarContraseña(this.value.trim());
                        u_utiles.colorearCampo(esValido, this);
                        break;
                }
            });
        });

        formIniciarSesion.addEventListener('submit', async function(e)
        {
            e.preventDefault();

            // Validar todas las validaciones individuales
            if (u_utiles.validarTodosCampos(validados)) { 
                Alerta.advertencia('¡Atención!', 'Por favor, rellene correctamente los campos en rojo.');
                return;
            }

            try
            {
                const nuevaS = new m_sesion(correoONombre.value.trim(), contraseña.value.trim()); 

                // verificar con los datos del backend
                //let usuarioVerificado = await fetchSesion.verificarCorreoONombreYContraseñaEnBackend(nuevaS);

                if((nuevaS.nombreOCorreo=='secretario' || nuevaS.nombreOCorreo=='secretario@email.com') && nuevaS.contraseña=='secretario1234'){
                    m_sesion.guardarSesion('usuarioActivo', nuevaS);
                    //let rol = usuarioVerificado.rol;

                    switch('Secretario'){
                        case 'Administrador': 
                            u_alertas.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/admin/index.html');
                            break;
                        case 'Profesor': 
                            u_alertas.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                            break;
                        case 'Estudiante': 
                            u_alertas.cargarSimple(3000, 'Credenciales correctas. Procesando...', '#');
                            break;
                        case 'Secretario':
                            u_alertas.cargarSimple(3000, 'Credenciales correctas. Procesando...', '/guniversidadfrontend/secretario/index.html');
                            break;
                    }

                    formIniciarSesion.reset();
                }else{
                    Alerta.error('Error', 'Credenciales incorectas. Intentelo de nuevo. [linea 99. m_sesion]');
                    return;
                }
            }catch(error)
            {
                Alerta.error('Error', `Error de verificacion: ${error}. [linea 104. m_sesion]`);
                return;
            }
        });
    }
}