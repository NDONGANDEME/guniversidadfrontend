import { sesiones } from "../../public/core/sesiones.js"
import { u_utilesSA } from "../utilidades/u_utilesSA.js";


export class subEstudiente
{
    
}




document.addEventListener('DOMContentLoaded', function()
{
    // verificamos que existe sesion
    sesiones.verificarExistenciaSesion();

    u_utilesSA.cargarArchivosImportadosHTML('Sidebar', '.importandoSidebar');

    u_utilesSA.cargarArchivosImportadosHTML('Navbar', '.importandoNavbar');

    u_utilesSA.botonesNavegacionWrapper();
});