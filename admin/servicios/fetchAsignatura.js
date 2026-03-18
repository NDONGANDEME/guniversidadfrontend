import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAsignatura
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Enviar solicitud para cargar el total las asignaturas a paginar
     * @returns array de asignaturas
     */
    static async obtenerAsignaturasAPaginarDelBackend(pagina) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturasAPaginar&actor=admin&pagina=${pagina}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.advertencia('Atencion', respuesta.resultado);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar el total de las asignaturas a paginar
     * @returns entero
     */
    static async obtenerTotalPaginasAsignaturaDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerTotalPaginasAsignatura&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.advertencia('Atencion', respuesta.resultado);
                return [];
            }
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
            else {
                Alerta.advertencia('Atencion', respuesta.resultado);
                return null;
            }
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
            else {
                Alerta.advertencia('Atencion', respuesta.resultado);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return null;
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
    static async obtenerAsignaturasPorPlanEstudioDelBackend(idEstudiante) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturasPorPlanEstudio&actor=admin&valor=${idEstudiante}`);
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
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
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
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarAsignaturaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=eliminarAsignatura&id=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return false;
            }
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchCarrera]. ${error}`);
            return false;
        }
    }
}