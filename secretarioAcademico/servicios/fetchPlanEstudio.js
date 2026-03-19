import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchPlanEstudio
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los planes de estudios de la BDD pertenecientes a una determinada facultad
     * @param {Integer} idFacultad 
     * @returns array de planes de estudios de una determinada facultad
     */
    static async obtenerPlanesEstudiosPorFacultadDelBackend(idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planestudio&accion=obtenerPlanesEstudiosPorFacultad&actor=secretario&id=${idFacultad}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar los planes de estudios de una determinada facultad a paginar
     * @param {Integer} pagina 
     * @param {Integer} idFacultad 
     * @returns un objeto con: el numero total de paginas, la pagina actual y la lista de planes de estudios para la pagina actual.
     */
    static async obtenerPlanesEstudiosAPaginarPorFacultadDelBackend(pagina, idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planestudio&accion=obtenerPlanesEstudiosAPaginarPorFacultad&actor=secretario&pagina=${pagina}&id=${idFacultad}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo plan de estudios en la BDD
     * @param {m_archivo} objeto 
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarPlanEstudioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=insertarPlanEstudio&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un plan de estudios guardado en la BDD
     * @param {m_archivo} objeto 
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarPlanEstudioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=actualizarPlanEstudio&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async eliminarPlanEstudioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=eliminarPlanEstudio&id=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return false;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return false;
        }
    }
}