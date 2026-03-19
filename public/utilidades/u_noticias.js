// Constante para la URL base de las imágenes
const BASE_IMG_URL = '/guniversidadfrontend/public/img/';

export class u_noticias {

    // ============================================
    // MANEJO DE FOTOS (MEJORADO como en u_noticia_admin)
    // ============================================
    
    /**
     * Obtiene la URL completa de una foto, manejando diferentes formatos.
     * @param {object|string} foto - El objeto foto o el nombre del archivo.
     * @returns {string} La URL completa de la imagen.
     */
    static obtenerUrlFoto(foto) {
        console.log(foto)
        if (!foto) return null;

        // Si es un objeto, intentamos obtener la URL de diferentes maneras
        if (typeof foto === 'object' && foto !== null) {
            if (foto.url) {
                return BASE_IMG_URL + foto.url;
            }
        }

        // Si no se pudo determinar, devolvemos null
        return null;
    }

    /**
     * Obtiene la URL de la foto principal de una noticia.
     * Si no hay fotos, devuelve la imagen por defecto.
     * @param {object} noticia - El objeto noticia.
     * @returns {string} URL de la foto principal o imagen por defecto.
     */
    static obtenerFotoPrincipal(noticia) {
        // Imagen por defecto (ajusta la ruta a tu imagen por defecto real)
        const defaultImage = "/guniversidadfrontend/public/img/escudo_AAUCA.jpg"; 
        
        if (noticia.fotos && noticia.fotos.length > 0) {
            const primeraFoto = noticia.fotos[0];
            const urlFoto = this.obtenerUrlFoto(primeraFoto);
            return urlFoto || defaultImage;
        }
        
        return defaultImage;
    }

    // ============================================
    // CONVERSIÓN DE DATOS (MEJORADO como en u_noticia_admin)
    // ============================================
    
    /**
     * Convierte los datos del backend en objetos noticia estandarizados,
     * procesando las fotos para tener URLs completas.
     * @param {Array} datosBackend - Array de noticias del backend.
     * @returns {Promise<Array>} Array de noticias procesadas.
     */
    static async convertirANoticias(datosBackend) {
        if (!datosBackend || !Array.isArray(datosBackend)) return [];
        
        return datosBackend.map(item => {
            let fotosProcesadas = [];

            if (item.fotos && Array.isArray(item.fotos)) {
                fotosProcesadas = item.fotos.map(foto => {
                    // Procesar cada foto para obtener su URL completa
                    const urlCompleta = BASE_IMG_URL + foto.url;
                    
                    // Devolver un objeto estandarizado para la foto
                    if (typeof foto === 'object' && foto !== null) {
                        return {
                            ...foto,
                            url: foto.url, // Aseguramos que tenga una propiedad 'url' con la ruta completa
                            url_completa: urlCompleta
                        };
                    } else {
                        // Si era un string, devolvemos un objeto
                        return {
                            nombre: foto.url,
                            url_completa: urlCompleta
                        };
                    }
                });
            }
            
            return {
                idNoticia: item.idNoticia,
                asunto: item.asunto,
                descripcion: item.descripcion,
                tipo: item.tipo || 'Comunicado',
                fechaPublicacion: item.fechaPublicacion,
                fotos: fotosProcesadas
            };
        });
    }

    // ============================================
    // GENERACIÓN DE HTML
    // ============================================
    
    /**
     * Crea el HTML de una tarjeta de noticia.
     * @param {object} noticia - Objeto noticia.
     * @returns {string} HTML de la tarjeta.
     */
    static crearTarjetaHTML(noticia) {
        const foto = this.obtenerFotoPrincipal(noticia);
        const resumen = noticia.descripcion.length > 100 
            ? noticia.descripcion.substring(0, 100) + '...' 
            : noticia.descripcion;

        return `
            <div class="col-lg-4 col-md-6 col-sm-6 col-12 mb-2">
                <div class="card h-100 shadow-sm tarjeta">
                    <img class="card-img-top imgNoticias" 
                        src="${foto}"
                        alt="${noticia.asunto}" 
                        style="height: 200px; object-fit: cover;"
                        onerror="this.onerror=null; this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg';">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${noticia.asunto}</h5>
                        <p class="card-text flex-grow-1">${resumen}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="badge bg-warning text-dark">${noticia.tipo}</span>
                            <button class="btnLeerMasNoticias btn btn-sm btn-outline-warning"
                                    data-bs-toggle="modal" data-bs-target="#modalNoticias"
                                    data-id="${noticia.idNoticia}">
                                Leer más
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crea el HTML de un item del carousel.
     * @param {object} noticia - Objeto noticia.
     * @param {number} index - Índice para la clase 'active'.
     * @returns {string} HTML del item del carousel.
     */
    static crearItemCarouselHTML(noticia, index) {
        const foto = this.obtenerFotoPrincipal(noticia);
        const activo = index === 0 ? 'active' : '';
        const resumen = noticia.descripcion.length > 100 
            ? noticia.descripcion.substring(0, 100) + '...' 
            : noticia.descripcion;

        return `
            <div class="carousel-item ${activo}">
                <img src="${foto}" 
                    class="d-block img"
                    alt="${noticia.asunto}"
                    onerror="this.onerror=null; this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg';">
                <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-4 rounded">
                    <h3>${noticia.asunto}</h3>
                    <p>${resumen}</p>
                    <button class="btn btn-warning btnVerNoticias mt-1" 
                            data-id="${noticia.idNoticia}">
                        Ver más
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Crea el HTML de la vista completa de una noticia (para modal o página completa).
     * @param {object} noticia - Objeto noticia.
     * @returns {string} HTML de la noticia completa.
     */
    static crearNoticiaCompletaHTML(noticia) {
        const fotoPrincipal = this.obtenerFotoPrincipal(noticia);
        
        // Si hay más fotos, crear galería
        let galeria = '';
        if (noticia.fotos && noticia.fotos.length > 1) {
            let fotosHTML = '';
            // Empezamos desde 1 para omitir la foto principal (índice 0) si queremos
            for (let i = 1; i < noticia.fotos.length; i++) {
                const fotoUrl = this.obtenerUrlFoto(noticia.fotos[i]);
                if (fotoUrl) {
                    fotosHTML += `
                        <div class="col-md-3 col-sm-4 col-6 mb-3">
                            <img src="${fotoUrl}"
                                class="img-fluid rounded" 
                                alt="Foto noticia" 
                                style="height: 120px; width: 100%; object-fit: cover;"
                                onerror="this.onerror=null; this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg';">
                        </div>
                    `;
                }
            }
            
            if (fotosHTML) {
                galeria = `
                    <div class="galeria-fotos mt-5">
                        <h4 class="mb-3">Galería de imágenes</h4>
                        <div class="row g-3">
                            ${fotosHTML}
                        </div>
                    </div>
                `;
            }
        }

        return `
            <article class="noticia-completa">
                <div class="text-center mb-4">
                    <img src="${fotoPrincipal}" 
                        class="img-fluid rounded" 
                        alt="${noticia.asunto}" 
                        style="max-height: 500px; width: 100%; object-fit: cover;"
                        onerror="this.onerror=null; this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg';">
                </div>
                
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="display-5">${noticia.asunto}</h1>
                    <span class="badge bg-warning text-dark fs-6">${noticia.tipo}</span>
                </div>
                
                <div class="contenido-noticia fs-5 lh-lg mb-5" style="white-space: pre-wrap;">
                    ${noticia.descripcion}
                </div>
                
                ${galeria}
            </article>
        `;
    }

    // ============================================
    // MANEJO DE URL
    // ============================================
    
    // Obtiene el parámetro 'pagina' de la URL
    static obtenerPaginaDeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const pagina = urlParams.get('pagina');
        return pagina ? parseInt(pagina) : 1;
    }

