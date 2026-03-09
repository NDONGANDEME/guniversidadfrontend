import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchProfesor
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los profesores de la BDD
     * @returns array de profesores
     */
    static async obtenerProfesoresPorFacultadDelBackend(idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=obtenerProfesoresPorFacultad&actor=secretario&idFacultad=${idFacultad}`);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchProfesor]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para listar los profesores de la BDD
     * @returns array de profesores
     */
    static async obtenerProfesoresPorDepartamentoDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=obtenerProfesoresPorDepartamento&actor=secretario`);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchProfesor]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo profesor en la BDD
     * @param {m_profesor|FormData} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarProfesorEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=insertarProfesor&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insercion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un profesor guardado en la BDD
     * @param {m_profesor|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarProfesorEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=actualizarProfesor&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actuaizar]. ${error}`, 3000);
            return null;
        }
    }
}