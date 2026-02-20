import { m_foto } from "../modelo/m_foto.js";
import { m_noticia } from "../modelo/m_noticia.js";
import { u_noticias } from "../utilidades/u_noticias.js";
import { u_utiles } from "../utilidades/u_utiles.js";

export class c_noticia {
    static noticiasCarousel = [];
    static paginaActual = 1;

    // INICIALIZACIÓN - Solo para la página de inicio
    static async inicializarInicio() {
        try {
            await this.cargarCarousel();
            this.inicializarEventos();
        } catch (error) {
            console.error('Error al inicializar:', error);
            u_noticias.mostrarMensajeError('Error al cargar las noticias');
        }
    }

    // CARGA LAS NOTICIAS PARA EL CAROUSEL
    static async cargarCarousel() {
        const contenedorCarousel = document.querySelector('.carroNoticias');
        
        if (!contenedorCarousel) return;

        try {
            const datosCarousel = await m_noticia.obtenerNoticiasRecientes(); // obtenemos la noticia
            console.log(datosCarousel)
            // Verificar si hay noticias
            if (!datosCarousel || datosCarousel.length === 0) {
                contenedorCarousel.innerHTML = '<div class="text-center py-5"><h3>No hay noticias</h3></div>';
                return;
            }
            
            this.noticiasCarousel = await u_noticias.convertirANoticias(datosCarousel); // Convertir a objetos noticia
            
            // Cargar fotos para cada noticia
            for (const noticia of this.noticiasCarousel) {
                const fotos = await m_foto.obtenerFotosPorNoticia(noticia.idNoticia);
                noticia.fotos = fotos || [];
            }

            // Renderizar el carousel
            this.renderizarCarousel();

        } catch (error) {
            console.error('Error cargando carousel:', error);
            contenedorCarousel.innerHTML = '<div class="text-center text-white py-5"><h3>Error al cargar noticias</h3></div>';
        }
    }

    // RENDERIZA EL CAROUSEL
    static renderizarCarousel() {
        const contenedor = document.querySelector('.carroNoticias');
        
        if (!contenedor || this.noticiasCarousel.length === 0) return;

        // Limpiar contenedor
        contenedor.innerHTML = '';

        // Crear cada item del carousel
        for (let i = 0; i < this.noticiasCarousel.length; i++) {
            const noticia = this.noticiasCarousel[i];
            const html = u_noticias.crearItemCarouselHTML(noticia, i);
            contenedor.innerHTML += html;
        }
    }

    // INICIALIZA LOS EVENTOS DE LOS BOTONES DEL CAROUSEL
    static inicializarEventos() {
        // Evento para botones "Ver más" del carousel
        document.addEventListener('click', (e) => {
            // Botón de ver noticia
            if (e.target.classList.contains('btnVerNoticias')) {
                const id = e.target.getAttribute('data-id');
                if (id) {
                    u_utiles.redirigirA(null, `/guniversidadfrontend/public/template/html/noticias.html?id=${id}`);
                }
            }
        });
    }


    // ============================================
    // PARTE DE NOTICIAS Y PAGINACIÓN
    // ============================================

    // INICIALIZA LA PÁGINA DE NOTICIAS
    static async inicializarNoticias() {
        try {
            // Verificar si estamos en la página de noticias
            const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
            if (!contenedorTarjetas) return;

            const idNoticia = u_noticias.obtenerIdDeURL(); // Verificar si hay un ID en la URL (noticia específica)
            
            if (idNoticia) {
                await this.cargarNoticiaPorId(idNoticia); // Mostrar una noticia específica
            } else {
                await this.cargarListaNoticias(); // Mostrar todas las noticias con paginación
            }

            this.inicializarEventosNoticias();

        } catch (error) {
            console.error('Error al inicializar noticias:', error);
            u_noticias.mostrarMensajeError('Error al cargar las noticias');
        }
    }

