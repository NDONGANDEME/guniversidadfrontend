import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_cursoPlanEstudio } from "../modelo/m_cursoPlanEstudio.js";

export class fetchCursoPlanEstudio
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los cursos_planEstudio de la BDD
     * @returns array de cursos_planEstudio
     */
    static async obtenerCursoPlanesEstudiosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudio&accion=obtenerCursoPlanesEstudios&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudio]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo curso_planEstudio en la BDD
     * @param {m_cursoPlanEstudio} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarCursoPlanEstudioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudio&accion=insertarCursoPlanEstudio&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudio]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un curso_planEstudio guardado en la BDD
     * @param {m_cursoPlanEstudio} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarCursoPlanEstudioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudio&accion=actualizarCursoPlanEstudio&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudio]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarCursoPlanEstudioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudio&accion=deshabilitarCursoPlanEstudio&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudio]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarCursoPlanEstudioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudio&accion=habilitarCursoPlanEstudio&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudio]. ${error}`, 3000);
            return false;
        }
    }
}