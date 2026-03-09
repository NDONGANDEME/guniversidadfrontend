import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchFormacion
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar la formacion de un profesor en especifico
     * @param {Integer} idProfesor 
     * @returns formacion del profesor pasado como parametro
     */
    static async obtenerFormacionPorProfesorDelBackend(idProfesor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=formacion&accion=obtenerFormacionPorProfesor&actor=secretario&valor=${idProfesor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFormacion]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva formacion en la BDD
     * @param {m_formacion|FormData} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarFormacionEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=formacion&accion=insertarFormacion&actor=secretario`, options);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insertar]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una formacion guardado en la BDD
     * @param {m_formacion|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarFormacionEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=formacion&accion=actualizarFormacion&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insertar]. ${error}`, 3000);
            return null;
        }
    }
}