    // CARGA LA LISTA DE NOTICIAS CON PAGINACIÓN
    static async cargarListaNoticias() {
        try {
            //this.paginaActual = u_noticias.obtenerPaginaDeURL(); // Obtener la página actual de la URL

            // Obtener las noticias de la página actual desde el backend
            const datosBackend = await m_noticia.obtenerNoticiasPorComunicado();
            
            // Verificar si hay noticias
            if (!datosBackend || datosBackend.length == 0) {
                this.mostrarSinNoticias();
                return;
            }

            this.totalPaginas = await m_noticia.obtenerCantidadPaginacion(); // Guardar el total de páginas

            const noticiasPagina = await u_noticias.convertirANoticias(datosBackend); // Convertir los datos a objetos noticia

            // Cargar las fotos de cada noticia
            for (const noticia of noticiasPagina) {
                const fotos = await m_foto.obtenerFotosPorNoticia(noticia.idNoticia);
                noticia.fotos = fotos || [];
            }

            this.renderizarTarjetas(noticiasPagina);
            this.renderizarPaginacion();

        } catch (error) {
            console.error('Error cargando lista de noticias:', error);
            u_noticias.mostrarMensajeError('Error al cargar las noticias');
        }
    }

    // CARGA UNA NOTICIA ESPECÍFICA POR SU ID
    static async cargarNoticiaPorId(id) {
        try {
            const datosNoticia = await m_noticia.obtenerNoticiaById(id); // Obtener la noticia del backend
            
            if (!datosNoticia) {
                this.mostrarNoticiaNoEncontrada();
                return;
            }

            const noticia = (await u_noticias.convertirANoticias([datosNoticia]))[0]; // Convertir a objeto noticia

            // Cargar sus fotos
            const fotos = await m_foto.obtenerFotosPorNoticia(id);
            noticia.fotos = fotos || [];

            this.mostrarNoticiaCompleta(noticia); // Mostrar la noticia completa (oculta las tarjetas)

        } catch (error) {
            console.error('Error cargando noticia por ID:', error);
            this.mostrarNoticiaNoEncontrada();
        }
    }

    // MUESTRA LA NOTICIA COMPLETA (oculta las tarjetas)
    static mostrarNoticiaCompleta(noticia) {
        // Ocultar el contenedor de tarjetas y paginación
        const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
        const contenedorPaginacion = document.getElementById('contPaginacion');
        const contenedorDetalle = document.getElementById('contDetallesNoticias');

        if (contenedorTarjetas) contenedorTarjetas.style.display = 'none';
        if (contenedorPaginacion) contenedorPaginacion.style.display = 'none';
        
        // Mostrar el detalle de la noticia
        if (contenedorDetalle) {
            contenedorDetalle.style.display = 'block';
            contenedorDetalle.innerHTML = u_noticias.crearNoticiaCompletaHTML(noticia);
        }
    }

    // RENDERIZA LAS TARJETAS DE NOTICIAS
    static renderizarTarjetas(noticias) {
        const contenedor = document.getElementById('contTarjetaNoticia');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        const fila = document.createElement('div');
        fila.className = 'row g-4';

        for (const noticia of noticias) {
            fila.innerHTML += u_noticias.crearTarjetaHTML(noticia);
        }

        contenedor.appendChild(fila);
    }

