import { Alerta } from "../utilidades/u_alertas.js";

export class fetchUsuario
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Enviar solicitud para cargar el total de usuarios a paginar
     * @returns array de Usuarios
     */
    static async obtenerUsuariosAPaginarDelBackend(pagina) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=obtenerUsuariosAPaginar&actor=admin&pagina=${pagina}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar el total de los usuarios a paginar
     * @returns entero
     */
    static async obtenerTotalPaginasUsuarioDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=obtenerTotalPaginasUsuario&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo registro en la BDD
     * @param {m_usuario|FormData} objeto 
     * @returns id del registro insertado
     */
    static async insertarUsuarioEnBDD(objeto) {
        try {
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'POST',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=insertarUsuario&actor=admin`, options);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insercion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_usuario|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarUsuarioEnBDD(objeto) {
        try {
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'POST',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            // Importante: Pasar el ID en la URL también para que el gateway lo tenga disponible
            let url = `${this.url}?ruta=usuario&accion=actualizarUsuario&actor=admin`;
            
            // Si es FormData, el idUsuario debe estar en el FormData. Si es objeto plano, agregar id a la URL
            if (!esFormData && objeto.idUsuario) {
                url += `&idUsuario=${objeto.idUsuario}`;
            }
            
            let solicitud = await fetch(url, options);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                console.error('Error en actualización:', respuesta);
                return null;
            }
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actualizacion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar a un usuario
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarUsuarioEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=deshabilitarUsuario&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar a un usuario
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarUsuarioEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=habilitarUsuario&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para eliminar a un usuario deshabilitado
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarUsuarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=eliminarUsuario&idUsuario=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    // Búsqueda y filtros combinados en uno
    static async buscarYFiltrarUsuariosEnBackend({ termino = '', rol = '', estado = '' } = {}) {
        try {
            let url = `${this.url}?ruta=usuario&accion=buscarYFiltrarUsuarios&actor=admin`;
            
            if(termino && termino.trim() !== '') {
                url += `&termino=${encodeURIComponent(termino)}`;
            }
            
            if(rol) {
                url += `&rol=${encodeURIComponent(rol)}`;
            }
            
            if(estado) {
                url += `&estado=${encodeURIComponent(estado)}`;
            }
            
            // Si no hay filtros, podrías añadir un parámetro para obtener todos
            if(!termino && !rol && !estado) {
                url += '&todos=true';
            }
            
            let solicitud = await fetch(url);
            let respuesta = await solicitud.json();
            
            console.log('Resultados búsqueda/filtro:', respuesta);
            return respuesta.estado === 'exito' ? respuesta.resultado : [];
        } catch(error) {
            Alerta.notificarError(`Error en búsqueda/filtro: ${error}`, 3000);
            return [];
        }
    }
}