    // Obtiene el parámetro 'id' de la URL para mostrar la noticia completa
    static obtenerIdDeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        return id ? parseInt(id) : null;
    }

    // Actualiza la URL con el número de página sin recargar la página
    static actualizarURLPagina(pagina) {
        const url = new URL(window.location);
        url.searchParams.set('pagina', pagina);
        window.history.pushState({}, '', url);
    }

    // Actualiza la URL con el ID de la noticia
    static actualizarURLId(id) {
        const url = new URL(window.location);
        url.searchParams.set('id', id);
        window.history.pushState({}, '', url);
    }

    // ============================================
    // MENSAJES DE ESTADO
    // ============================================
    
    // Muestra un mensaje de error
    static mostrarMensajeError(mensaje) {
        const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
        const contenedorCarousel = document.querySelector('.carroNoticias');
        const contenedorDetalles = document.getElementById('contDetallesNoticias');
        
        const htmlError = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3 class="text-muted">${mensaje}</h3>
            </div>
        `;
        
        if (contenedorTarjetas) contenedorTarjetas.innerHTML = htmlError;
        if (contenedorCarousel) contenedorCarousel.innerHTML = htmlError;
        if (contenedorDetalles) contenedorDetalles.innerHTML = htmlError;
    }

    // Muestra mensaje de "No hay noticias"
    static mostrarSinNoticias() {
        const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
        if (contenedorTarjetas) {
            contenedorTarjetas.innerHTML = `
                <div class="text-center py-5">
                    <i class="far fa-newspaper fa-4x text-muted mb-3"></i>
                    <h3 class="text-muted">No hay noticias disponibles</h3>
                </div>
            `;
        }
    }

    // ============================================
    // UTILIDADES
    // ============================================
    
    // Limpia el contenido del modal
    static limpiarModal() {
        const modalBody = document.querySelector('#modalNoticias .modal-body');
        if (modalBody) {
            modalBody.innerHTML = ''; // O podrías poner un placeholder
        }
    }

    // Crea los botones de paginación
    static crearBotonPaginacion(texto, pagina, deshabilitado = false, activo = false) {
        let clases = 'page-item';
        if (deshabilitado) clases += ' disabled';
        if (activo) clases += ' active';

        return `
            <li class="${clases}">
                <a class="page-link" href="#" data-pagina="${pagina}" ${deshabilitado ? 'tabindex="-1"' : ''}>
                    ${texto}
                </a>
            </li>
        `;
    }

    // Renderiza la paginación
    static renderizarPaginacion(contenedor, paginaActual, totalPaginas, callback) {
        if (!contenedor) return;

        // Si solo hay una página, no mostrar paginación
        if (totalPaginas <= 1) {
            contenedor.innerHTML = '';
            return;
        }

        let html = '<ul class="pagination justify-content-center">';

        // Botón "Anterior"
        html += this.crearBotonPaginacion('«', paginaActual - 1, paginaActual === 1);

        // Botones de números
        for (let i = 1; i <= totalPaginas; i++) {
            // Mostrar solo algunos números para no saturar
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
                html += this.crearBotonPaginacion(i, i, false, i === paginaActual);
            } else if (i === paginaActual - 3 || i === paginaActual + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Botón "Siguiente"
        html += this.crearBotonPaginacion('»', paginaActual + 1, paginaActual === totalPaginas);

        html += '</ul>';
        
        contenedor.innerHTML = html;

        // Agregar eventos a los botones
        contenedor.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.closest('.disabled')) return;
                
                const nuevaPagina = parseInt(link.dataset.pagina);
                if (!isNaN(nuevaPagina) && callback) {
                    callback(nuevaPagina);
                }
            });
        });
    }
}