    // RENDERIZA LOS BOTONES DE PAGINACIÓN
    static renderizarPaginacion() {
        const contenedor = document.getElementById('contPaginacion');
        if (!contenedor) return;

        // Si solo hay una página, no mostrar paginación
        if (this.totalPaginas <= 1) {
            contenedor.innerHTML = '';
            return;
        }

        contenedor.innerHTML = '';

        // Crear lista de paginación
        const ul = document.createElement('ul');
        ul.className = 'pagination justify-content-center';

        ul.innerHTML += this.crearBotonPaginacion('Anterior', this.paginaActual - 1, this.paginaActual === 1); // Botón "Anterior"

        // 2. Botones de números
        for (let i = 1; i <= this.totalPaginas; i++) {
            // Mostrar solo algunos números para no saturar
            if (i === 1 || i === this.totalPaginas || (i >= this.paginaActual - 2 && i <= this.paginaActual + 2)) {
                ul.innerHTML += this.crearBotonPaginacion(i, i, false, i === this.paginaActual);
            }

            // Agregar "..." cuando hay saltos
            else if (i === this.paginaActual - 3 || i === this.paginaActual + 3) {
                ul.innerHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        ul.innerHTML += this.crearBotonPaginacion('Siguiente', this.paginaActual + 1, this.paginaActual === this.totalPaginas); // Botón "Siguiente"

        contenedor.appendChild(ul);
    }

    // CREA UN BOTÓN DE PAGINACIÓN
    static crearBotonPaginacion(texto, pagina, deshabilitado = false, activo = false) {
        let clases = 'page-item';
        if (deshabilitado) clases += ' disabled';
        if (activo) clases += ' active';

        return `
            <li class="${clases}">
                <a class="page-link" data-pagina="${pagina}" ${deshabilitado ? 'tabindex="-1"' : ''}>
                    ${texto}
                </a>
            </li>
        `;
    }

    // CAMBIA A UNA NUEVA PÁGINA
    static async cambiarPagina(nuevaPagina) {
        // Validar que la página sea válida
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas || nuevaPagina === this.paginaActual) return;

        u_noticias.actualizarURLPagina(nuevaPagina); // Actualizar la URL

        this.paginaActual = nuevaPagina; // Actualizar la página actual

        await this.cargarListaNoticias(); // Recargar las noticias

        // Hacer scroll hacia arriba suavemente
        const contenedor = document.getElementById('contTarjetaNoticia');
        if (contenedor) contenedor.scrollIntoView({ behavior: 'smooth' });
    }

    // MUESTRA MENSAJE DE "SIN NOTICIAS"
    static mostrarSinNoticias() {
        const contenedor = document.getElementById('contTarjetaNoticia');
        if (contenedor) {
            contenedor.innerHTML = '<div class="text-center py-5"><h3 class="text-muted">No hay noticias disponibles</h3></div>';
        }
    }

    // MUESTRA MENSAJE DE "NOTICIA NO ENCONTRADA"
    static mostrarNoticiaNoEncontrada() {
        const contenedor = document.getElementById('contDetallesNoticias');
        if (contenedor) {
            contenedor.style.display = 'block';
            contenedor.innerHTML = `
                <div class="alert alert-warning text-center py-5">
                    <h3>Noticia no encontrada</h3>
                    <p class="mt-3">La noticia que buscas no existe o ha sido eliminada.</p>
                    <a href="noticias.html" class="btn btn-warning mt-3">Volver a noticias</a>
                </div>
            `;
        }
    }

    // INICIALIZA LOS EVENTOS DE LA PÁGINA DE NOTICIAS
    static inicializarEventosNoticias() {
        // Evento para los botones de "Leer más"
        /*document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btnLeerMasNoticias')) {
                e.preventDefault();
                const id = e.target.getAttribute('data-id');
                if (id) { 
                    u_utiles.redirigirA(null, `/guniversidadfrontend/public/template/html/noticias.html?id=${id}`);
                }
            }
        });*/

        // Evento para los botones de paginación
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.page-link');
            if (!link) return;
            
            e.preventDefault();
            
            if (link.closest('.disabled')) return; // Verificar si está deshabilitado
            
            const nuevaPagina = parseInt(link.getAttribute('data-pagina'));
            if (!isNaN(nuevaPagina)) this.cambiarPagina(nuevaPagina);
        });

        // Evento para el botón "Volver a noticias" (cuando se ve una noticia)
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'noticias.html') {
                e.preventDefault();
                
                // Restaurar la vista de tarjetas
                const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
                const contenedorPaginacion = document.getElementById('contPaginacion');
                const contenedorDetalle = document.getElementById('contDetallesNoticias');
                
                if (contenedorTarjetas) contenedorTarjetas.style.display = 'block';
                if (contenedorPaginacion) contenedorPaginacion.style.display = 'flex';
                if (contenedorDetalle) contenedorDetalle.style.display = 'none';
                
                // Volver a la página de noticias sin ID
                window.history.pushState({}, '', '/guniversidadfrontend/public/template/html/noticias.html');
            }
        });

        // Evento para cuando el usuario usa los botones de navegación del navegador
        window.addEventListener('popstate', () => {
            const idNoticia = u_noticias.obtenerIdDeURL();
            
            if (idNoticia) {
                this.cargarNoticiaPorId(idNoticia);
            } else {
                const contenedorDetalle = document.getElementById('contDetallesNoticias');
                const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
                const contenedorPaginacion = document.getElementById('contPaginacion');
                
                if (contenedorDetalle) contenedorDetalle.style.display = 'none';
                if (contenedorTarjetas) contenedorTarjetas.style.display = 'block';
                if (contenedorPaginacion) contenedorPaginacion.style.display = 'flex';
                
                this.cargarListaNoticias();
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function()
{
    u_utiles.existenciaContenedorImportacion();
    u_utiles.botonesNavegacion();
    c_noticia.inicializarNoticias();
});