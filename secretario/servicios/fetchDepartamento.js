import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchDepartamento
{
    url = '/guniversidadfrontend/public/core/endpoint.php';


    // cargar todas los departamentos de la tabla Departamento
    static async cargarTodosDepartamentosDelBackend()
    {
        try
        {
            let solicitud = await fetch(`${url}?ruta=departamento&action=obtenerDepartamentos`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 15. fetchDepartamento]');
            
            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 20. fetchDepartamento]`);
                return;
            }
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 24. fetchDepartamento]. ${error}`);
            return;
        }
    }



    // enviar el datos del nuevo departamento al backend (me retorna el nuevo ID)
    static async enviarDatosAInsertarDepartamentoAlBackend(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=departamento&action=insertarDepartamento`,
                {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 43. fetchDepartamento]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 48. fetchDepartamento]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 52. fetchDepartamento]. ${error}`);
            return;
        }
    }



    // enviar el datos para actualizar el departamento en el backend
    static async enviarDatosAActualizarDepartamentoAlBackend(objeto)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=departamento&action=actualizarDepartamento`,
                {
                    method:'PUT',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(objeto)
                }
            );

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 71. fetchDepartamento]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 76. fetchDepartamento]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 80. fetchDepartamento]. ${error}`);
            return;
        }
    }



    // enviar el dato para desbilitar el departamento en el backend
    static async enviarDatoADeshabilitarDepartamentoAlBackend(id)
    {
        try {
            let solicitud = await fetch(`${url}?ruta=departamento&action=deshabilitarFacultad&valor=${id}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 93. fetchDepartamento]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.dato;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 98. fetchDepartamento]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 102. fetchDepartamento]. ${error}`);
            return;
        }
    }
}