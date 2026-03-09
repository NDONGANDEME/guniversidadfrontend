import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_matricula } from "../modelo/m_matricula.js";

export class fetchMatricula
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar las matriculas de la BDD
     * @returns array de matriculas
     * Ya es funcional
     */
    static async obtenerMatriculasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=obtenerMatriculas&actor=secretario`);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva matricula en la BDD
     * @param {m_matricula|FormData} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarMatriculaEnBDD(objeto) {
        objeto.forEach((valor, clave) => {
            console.log(clave + ': ' + valor);
        });
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
            
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=insertarMatricula&actor=secretario`, options);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insercion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una matricula guardado en la BDD
     * @param {m_matricula|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarMatriculaEnBDD(objeto) {
        objeto.forEach((valor, clave) => {
            console.log(clave + ': ' + valor);
        });
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
            
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=actualizarMatricula&actor=secretario`, options);
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
    static async deshabilitarMatriculaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=deshabilitarMatricula&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarMatriculaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=matricula&accion=habilitarMatricula&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchMatricula]. ${error}`, 3000);
            return false;
        }
    }
}