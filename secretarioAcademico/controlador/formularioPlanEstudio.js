import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class formularioPlanEstudio {
    
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionSecretario();
    u_utiles.manejoTabla();
});