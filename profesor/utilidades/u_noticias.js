export class u_noticia_profesor {
    
    // ========== OBTENER FOTO PRINCIPAL ==========
    static obtenerFotoPrincipal(noticia) {
        if (noticia.fotos && noticia.fotos.length > 0) {
            return noticia.fotos[0].url;
        }
        return "/guniversidadfrontend/public/img/IMG-20251114-WA0022-copia.jpg";
    }

    // ========== GENERAR HTML PARA TARJETAS ==========
    static crearTarjetaNoticiaHTML(noticia) {
        // Obtener la primera foto si existe
        const foto = this.obtenerFotoPrincipal(noticia);
        
        // Formatear fecha
        const fecha = noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion).toLocaleDateString() : 'Fecha desconocida';
        
        // Resumen de la descripción
        const resumen = noticia.descripcion.length > 100 
            ? noticia.descripcion.substring(0, 100) + '...' 
            : noticia.descripcion;

        // Determinar el color del badge según el tipo
        let badgeClass = 'bg-warning text-dark';
        if (noticia.tipo === 'Interna') {
            badgeClass = 'bg-info text-white';
        }

        return `
            <div class="col-lg-4 col-md-6 col-sm-6 col-12 mb-4">
                <div class="card h-100 shadow-sm noticia-card" data-id="${noticia.idNoticia}">
                    <img class="card-img-top imgNoticias" 
                        src="${foto}"
                        alt="${noticia.asunto}" 
                        style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${noticia.asunto}</h5>
                        <p class="card-text text-muted small">${fecha}</p>
                        <p class="card-text flex-grow-1">${resumen}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="badge ${badgeClass}">${noticia.tipo}</span>
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

    // ========== RENDERIZAR TARJETAS ==========
    static renderizarTarjetas(noticias, contenedorId = '#tarjetasNoticiasRow') {
        const contenedor = $(contenedorId);
        contenedor.empty();
        
        if (!noticias || noticias.length === 0) {
            contenedor.html(`
                <div class="col-12 text-center py-5">
                    <i class="far fa-newspaper fa-4x text-muted mb-3"></i>
                    <h3 class="text-muted">No hay noticias disponibles</h3>
                </div>
            `);
            return;
        }

        noticias.forEach(noticia => {
            contenedor.append(this.crearTarjetaNoticiaHTML(noticia));
        });
    }

    // ========== PAGINACIÓN ==========
    static renderizarPaginacion(paginaActual, totalPaginas, callback, contenedorId = '#contPaginacion') {
        const contenedor = $(contenedorId);
        
        if (totalPaginas <= 1) {
            contenedor.empty();
            return;
        }

        let html = '<ul class="pagination justify-content-center">';

        // Botón anterior
        html += this.crearBotonPaginacion('«', paginaActual - 1, paginaActual === 1);

        // Botones de números
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
                html += this.crearBotonPaginacion(i, i, false, i === paginaActual);
            } else if (i === paginaActual - 3 || i === paginaActual + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Botón siguiente
        html += this.crearBotonPaginacion('»', paginaActual + 1, paginaActual === totalPaginas);

        html += '</ul>';
        
        contenedor.html(html);

        // Agregar eventos
        contenedor.find('.page-link').on('click', function(e) {
            e.preventDefault();
            if ($(this).closest('.disabled').length) return;
            
            const nuevaPagina = parseInt($(this).data('pagina'));
            if (!isNaN(nuevaPagina) && callback) {
                callback(nuevaPagina);
            }
        });
    }

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

    // ========== NOTICIA COMPLETA PARA MODAL ==========
    static crearNoticiaCompletaHTML(noticia) {
        const foto = this.obtenerFotoPrincipal(noticia);
        
        // Formatear fecha
        const fecha = noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion).toLocaleDateString() : 'Fecha desconocida';
        
        // Determinar el color del badge según el tipo
        let badgeClass = 'bg-warning text-dark';
        if (noticia.tipo === 'Interna') {
            badgeClass = 'bg-info text-white';
        }

        // Si hay más fotos, crear galería
        let galeria = '';
        if (noticia.fotos && noticia.fotos.length > 1) {
            let fotosHTML = '';
            for (let i = 1; i < noticia.fotos.length; i++) {
                fotosHTML += `
                    <div class="col-md-3 col-sm-4 col-6 mb-3">
                        <img src="${noticia.fotos[i].url}"
                            class="img-fluid rounded" 
                            alt="Foto noticia" 
                            style="height: 150px; width: 100%; object-fit: cover;">
                    </div>
                `;
            }
            
            galeria = `
                <div class="galeria-fotos mt-5">
                    <h5 class="mb-3 border-bottom pb-2">Galería de imágenes</h5>
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
                        style="max-height: 400px; width: 100%; object-fit: cover;">
                </div>
                
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h4 mb-0">${noticia.asunto}</h2>
                    <span class="badge ${badgeClass} fs-6">${noticia.tipo}</span>
                </div>
                
                <div class="text-muted small mb-3">
                    <i class="far fa-calendar-alt me-1"></i> ${fecha}
                </div>
                
                <div class="contenido-noticia fs-6 lh-lg mb-4" style="white-space: pre-line;">
                    ${noticia.descripcion}
                </div>
                
                ${galeria}
            </article>
        `;
    }

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#tituloNoticiaDetalle').html('');
        $('#contenidoNoticiadetalle').html('');
    }

    // ========== CONVERTIR DATOS DEL BACKEND ==========
    static async convertirANoticias(datosBackend) {
        if (!datosBackend || !Array.isArray(datosBackend)) return [];
        
        return datosBackend.map(item => ({
            idNoticia: item.idNoticia || item.id,
            asunto: item.asunto,
            descripcion: item.descripcion,
            tipo: item.tipo || 'Comunicado',
            fechaPublicacion: item.fechaPublicacion,
            fotos: item.fotos || []
        }));
    }

    // ========== MOSTRAR MENSAJE DE ERROR ==========
    static mostrarMensajeError(mensaje) {
        const contenedorTarjetas = $('#tarjetasNoticiasRow');
        contenedorTarjetas.html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3 class="text-muted">${mensaje}</h3>
            </div>
        `);
    }
}