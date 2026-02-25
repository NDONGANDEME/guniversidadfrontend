import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchMatriculaAsignatura
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar las matriculaAsignaturas de la BDD
     * @returns array de matriculaAsignaturas
     */
    static async obtenerMatriculaAsignaturasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=obtenerMatriculaAsignaturas&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatriculaAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva matriculaAsignatura en la BDD
     * @param {m_matriculaAsignatura} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarMatriculaAsignaturaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=insertarMatriculaAsignatura&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatriculaAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una matriculaAsignatura guardado en la BDD
     * @param {m_matriculaAsignatura} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarMatriculaAsignaturaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=actualizarMatriculaAsignatura&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatriculaAsignatura]. ${error}`, 3000);
            return null;
        }
    }
}