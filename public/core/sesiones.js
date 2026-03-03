import { m_sesion } from "../modelo/m_sesion.js";
import { Alerta } from "../utilidades/u_alertas.js";

export class sesiones
{
    static async verificarExistenciaSesion()
    {
        try {
            let usuarioRegistrado = m_sesion.leerSesion('usuarioActivo');
            console.log(usuarioRegistrado);

            let estatico = !usuarioRegistrado || usuarioRegistrado.nombreOCorreo == null || usuarioRegistrado.contraseña == null;
            //let dinamico = !usuarioRegistrado || usuarioRegistrado.nombreUsuario == null || usuarioRegistrado.correo == null;

            // Si no hay usuario registrado o los campos están vacíos
<<<<<<< HEAD
            if (!usuarioRegistrado || usuarioRegistrado.nombreUsuario == null || usuarioRegistrado.correo == null) {
                console.log('HEEEEEEEEEEEEEEEEE');
=======
            if (estatico) {
>>>>>>> 06dafdbe5a62a4b9354fb22a689ebaa66e2f9429
                // Mostrar alerta y redirigir cuando se cierre
                let confirmacion = await Alerta.advertencia('Atención', 'Por favor, inicie sesión para poder acceder a la interfaz.', true);
                if (confirmacion) Alerta.cargarSimple(3000, 'Redirigiendo, espere por favor...', '/guniversidadfrontend/public/template/html/iniciarSesion.html');
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            Alerta.cargarSimple(3000, 'Error al iniciar sesión. Redirigiendo...', '/guniversidadfrontend/public/template/html/iniciarSesion.html');
        }
    }
}