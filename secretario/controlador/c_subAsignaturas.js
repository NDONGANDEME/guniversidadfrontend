import { sesiones } from "../../public/core/sesiones.js"
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class subAsignaturas
{
   
}



document.addEventListener('DOMContentLoaded', function()
{
    // verificamos que existe sesion
    sesiones.verificarExistenciaSesion();

    u_utilesSA.cargarArchivosImportadosHTML('Sidebar', '.importandoSidebar');

    u_utilesSA.cargarArchivosImportadosHTML('Navbar', '.importandoNavbar');

    u_utilesSA.botonesNavegacionWrapper();

    u_utilesSA.manejoTabla('#tablaAsignaturas');

    u_utilesSA.manejoTabla('#tablaAsignaturasAsignadas');

    subAsignaturas.cargarDatosEstaticos();
    
    subAsignaturas.manejarEventos();
});