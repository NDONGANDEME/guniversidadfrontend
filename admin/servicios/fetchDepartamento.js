import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchDepartamento
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar los departamentos de la BDD
     * @returns array de departamento
     * Ya es funcional
     */
    static async obtenerDepartamentosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&accion=obtenerDepartamentos&actor=admin`);
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
     * Ya es funcional
     */
    static async insertarDepartamentoEnBackend(objeto) {
        console.log(objeto)
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
     * Ya es funcional
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


    // aun falta
    /**
     * Envia colicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarDepartamentoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&accion=eliminarDepartamento&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchDepartamento]. ${error}`);
            return false;
        }
    }

    /**
     * Envia solicitud para cargar los departamentos de la BDD
     * @returns array de departamento
     */
    static async obtenerDepartamentosPorFacultadDelBackend(idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=departamento&action=obtenerDepartamentosPorFacultad&actor=admin&valor=${idFacultad}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchDepartamento]. ${error}`, 3000);
            return [];
        }
    }

}