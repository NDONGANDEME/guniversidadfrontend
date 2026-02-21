import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchCurso
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar los curso de la BDD
     * @returns array de cursos
     */
    static async obtenerCursosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=curso&accion=obtenerCursos&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCurso]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo curso a la BDD
     * @param {m_carrera} objeto - objeto que contiene los parametros de la clase curso
     * @returns id del nuevo registro insertado
     */
    static async insertarCursoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=curso&accion=insertarCurso&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCurso]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_carrera} objeto - objeto que contiene los parametros de la clase curso
     * @returns id del registro actualizado
     */
    static async actualizarCursoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=curso&accion=actualizarCurso&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCurso]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async deshabilitarCursoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=curso&accion=deshabilitarCurso&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchCurso]. ${error}`);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async habilitarCursoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=curso&accion=habilitarCurso&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchCurso]. ${error}`);
            return false;
        }
    }
}