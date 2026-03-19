import { sesiones } from "../../public/core/sesiones.js"
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class c_index {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        // Verificamos que existe sesion
        sesiones.verificarExistenciaSesion();
        
        // Cargar componentes importados
        this.cargarComponentes();
        
        // Inicializar botones de navegación
        this.inicializarNavegacion();
    }

    cargarComponentes() {
        u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
        u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    }

    inicializarNavegacion() {
        // Llamar a la función existente de u_utiles
        if (u_utiles.botonesNavegacionAdministrador) {
            u_utiles.botonesNavegacionAdministrador();
        }
    }

    // Método estático para inicializar desde fuera
    static iniciar() {
        return new c_index();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    c_index.iniciar();
});