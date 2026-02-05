import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchCarrera
{
    url = '/guniversidadfrontend/public/core/endpoint.php';


    // cargar todas las carreras de la tabla carrera (solo el nombreCarrera)
    static async cargarNombreCarrerasDelBackend()
    {
        try
        {
            let solicitud = await fetch(`${url}?ruta=carrera&action=listarNombreCarrera`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 15. fetchCarrera]');
            
            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 20. fetchCarrera]`);
                return;
            }
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 24. fetchCarrera]. ${error}`);
            return;
        }
    }



    // enviar el dato de nombre de carrera al backend (me retorna el nuevo ID)
    static async enviarDatosInsercionCarrerasAlBackend(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=carrera&action=insertarNuevaCarrera`,
                {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 43. fetchCarrera]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 48. fetchCarrera]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 52. fetchCarrera]. ${error}`);
            return;
        }
    }
}


    