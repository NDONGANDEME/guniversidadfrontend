import { m_sesion } from "../modelo/m_sesion.js";
import { Alerta } from "../utilidades/u_alertas.js";

export class sesiones
{
    static async verificarExistenciaSesion()
    {
        try {
            let usuarioRegistrado = m_sesion.leerSesion('usuarioActivo');

            // Si no hay usuario registrado o los campos están vacíos
            if (!usuarioRegistrado || usuarioRegistrado.nombreOCorreo == null || usuarioRegistrado.contraseña == null) {
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