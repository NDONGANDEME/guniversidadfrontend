import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchPlanSemestreAsignatura
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los CursoPlanEstudioAsignatura de la BDD
     * @returns array de CursoPlanEstudioAsignatura
     */
    static async obtenerPlanSemestreAsignaturasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planSemestreAsignatura&accion=obtenerPlanSemestreAsignaturas&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo PlanSemestreAsignatura en la BDD
     * @param {m_PlanSemestreAsignatura} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarPlanSemestreAsignaturaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planSemestreAsignatura&accion=insertarPlanSemestreAsignatura&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCursoPlanEstudioAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un PlanSemestreAsignatura guardado en la BDD
     * @param {m_PlanSemestreAsignatura} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarPlanSemestreAsignaturaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planSemestreAsignatura&accion=actualizarPlanSemestreAsignatura&actor=secretario`, {
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
}