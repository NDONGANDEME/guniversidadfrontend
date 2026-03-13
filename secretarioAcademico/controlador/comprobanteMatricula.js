import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class c_comprobanteMatricula {
    
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionSecretario();
    u_utiles.manejoTabla();

    // Botón volver
    $('.volver').off('click').on('click', () => {
        window.location.href = 'formularioEstudiante.html#btnComprobante';
    });
});