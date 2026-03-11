import { sesiones } from "../../public/core/sesiones.js"
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class c_index {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        // Verificamos que existe sesion
        // sesiones.verificarExistenciaSesion();
        
        // Cargar componentes importados
        this.cargarComponentes();
        
        // Inicializar eventos de las tarjetas
        this.inicializarTarjetas();
        
        // Inicializar botones de navegación
        this.inicializarNavegacion();
    }

    cargarComponentes() {
        u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
        u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
        
        // Esperar un momento para que se carguen los componentes
        setTimeout(() => {
            this.inicializarModalCierreSesion();
        }, 100);
    }

    inicializarTarjetas() {
        // Mapeo de IDs a rutas HTML
        let url = '/guniversidadfrontend/secretarioAcademico/template/html';

        const rutas = {
            'gestionPlanesEstudios': `${url}/planEstudio.html`,
            'gestionEstudiantes': `${url}/estudiante.html`,
            'gestionProfesores': `${url}/profesor.html`,
            'gestionHorarios': `${url}/horario.html`
        };

        // Agregar evento click a cada tarjeta
        Object.keys(rutas).forEach(id => {
            const tarjeta = document.getElementById(id);
            if (tarjeta) {
                tarjeta.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = rutas[id];
                });
            }
        });
    }

    inicializarNavegacion() {
        // Llamar a la función existente de u_utiles
        if (u_utiles.botonesNavegacionAdministrador) {
            u_utiles.botonesNavegacionAdministrador();
        }
        
        // Inicializar botón de cerrar sesión
        this.inicializarBotonCerrarSesion();
    }

    inicializarBotonCerrarSesion() {
        const btnCerrarSesion = document.querySelector('[data-accion="cerrar-sesion"]');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', (e) => {
                e.preventDefault();
                this.mostrarModalCierreSesion();
            });
        }
    }

    inicializarModalCierreSesion() {
        const btnCerrarSesion = document.querySelector('.cerrarSesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', (e) => {
                e.preventDefault();
                this.cerrarSesion();
            });
        }
    }

    mostrarModalCierreSesion() {
        const modalElement = document.getElementById('logoutModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    cerrarSesion() {
        // Mostrar mensaje
        this.mostrarNotificacion('Cerrando sesión...', 'warning');
        
        // Redirigir al login
        setTimeout(() => {
            window.location.href = '../login/index.html';
        }, 1000);
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = '9999';
        
        toast.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${tipo} text-white">
                    <strong class="me-auto">Panel Administrador</strong>
                    <small>ahora mismo</small>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${mensaje}
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
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