import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchSemestre
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar los semestres de la BDD
     * @returns array de semestres
     * Ya es funcional
     */
    static async obtenerSemestresDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=semestre&accion=obtenerSemestres&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchSemestre]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo semestre a la BDD
     * @param {m_semestre} objeto - objeto que contiene los parametros de la clase semestre
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarSemestreEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=semestre&accion=insertarSemestre&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json(); console.log(respuesta)
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchSemestre]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_semestre} objeto - objeto que contiene los parametros de la clase semestre
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarSemestreEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=semestre&accion=actualizarSemestre&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchSemestre]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarSemestreEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=semestre&accion=eliminarSemestre&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchSemestre]. ${error}`);
            return false;
        }
    }
}