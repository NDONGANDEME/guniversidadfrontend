// c_noticia.js - Controlador para la parte pública de noticias
import { m_noticia } from "../modelo/m_noticia.js";
import { u_noticias } from "../utilidades/u_noticias.js";
import { u_utiles } from "../utilidades/u_utiles.js";
import { Alerta } from "../utilidades/u_alertas.js";

export class c_noticia {
    constructor() {
        this.noticiasCarousel = [];
        this.noticiasLista = [];
        this.paginaActual = 1;
        this.totalPaginas = 1;
        this.actor = null;
        this.modalInstance = null;
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    // Inicializa la página de inicio (con carousel)
    async inicializarInicio() {
        try {
            await this.cargarCarousel();
            this.inicializarEventosComunes();
        } catch (error) {
            Alerta.notificarError(`Error al inicializar inicio: ${error}`, 1500);
            u_noticias.mostrarMensajeError('Error al cargar las noticias');
        }
    }

    // Inicializa la página de noticias (con listado y paginación)
    async inicializarNoticias() {
        try {
            // Verificar si estamos en la página de noticias
            const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
            if (!contenedorTarjetas) return;

            // Inicializar modal de Bootstrap
            this.inicializarModal();

            const idNoticia = u_noticias.obtenerIdDeURL();
            
            if (idNoticia) {
                await this.mostrarNoticiaEnPagina(idNoticia);
            } else {
                this.paginaActual = u_noticias.obtenerPaginaDeURL();
                await this.cargarListaNoticias();
            }

            this.inicializarEventosNoticias();
            this.inicializarEventosComunes();

        } catch (error) {
            Alerta.notificarError(`Error al inicializar noticias: ${error}`, 1500);
            u_noticias.mostrarMensajeError('Error al cargar las noticias');
        }
    }

    // Inicializa el modal de Bootstrap correctamente
    inicializarModal() {
        const modalElement = document.getElementById('modalNoticias');
        if (modalElement) {
            // Asegurarse de que bootstrap está disponible
            if (typeof bootstrap !== 'undefined') {
                this.modalInstance = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true
                });
            }
        }
    }

    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    // Carga las noticias para el carousel
    async cargarCarousel() {
        const contenedorCarousel = document.querySelector('.carroNoticias');
        
        if (!contenedorCarousel) return;

        try {
            const datosCarousel = await m_noticia.obtenerNoticiasRecientes();
            
            if (!datosCarousel || datosCarousel.length === 0) {
                contenedorCarousel.innerHTML = '<div class="text-center text-white py-5"><h3>No hay noticias</h3></div>';
                return;
            }
            
            this.noticiasCarousel = await u_noticias.convertirANoticias(datosCarousel);

            // Renderizar el carousel
            this.renderizarCarousel();

        } catch (error) {
            Alerta.notificarError(`Error cargando carousel: ${error}`, 1500);
            contenedorCarousel.innerHTML = '<div class="text-center text-white py-5"><h3>Error al cargar noticias</h3></div>';
        }
    }

    // Carga la lista de noticias con paginación
    async cargarListaNoticias() {
        try {
            // Obtener todas las noticias de tipo comunicado
            const datosBackend = await m_noticia.obtenerNoticiasPorComunicado();
            
            if (!datosBackend || datosBackend.length === 0) {
                u_noticias.mostrarSinNoticias();
                return;
            }

            // Convertir a objetos noticia
            const todasNoticias = await u_noticias.convertirANoticias(datosBackend);

            // Calcular total de páginas (simulado - ajusta según tu backend)
            this.totalPaginas = await m_noticia.obtenerTotalPaginas();

            // Filtrar noticias de la página actual
            const noticiasPorPagina = 9; // 3 filas de 3 columnas
            const inicio = (this.paginaActual - 1) * noticiasPorPagina;
            const fin = inicio + noticiasPorPagina;
            this.noticiasLista = todasNoticias.slice(inicio, fin);

            this.renderizarTarjetas();
            this.renderizarPaginacion();

        } catch (error) {
            Alerta.notificarError(`Error cargando lista de noticias: ${error}`, 1500);
            u_noticias.mostrarMensajeError('Error al cargar las noticias');
        }
    }

    // Carga una noticia específica para el modal
    async cargarNoticiaParaModal(id) {
        try {
            const datosNoticia = await m_noticia.obtenerNoticiaPorId(id);
            
            if (!datosNoticia) {
                u_noticias.mostrarMensajeError('Noticia no encontrada');
                return null;
            }

            const noticiasArray = await u_noticias.convertirANoticias([datosNoticia]);
            return noticiasArray[0];

        } catch (error) {
            Alerta.notificarError(`Error cargando noticia: ${error}`, 1500);
            return null;
        }
    }

    // Muestra una noticia completa en la página (reemplaza las tarjetas)
    async mostrarNoticiaEnPagina(id) {
        const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
        const contenedorPaginacion = document.getElementById('contPaginacion');
        const contenedorDetalles = document.getElementById('contDetallesNoticias');

        if (!contenedorDetalles) return;

        try {
            const datosNoticia = await m_noticia.obtenerNoticiaPorId(id);
            
            if (!datosNoticia) {
                contenedorDetalles.innerHTML = `
                    <div class="alert alert-warning text-center py-5">
                        <h3>Noticia no encontrada</h3>
                        <a href="noticias.html" class="btn btn-warning mt-3">Volver a noticias</a>
                    </div>
                `;
                return;
            }

            const noticiasArray = await u_noticias.convertirANoticias([datosNoticia]);
            const noticia = noticiasArray[0];

            // Ocultar tarjetas y paginación, mostrar detalles
            if (contenedorTarjetas) contenedorTarjetas.style.display = 'none';
            if (contenedorPaginacion) contenedorPaginacion.style.display = 'none';
            
            contenedorDetalles.style.display = 'block';
            contenedorDetalles.innerHTML = u_noticias.crearNoticiaCompletaHTML(noticia);

        } catch (error) {
            Alerta.notificarError(`Error mostrando noticia: ${error}`, 1500);
            contenedorDetalles.innerHTML = '<div class="text-center py-5"><h3 class="text-danger">Error al cargar la noticia</h3></div>';
        }
    }

    // ============================================
    // RENDERIZADO
    // ============================================
    
    // Renderiza el carousel
    renderizarCarousel() {
        const contenedor = document.querySelector('.carroNoticias');
        
        if (!contenedor || this.noticiasCarousel.length === 0) return;

        // Limpiar contenedor
        contenedor.innerHTML = '';

        // Crear cada item del carousel
        for (let i = 0; i < this.noticiasCarousel.length; i++) {
            const noticia = this.noticiasCarousel[i];
            contenedor.innerHTML += u_noticias.crearItemCarouselHTML(noticia, i);
        }
    }

    // Renderiza las tarjetas de noticias
    renderizarTarjetas() {
        const contenedor = document.getElementById('contTarjetaNoticia');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        const fila = document.createElement('div');
        fila.className = 'row';

        for (const noticia of this.noticiasLista) {
            fila.innerHTML += u_noticias.crearTarjetaHTML(noticia);
        }

        contenedor.appendChild(fila);
    }

    // Renderiza la paginación
    renderizarPaginacion() {
        const contenedor = document.getElementById('contPaginacion');
        if (!contenedor) return;

        u_noticias.renderizarPaginacion(
            contenedor, 
            this.paginaActual, 
            this.totalPaginas, 
            (nuevaPagina) => this.cambiarPagina(nuevaPagina)
        );
    }

    // ============================================
    // EVENTOS
    // ============================================
    
    // Inicializa eventos comunes a ambas páginas
    inicializarEventosComunes() {
        // Evento para botones "Ver más" del carousel
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btnVerNoticias')) {
                const id = e.target.getAttribute('data-id');
                if (id) {
                    u_utiles.redirigirA(null, `/guniversidadfrontend/public/template/html/noticias.html?id=${id}`);
                }
            }
        });
    }

    // Inicializa eventos específicos de la página de noticias
    inicializarEventosNoticias() {
        // Evento para botones "Leer más" (abren modal)
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btnLeerMasNoticias')) {
                e.preventDefault();
                e.stopPropagation(); // Evitar propagación
                
                const id = e.target.getAttribute('data-id');
                
                if (id) {
                    await this.abrirModalNoticia(id);
                }
            }
        });

        // Evento para cerrar modal y limpiar contenido
        const modal = document.getElementById('modalNoticias');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => u_noticias.limpiarModal());
        }

        // Evento para botón de cerrar manual
        const cerrarBtn = document.getElementById('cerrarModal');
        if (cerrarBtn) {
            cerrarBtn.addEventListener('click', () => {
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
            });
        }

        // Evento para botón "Volver a noticias" (cuando se ve una noticia completa)
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'noticias.html') {
                e.preventDefault();
                
                // Restaurar la vista de tarjetas
                const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
                const contenedorPaginacion = document.getElementById('contPaginacion');
                const contenedorDetalle = document.getElementById('contDetallesNoticias');
                
                if (contenedorTarjetas) {
                    contenedorTarjetas.style.display = 'block';
                    contenedorTarjetas.innerHTML = '';
                }
                if (contenedorPaginacion) contenedorPaginacion.style.display = 'flex';
                if (contenedorDetalle) contenedorDetalle.style.display = 'none';
                
                // Volver a cargar la lista
                this.paginaActual = 1;
                this.cargarListaNoticias();
                
                // Actualizar URL
                window.history.pushState({}, '', '/guniversidadfrontend/public/template/html/noticias.html');
            }
        });

        // Evento para navegación del navegador
        window.addEventListener('popstate', () => {
            const idNoticia = u_noticias.obtenerIdDeURL();
            
            if (idNoticia) {
                this.mostrarNoticiaEnPagina(idNoticia);
            } else {
                const contenedorDetalle = document.getElementById('contDetallesNoticias');
                const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
                const contenedorPaginacion = document.getElementById('contPaginacion');
                
                if (contenedorDetalle) contenedorDetalle.style.display = 'none';
                if (contenedorTarjetas) {
                    contenedorTarjetas.style.display = 'block';
                    contenedorTarjetas.innerHTML = '';
                }
                if (contenedorPaginacion) contenedorPaginacion.style.display = 'flex';
                
                this.paginaActual = u_noticias.obtenerPaginaDeURL();
                this.cargarListaNoticias();
            }
        });
    }

    // ============================================
    // ACCIONES
    // ============================================
    
    // Abre el modal con la noticia seleccionada
    async abrirModalNoticia(id) {
        try {
            const noticia = await this.cargarNoticiaParaModal(id);
            
            if (noticia) {
                // Mostrar los datos en el modal
                document.getElementById('tituloNoticiaDetalle').innerHTML = noticia.asunto;
                document.getElementById('contenidoNoticiadetalle').innerHTML = noticia.descripcion;
                
                // Abrir el modal
                if (this.modalInstance) {
                    this.modalInstance.show();
                } else {
                    this.inicializarModal();
                    if (this.modalInstance) {
                        this.modalInstance.show();
                    }
                }
            } else {
                u_noticias.mostrarMensajeError('No se pudo cargar la noticia');
            }
        } catch (error) {
            Alerta.notificarError(`Error abriendo modal: ${error}`, 1500);
            u_noticias.mostrarMensajeError('Error al cargar la noticia');
        }
    }

    // Cambia a una nueva página
    async cambiarPagina(nuevaPagina) {
        // Validar que la página sea válida
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas || nuevaPagina === this.paginaActual) return;

        u_noticias.actualizarURLPagina(nuevaPagina); // Actualizar la URL

        this.paginaActual = nuevaPagina; // Actualizar la página actual

        await this.cargarListaNoticias(); // Recargar las noticias

        // Hacer scroll hacia arriba suavemente
        const contenedor = document.getElementById('contTarjetaNoticia');
        if (contenedor) contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// INICIALIZACIÓN SEGÚN LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar componentes comunes
    u_utiles.existenciaContenedorImportacion();
    u_utiles.botonesNavegacion();

    // Determinar qué página estamos
    const esInicio = document.querySelector('.carroNoticias') !== null;
    const esNoticias = document.getElementById('contTarjetaNoticia') !== null;

    const controlador = new c_noticia();

    if (esInicio) {
        await controlador.inicializarInicio();
    } else if (esNoticias) {
        await controlador.inicializarNoticias();
    }
});