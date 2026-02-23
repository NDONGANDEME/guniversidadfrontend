import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_cursoPlanEstudioAsignatura } from "../modelo/m_cursoPlanEstudioAsignatura.js";

export class fetchCursoPlanEstudioAsignatura
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los CursoPlanEstudioAsignatura de la BDD
     * @returns array de CursoPlanEstudioAsignatura
     */
    static async obtenerCursoPlanEstudioAsignaturasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudioAsignatura&accion=obtenerCursoPlanEstudioAsignaturas&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo CursoPlanEstudioAsignatura en la BDD
     * @param {m_cursoPlanEstudioAsignatura} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarCursoPlanEstudioAsignaturaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudioAsignatura&accion=insertarCursoPlanEstudioAsignatura&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un CursoPlanEstudioAsignatura guardado en la BDD
     * @param {m_cursoPlanEstudioAsignatura} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarCursoPlanEstudioAsignaturaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudioAsignatura&accion=actualizarCursoPlanEstudioAsignatura&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarCursoPlanEstudioAsignaturaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudioAsignatura&accion=deshabilitarCursoPlanEstudioAsignatura&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarCursoPlanEstudioAsignaturaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=cursoPlanEstudioAsignatura&accion=habilitarCursoPlanEstudioAsignatura&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return false;
        }
    }
}