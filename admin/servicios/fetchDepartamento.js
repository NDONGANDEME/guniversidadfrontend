import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_departamento } from "../modelo/m_departamento.js";

export class fetchDepartamento
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Obtiene todos los departamentos almacenados en la BDD
     * @returns array de departamento
     */
    static async obtenerDepartamentosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&action=obtenerDepartamentos&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchDepartamento]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Guarda la nueva facultad creada en la BDD
     * @param {m_departamento} objeto - objeto que contiene los parametros de la clase facultad
     * @returns el nuevo id insertado en la BDD
     */
    static async insertarDepartamentoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&accion=insertarDepartamento&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchDepartamento]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Modifica los campos, modificados por el usuario, en la BDD
     * @param {m_departamento} objeto - objeto que contiene los parametros de la clase facultad
     * @returns el id del registro actualizado
     */
    static async actualizarDepartamentoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&accion=actualizarDepartamento&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchDepartamento]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns booleano que indique se se ha desabilitado el registro del id pasado por la url
     */
    static async deshabilitarDepartamentoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&accion=deshabilitarDepartamento&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchDepartamento]. ${error}`);
            return false;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns booleano que indique se se ha desabilitado el registro del id pasado por la url
     */
    static async habilitarDepartamentoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&accion=habilitarDepartamento&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchDepartamento]. ${error}`);
            return false;
        }
    }
}