export class u_noticias
{
    // Obtiene la foto principal de una noticia. Si no tiene fotos, usa una imagen por defecto
    static obtenerFotoPrincipal(noticia) {
        if (noticia.fotos && noticia.fotos.length > 0) return noticia.fotos[0].url;
        return "/guniversidadfrontend/public/img/IMG-20251114-WA0022-copia.jpg";
    }

    // Crea el HTML de una tarjeta de noticia
    static crearTarjetaHTML(noticia) {
        const foto = this.obtenerFotoPrincipal(noticia);
        const resumen = noticia.descripcion.length > 100 ? noticia.descripcion.substring(0, 100) + '...' : noticia.descripcion;

        return `
            <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="card h-100 shadow-sm tarjeta">
                    <img class="card-img-top imgNoticias" 
                        src="${foto}"
                        alt="${noticia.asunto}" 
                        style="height: 200px; object-fit: cover;">
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

    // Crea el HTML de un item del carousel
    static crearItemCarouselHTML(noticia, index) {
        const foto = this.obtenerFotoPrincipal(noticia);
        const activo = index === 0 ? 'active' : '';
        const resumen = noticia.descripcion.length > 100 ? noticia.descripcion.substring(0, 100) + '...' : noticia.descripcion;

        return `
            <div class="carousel-item ${activo}">
                <img src="${foto}" 
                    class="d-block img"
                    alt="${noticia.asunto}">
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

    // Crea el HTML de la vista completa de una noticia
    static crearNoticiaCompletaHTML(noticia) {
        const foto = this.obtenerFotoPrincipal(noticia);
        
        // Si hay más fotos, crear galería
        let galeria = '';
        if (noticia.fotos && noticia.fotos.length > 1) {
            let fotosHTML = '';
            for (let i = 1; i < noticia.fotos.length; i++) {
                fotosHTML += `
                    <div class="col-md-3 col-sm-4 col-6">
                        <img src="${noticia.fotos[i].url}"
                            class="img-fluid rounded" 
                            alt="Foto noticia" 
                            style="height: 150px; width: 100%; object-fit: cover;">
                    </div>
                `;
            }
            
            galeria = `
                <div class="galeria-fotos mt-5">
                    <h4 class="mb-3">Galería de imágenes</h4>
                    <div class="row g-3">
                        ${fotosHTML}
                    </div>
                </div>
            `;
        }

        return `
            <article class="noticia-completa">
                <div class="text-center mb-4">
                    <img src="${foto}" 
                        class="img-fluid rounded" 
                        alt="${noticia.asunto}" 
                        style="max-height: 500px; width: 100%; object-fit: cover;">
                </div>
                
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="display-5">${noticia.asunto}</h1>
                    <span class="badge bg-warning text-dark fs-6">${noticia.tipo}</span>
                </div>
                
                <div class="contenido-noticia fs-5 lh-lg mb-5">
                    ${noticia.descripcion}
                </div>
                
                ${galeria}
                
                <div class="mt-4">
                    <a href="noticias.html" class="btn btn-outline-warning">
                        ← Volver a noticias
                    </a>
                </div>
            </article>
        `;
    }

    // Muestra un mensaje de error en los contenedores
    static mostrarMensajeError(mensaje) {
        const contenedorTarjetas = document.getElementById('contTarjetaNoticia');
        const contenedorCarousel = document.querySelector('.carroNoticias');
        
        const htmlError = `<div class="text-center py-5"><h3 class="text-muted">${mensaje}</h3></div>`;
        
        if (contenedorTarjetas) contenedorTarjetas.innerHTML = htmlError;
        if (contenedorCarousel) contenedorCarousel.innerHTML = htmlError;
    }

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

    // Convierte datos del backend a objetos m_noticia
    static async convertirANoticias(datosBackend) {
        const noticias = [];
        
        for (const item of datosBackend) {
            const noticia = {
                idNoticia: item.id,
                asunto: item.asunto,
                descripcion: item.descripcion,
                tipo: item.tipo || 'Comunicado',
                fotos: item.fotos || []
            };
            
            noticias.push(noticia);
        }
        
        return noticias;
    }
}