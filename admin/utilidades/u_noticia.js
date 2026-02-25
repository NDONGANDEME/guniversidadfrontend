import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_noticia_admin {
    
    // ========== VALIDACIONES ==========
    static validarAsunto(valor) {
        return valor.length >= 5; // Mínimo 5 caracteres
    }
    
    static validarDescripcion(valor) {
        return valor.length >= 20; // Mínimo 20 caracteres para la descripción
    }
    
    static validarTipo(valor) {
        return valor && valor !== 'Ninguno';
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del asunto
        $('#asuntoNoticia').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_noticia_admin.validarAsunto(valor);
            u_utiles.colorearCampo(valido, '#asuntoNoticia', '#errorAsuntoNoticia', 'Mínimo 5 caracteres');
        });

        // Validación de la descripción
        $('#descripcionNoticia').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_noticia_admin.validarDescripcion(valor);
            u_utiles.colorearCampo(valido, '#descripcionNoticia', '#errorDescripcionNoticia', 'Mínimo 20 caracteres');
        });

        // Validación del tipo
        $('#tipoNoticia').on('change', function() {
            const valor = $(this).val();
            const valido = u_noticia_admin.validarTipo(valor);
            u_utiles.colorearCampo(valido, '#tipoNoticia', '#errorTipoNoticia', 'Seleccione un tipo');
            
            // Mostrar descripción del tipo seleccionado
            u_noticia_admin.mostrarDescripcionTipo(valor);
        });
    }

    // ========== DESCRIPCIÓN DE TIPOS ==========
    static mostrarDescripcionTipo(tipo) {
        const descripcionDiv = $('#descripcionTipo');
        
        switch(tipo) {
            case 'Comunicado':
                descripcionDiv.text('Visible para todo el público');
                break;
            case 'Interna':
                descripcionDiv.text('Visible solo para miembros de la misma facultad');
                break;
            case 'Departamento':
                descripcionDiv.text('Visible solo para miembros del departamento');
                break;
            default:
                descripcionDiv.text('');
        }
    }

    // ========== MANEJO DE ARCHIVOS ==========
    static archivosSeleccionados = [];

    static configurarSubidaArchivos() {
        // Al hacer clic en el área de drop, abrir selector
        $('#fileDropArea').on('click', function() {
            $('#campoArchivoFoto').click();
        });

        // Eventos de arrastrar y soltar
        $('#fileDropArea').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('drag-over border-success');
        });

        $('#fileDropArea').on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over border-success');
        });

        $('#fileDropArea').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over border-success');
            
            const archivos = e.originalEvent.dataTransfer.files;
            u_noticia_admin.procesarArchivos(archivos);
        });

        // Cuando se seleccionan archivos con el input
        $('#campoArchivoFoto').on('change', function(e) {
            const archivos = e.target.files;
            u_noticia_admin.procesarArchivos(archivos);
        });

        // Botón limpiar archivos
        $('#btnLimpiarArchivos').on('click', function() {
            u_noticia_admin.limpiarArchivos();
        });
    }

    static procesarArchivos(archivos) {
        if (!archivos || archivos.length === 0) return;

        // Validar formato
        const formatosPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];
        
        for (let archivo of archivos) {
            if (!formatosPermitidos.includes(archivo.type)) {
                alert(`Formato no permitido: ${archivo.name}. Solo PNG, JPG, JPEG`);
                return;
            }
            
            // Agregar a la lista
            this.archivosSeleccionados.push({
                archivo: archivo,
                nombre: archivo.name,
                tipo: archivo.type,
                tamaño: archivo.size,
                preview: URL.createObjectURL(archivo)
            });
        }

        this.actualizarPrevisualizacion();
    }

    static actualizarPrevisualizacion() {
        const contador = $('#contadorArchivos');
        const previewContainer = $('#previewArchivos');
        
        contador.text(`${this.archivosSeleccionados.length} archivos seleccionados`);
        
        if (this.archivosSeleccionados.length === 0) {
            previewContainer.html('<p class="text-muted">No hay archivos seleccionados</p>');
            return;
        }

        let html = '<div class="row">';
        
        this.archivosSeleccionados.forEach((archivo, index) => {
            html += `
                <div class="col-md-3 col-sm-4 col-6 mb-3" data-index="${index}">
                    <div class="position-relative">
                        <img src="${archivo.preview}" class="img-fluid rounded" style="height: 100px; width: 100%; object-fit: cover;">
                        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 btn-eliminar-archivo" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                        <small class="d-block text-truncate mt-1">${archivo.nombre}</small>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        previewContainer.html(html);

        // Agregar eventos a los botones de eliminar
        $('.btn-eliminar-archivo').on('click', function() {
            const index = $(this).data('index');
            u_noticia_admin.eliminarArchivo(index);
        });
    }

    static eliminarArchivo(index) {
        // Liberar la URL del objeto
        if (this.archivosSeleccionados[index].preview) {
            URL.revokeObjectURL(this.archivosSeleccionados[index].preview);
        }
        
        // Eliminar de la lista
        this.archivosSeleccionados.splice(index, 1);
        
        // Actualizar previsualización
        this.actualizarPrevisualizacion();
    }

    static limpiarArchivos() {
        // Liberar todas las URLs
        this.archivosSeleccionados.forEach(archivo => {
            if (archivo.preview) {
                URL.revokeObjectURL(archivo.preview);
            }
        });
        
        this.archivosSeleccionados = [];
        $('#campoArchivoFoto').val('');
        this.actualizarPrevisualizacion();
    }

    static obtenerArchivosParaEnviar() {
        return this.archivosSeleccionados.map(item => item.archivo);
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevaNoticiaLabel').text('Editar noticia');
            $('#btnGuardarNoticia').text('Actualizar Noticia');
        } else {
            $('#modalNuevaNoticiaLabel').text('Agregar nueva noticia');
            $('#btnGuardarNoticia').text('Guardar Noticia');
        }
    }

    // ========== GENERAR HTML PARA TARJETAS ==========
    static crearTarjetaNoticiaHTML(noticia) {
        // Obtener la primera foto si existe
        let fotoHtml = '<i class="fas fa-newspaper fa-3x text-muted"></i>';
        if (noticia.fotos && noticia.fotos.length > 0) {
            fotoHtml = `<img src="${noticia.fotos[0].url}" class="card-img-top" style="height: 180px; object-fit: cover;">`;
        }

        // Formatear fecha
        const fecha = noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion).toLocaleDateString() : 'Fecha desconocida';

        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm noticia-card" data-id="${noticia.idNoticia}">
                    <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 180px;">
                        ${fotoHtml}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${noticia.asunto}</h5>
                        <p class="card-text text-muted small">${fecha}</p>
                        <p class="card-text">${noticia.descripcion.substring(0, 100)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-warning text-dark">${noticia.tipo}</span>
                            <div>
                                <button class="btn btn-sm btn-outline-warning editar-noticia" title="Editar" data-id="${noticia.idNoticia}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger eliminar-noticia" title="Eliminar" data-id="${noticia.idNoticia}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
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

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#formNoticia')[0].reset();
        $('#tipoNoticia').val('Ninguno');
        $('#descripcionTipo').text('');
        $('.errorMensaje').text('').hide();
        $('#formNoticia input, #formNoticia textarea, #formNoticia select').removeClass('border-success border-danger');
        this.limpiarArchivos();
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(noticia) {
        $('#asuntoNoticia').val(noticia.asunto || '');
        $('#descripcionNoticia').val(noticia.descripcion || '');
        $('#tipoNoticia').val(noticia.tipo || 'Ninguno');
        this.mostrarDescripcionTipo(noticia.tipo);
        
        // Si hay fotos, podríamos mostrarlas pero no permitir editarlas por ahora
        // Para simplificar, en edición no cargamos las fotos existentes
        this.limpiarArchivos();
    }

    // ========== FILTROS ==========
    static aplicarFiltro(noticias, tipo) {
        if (tipo === 'Ninguno') {
            return noticias;
        }
        return noticias.filter(n => n.tipo === tipo);
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
}