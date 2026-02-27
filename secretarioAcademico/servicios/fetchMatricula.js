import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_matricula } from "../modelo/m_matricula.js";

export class fetchMatricula
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar las matriculas de la BDD
     * @returns array de matriculas
     */
    static async obtenerMatriculasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=obtenerMatriculas&actor=secretario`);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva matricula en la BDD
     * @param {m_matricula} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarMatriculaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=insertarMatricula&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una matricula guardado en la BDD
     * @param {m_matricula} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarMatriculaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=actualizarMatricula&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarMatriculaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=deshabilitarMatricula&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarMatriculaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=habilitarMatricula&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return false;
        }
    }
}