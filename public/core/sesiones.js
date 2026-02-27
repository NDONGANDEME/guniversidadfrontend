import { m_sesion } from "../modelo/m_sesion.js";
import { Alerta } from "../utilidades/u_alertas.js";

export class sesiones
{
    static async verificarExistenciaSesion()
    {
        try {
            let usuarioRegistrado = m_sesion.leerSesion('usuarioActivo');

            // Verificar si el usuario existe y tiene los campos necesarios
            let sesionValida = usuarioRegistrado && (usuarioRegistrado.nombreUsuario || usuarioRegistrado.correo);

            // Si NO hay sesión válida
            if (!sesionValida) {
                let confirmacion = await Alerta.advertencia('Atención', 'Por favor, inicie sesión para poder acceder a la interfaz.', true);
                
                if (confirmacion) Alerta.cargarSimple(3000, 'Redirigiendo, espere por favor...', '/guniversidadfrontend/public/template/html/iniciarSesion.html');
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            Alerta.cargarSimple(3000, 'Error al verificar sesión. Redirigiendo...', '/guniversidadfrontend/public/template/html/iniciarSesion.html');
        }
    }
}