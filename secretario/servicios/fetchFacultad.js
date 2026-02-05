import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchFacultad
{
    url = '/guniversidadfrontend/public/core/endpoint.php';


    // cargar todas las facultades de la tabla Facultad
    static async cargarTodasFacultadesDelBackend()
    {
        try
        {
            let solicitud = await fetch(`${url}?ruta=facultad&action=obtenerFacultades`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 15. fetchFacultad]');
            
            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 20. fetchFacultad]`);
                return;
            }
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 24. fetchFacultad]. ${error}`);
            return;
        }
    }



    // enviar el datos de la nueva facultad al backend (me retorna el nuevo ID)
    static async enviarDatosAInsertarFacultadAlBackend(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=facultad&action=insertarFacultad`,
                {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 43. fetchFacultad]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 48. fetchFacultad]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 52. fetchFacultad]. ${error}`);
            return;
        }
    }



    // enviar el datos para actualizar la facultad en el backend
    static async enviarDatosAActualizarFacultadAlBackend(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=facultad&action=actualizarFacultad`,
                {
                    method:'PUT',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 71. fetchFacultad]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 76. fetchFacultad]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 80. fetchFacultad]. ${error}`);
            return;
        }
    }



    // enviar el datos para desbilitar la facultad en el backend
    static async enviarDatosADeshabilitarFacultadAlBackend(id)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=facultad&action=deshabilitarFacultad&valor=${id}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 93. fetchFacultad]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 98. fetchFacultad]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 102. fetchFacultad]. ${error}`);
            return;
        }
    }
}