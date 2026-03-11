import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class academico {
    
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionAdministrador();
    u_utiles.manejoTabla();
});