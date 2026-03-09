import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_estudiante } from "../modelo/m_estudiante.js";

export class fetchEstudiante
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los estudiante de la BDD
     * @returns array de estudiante
     */
    static async obtenerEstudiantesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=obtenerEstudiantes&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudiante]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para listar los estudiante de la BDD
     * @returns array de estudiante que ven una determinada asignatura
     */
    static async obtenerEstudiantesPorAsignaturaDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=obtenerEstudiantesPorAsignatura&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudiante]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para listar los estudiante de la BDD
     * @returns array de estudiante
     */
    static async obtenerEstudiantesPorFacultadDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=obtenerEstudiantesPorFacultad&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudiante]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para listar los estudiante de la BDD
     * @returns array de estudiantes (nombreEstudiante, carrera, curso, semestre)
     */
    static async obtenerDatosEspecificosEstudiantesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=obtenerDatosEspecificosEstudiantes&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudiante]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo estudiante en la BDD
     * @param {m_estudiante|FormData} objeto 
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarEstudianteEnBDD(objeto) {
        try {
            // Detectar si es FormData
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'POST',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            // Solo agregar headers si NO es FormData
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=insertarEstudiante&actor=secretario`, options);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insercion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un estudiante guardado en la BDD
     * @param {m_estudiante|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarEstudianteEnBDD(objeto) {
        console.log(objeto)
        try {
            // Detectar si es FormData
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'POST',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            // Solo agregar headers si NO es FormData
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=actualizarEstudiante&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actualizacion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarEstudianteEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=deshabilitarEstudiante&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudiante]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarEstudianteEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=habilitarEstudiante&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudiante]. ${error}`, 3000);
            return false;
        }
    }
}