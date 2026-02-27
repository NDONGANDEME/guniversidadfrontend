import { sesiones } from "../../public/core/sesiones.js"
import { u_utiles } from "../../public/utilidades/u_utiles.js";

document.addEventListener('DOMContentLoaded', function()
{
    // verificamos que existe sesion
    //sesiones.verificarExistenciaSesion();
    u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionSecretario();
    u_utiles.manejoTabla();
});