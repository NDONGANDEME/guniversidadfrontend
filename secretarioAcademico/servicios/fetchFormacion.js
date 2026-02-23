import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchFormacion
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar la formacion de un profesor en especifico
     * @param {Integer} idProfesor 
     * @returns formacion del profesor pasado como parametro
     */
    static async obtenerFormacionPorProfesorDelBackend(idProfesor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=formacion&accion=obtenerFormacionPorProfesor&actor=secretario&valor=${idProfesor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFormacion]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva formacion en la BDD
     * @param {m_formacion} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarFormacionEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=formacion&accion=insertarFormacion&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFormacion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una formacion guardado en la BDD
     * @param {m_formacion} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarFormacionEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=formacion&accion=actualizarFormacion&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFormacion]. ${error}`, 3000);
            return null;
        }
    }
}