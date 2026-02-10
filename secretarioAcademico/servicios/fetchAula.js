import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAula
{
    url = '/guniversidadfrontend/public/core/endpoint.php';



    static async obtenerAulasDeBDD()
    {
        try
        {
            let solicitud = await fetch(`${url}?ruta=aula&accion=obtenerAulas`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 15. fetchAula]');
            
            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 20. fetchAula]`);
                return;
            }
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 24. fetchAula]. ${error}`);
            return;
        }
    }



    static async insertarAulaEnBDD(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=aula&accion=insertarAula`,
                {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 42. fetchAula]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 47. fetchAula]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 51. fetchAula]. ${error}`);
            return;
        }
    }



    static async actualizarAulaEnBDD(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=aula&accion=actualizarAula`,
                {
                    method:'PUT',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 69. fetchAula]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 74. fetchAula]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 78. fetchAula]. ${error}`);
            return;
        }
    }



    static async deshabilitarAulaEnBDD(id)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=aula&accion=deshabilitarAula&valor=${id}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 90. fetchAula]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 95. fetchAula]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 99. fetchAula]. ${error}`);
            return;
        }
    }
}