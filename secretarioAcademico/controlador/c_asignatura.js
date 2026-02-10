import { sesiones } from "../../public/core/sesiones.js"
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class c_asignatura
{

}


document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    sesiones.verificarExistenciaSesion();

    // Cargar componentes
    u_utilesSA.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utilesSA.botonesNavegacionWrapper();
    u_utilesSA.manejoTabla('#tablaAsignaturas');
});