import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchCarrera
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar las carreras de la BDD
     * @returns array de carreras
     * Ya es funcional
     */
    static async obtenerCarrerasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=obtenerCarreras&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva carrera a la BDD
     * @param {m_carrera} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarCarreraEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=insertarCarrera&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_carrera} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarCarreraEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=actualizarCarrera&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarCarreraEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=eliminarCarrera&id=${id}&actor=admin`);
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

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async cambioEstadoCarreraEnBDD(id, estado) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=cambioEstadoCarrera&id=${id}&nuevoEstado=${estado}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return false;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Enviar solicitud para cargar el total de las carreras a paginar
     * @returns entero
     */
    static async obtenerTotalPaginasCarreraDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=obtenerTotalPaginasCarrera&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar el total de las carreras a paginar
     * @returns entero
     */
    static async obtenerCarrerasPorFacultadDelBackend(idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=obtenerCarrerasPorFacultad&actor=admin&id=${idFacultad}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar las carreras a paginar
     * @returns array de Carreras
     */
    static async obtenerCarrerasAPaginarDelBackend(pagina) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=obtenerCarrerasAPaginar&actor=admin&pagina=${pagina}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return [];
        }
    }
}