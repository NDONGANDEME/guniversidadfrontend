import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAsignatura
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Enviar solicitud para cargar las asignaturas de la BDD
     * @returns array de asignaturas
     * Ya es funcional
     */
    static async obtenerAsignaturasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturas&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar las asignaturas de la BDD
     * @returns array de asignaturas
     */
    static async obtenerAsignaturasPorSemestreDelBackend(numeroSemestre) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturasPorSemestre&actor=admin&valor=${numeroSemestre}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar las asignaturas de la BDD
     * @returns array de asignaturas
     */
    static async obtenerAsignaturasPendientesYBloqueadasDelBackend(numeroSemestre) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturasPendientesYBloqueadas&actor=admin&valor=${numeroSemestre}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar las asignaturas por facultad de la BDD
     * @returns array de asignaturas de una facultad en especifico
     * Ya es funcional
     */
    static async obtenerAsignaturasPorFacultadDelBackend(idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturasPorFacultad&actor=admin&idFacultad=${idFacultad}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva asignatura en la BDD
     * @param {m_asignatura} objeto - objeto que contiene los parametros de la clase asignatura
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarAsignaturaEnBackend(objeto) {
        console.log(objeto)
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=insertarAsignatura&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_asignatura} objeto - objeto que contiene los parametros de la clase asignatura
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarAsignaturaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=actualizarAsignatura&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async deshabilitarAsignaturaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=deshabilitarAsignatura&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchAsignatura]. ${error}`);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async habilitarAsignaturaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=habilitarAsignatura&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchAsignatura]. ${error}`);
            return false;
        }
    }
}