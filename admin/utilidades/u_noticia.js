import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_noticia_admin {
    
    // ========== VALIDACIONES ==========
    static validarAsunto(valor) {
        return u_verificaciones.validarTexto(valor)
    }
    
    static validarDescripcion(valor) {
        return u_verificaciones.validarDescripcion(valor)
    }
    
    static validarTipo(valor) {
        return valor && valor !== 'Ninguno' && valor !== '';
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
    static archivosParaEnviar = [];

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
            
            // También actualizar el input file
            const dataTransfer = new DataTransfer();
            for (let archivo of archivos) {
                dataTransfer.items.add(archivo);
            }
            $('#campoArchivoFoto')[0].files = dataTransfer.files;
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
        
        Array.from(archivos).forEach(archivo => {
            if (!formatosPermitidos.includes(archivo.type)) {
                Alerta.notificarAdvertencia(`Formato no permitido: ${archivo.name}. Solo PNG, JPG, JPEG`, 2000);
                return;
            }
            
            // Verificar si ya existe (para no duplicar)
            const yaExiste = this.archivosSeleccionados.some(a => a.nombre === archivo.name && a.tamaño === archivo.size);
            if (yaExiste) return;
            
            // Crear preview
            const preview = URL.createObjectURL(archivo);
            
            // Agregar a la lista de seleccionados (para mostrar)
            this.archivosSeleccionados.push({
                archivo: archivo,
                nombre: archivo.name,
                tipo: archivo.type,
                tamaño: archivo.size,
                preview: preview
            });

            // Agregar a la lista para enviar (solo el File object)
            this.archivosParaEnviar.push(archivo);
        });

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
        if (this.archivosSeleccionados[index] && this.archivosSeleccionados[index].preview) {
            URL.revokeObjectURL(this.archivosSeleccionados[index].preview);
        }
        
        // Eliminar de la lista de seleccionados
        const archivoEliminado = this.archivosSeleccionados[index];
        this.archivosSeleccionados.splice(index, 1);
        
        // Eliminar de la lista para enviar (buscando por nombre y tamaño)
        if (archivoEliminado) {
            const indiceParaEnviar = this.archivosParaEnviar.findIndex(a => 
                a.name === archivoEliminado.nombre && 
                a.size === archivoEliminado.tamaño
            );
            if (indiceParaEnviar !== -1) {
                this.archivosParaEnviar.splice(indiceParaEnviar, 1);
            }
        }
        
        // Actualizar el input file (opcional, pero complejo)
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
        this.archivosParaEnviar = [];
        $('#campoArchivoFoto').val('');
        this.actualizarPrevisualizacion();
    }

    static obtenerArchivosParaEnviar() {
        return this.archivosParaEnviar; // Devuelve array de File objects directamente
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
            const primeraFoto = noticia.fotos[0];
            const fotoUrl = primeraFoto.url_completa || (primeraFoto.nombre ? `/guniversidadfrontend/public/img/${primeraFoto.nombre}` : '');
            
            if (fotoUrl) {
                fotoHtml = `<img src="${fotoUrl}" class="card-img-top" style="height: 180px; object-fit: cover;" onerror="this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg'">`;
            }
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
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-info ver-detalles-noticia" title="Ver detalles" data-id="${noticia.idNoticia}" data-bs-toggle="modal" data-bs-target="#modalVerDetallesNoticia">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning editar-noticia" title="Editar" data-id="${noticia.idNoticia}" data-bs-toggle="modal" data-bs-target="#modalNuevaNoticia">
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

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#formNoticia')[0].reset();
        $('#tipoNoticia').val('Ninguno');
        $('#descripcionTipo').text('');
        $('.errorMensaje').text('').hide();
        $('#formNoticia input, #formNoticia textarea, #formNoticia select').removeClass('border-success border-danger');
        this.limpiarArchivos(); // ← Asegurar limpieza de archivos
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(noticia) {
        $('#asuntoNoticia').val(noticia.asunto || '');
        $('#descripcionNoticia').val(noticia.descripcion || '');
        $('#tipoNoticia').val(noticia.tipo || 'Ninguno');
        this.mostrarDescripcionTipo(noticia.tipo);
        
        // En edición, no cargamos las fotos existentes para simplificar
        // El usuario puede subir nuevas fotos si lo desea
        this.limpiarArchivos(); // ← Asegurarse de limpiar archivos anteriores
        
        // Opcional: Mostrar las fotos existentes como referencia
        if (noticia.fotos && noticia.fotos.length > 0) {
            const contador = $('#contadorArchivos');
            contador.text(`${noticia.fotos.length} fotos existentes (se reemplazarán al subir nuevas)`);
            
            // No mostramos las miniaturas para no confundir, solo informamos
        }
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
        
        const baseUrl = '/guniversidadfrontend/public/img/';
        
        return datosBackend.map(item => {
            let fotosProcesadas = [];         

            if (item.fotos && Array.isArray(item.fotos)) {
                fotosProcesadas = item.fotos.map(foto => {
                    // Si foto es un string (nombre del archivo)
                    if (typeof foto === 'string') {
                        return {
                            url: foto,
                            url_completa: baseUrl + foto,
                            nombre: foto
                        };
                    }
                    // Si foto es un objeto
                    else if (foto && typeof foto === 'object') {
                        // Si tiene url
                        if (foto.url) {
                            return {
                                ...foto,
                                url_completa: baseUrl + foto.url
                            };
                        }
                        // Si tiene nombre
                        else if (foto.nombre) {
                            return {
                                ...foto,
                                url: foto.nombre,
                                url_completa: baseUrl + foto.nombre
                            };
                        }
                    }
                    
                    return foto;
                });
            }
            
            return {
                idNoticia: item.idNoticia || item.id,
                asunto: item.asunto,
                descripcion: item.descripcion,
                tipo: item.tipo || 'Comunicado',
                fechaPublicacion: item.fechaPublicacion,
                fotos: fotosProcesadas
            };
        });
    }

    // ========== GENERAR HTML PARA DETALLES DE NOTICIA ==========
    static crearDetallesNoticiaHTML(noticia) {
        let fotosHtml = '';
        if (noticia.fotos && noticia.fotos.length > 0) {
            fotosHtml = '<div class="row mt-3">';
            noticia.fotos.forEach(foto => {
                const fotoUrl = foto.url_completa || (foto.nombre ? `/guniversidadfrontend/public/img/${foto.nombre}` : '');
                if (fotoUrl) {
                    fotosHtml += `
                        <div class="col-md-3 col-sm-4 col-6 mb-3">
                            <img src="${fotoUrl}" class="img-fluid rounded" style="height: 150px; width: 100%; object-fit: cover;">
                        </div>
                    `;
                }
            });
            fotosHtml += '</div>';
        }

        const fecha = noticia.fechaPublicacion ? new Date(noticia.fechaPublicacion).toLocaleDateString() : 'Fecha desconocida';
        
        return `
            <div class="noticia-detalle">
                <div class="text-center mb-4">
                    <h3>${noticia.asunto}</h3>
                    <p class="text-muted">${fecha}</p>
                    <span class="badge bg-warning text-dark fs-6">${noticia.tipo}</span>
                </div>
                
                <div class="descripcion mt-4 p-3 bg-light rounded">
                    <h5>Descripción:</h5>
                    <p>${noticia.descripcion}</p>
                </div>
                
                ${fotosHtml ? `<div class="mt-4"><h5>Galería de imágenes:</h5>${fotosHtml}</div>` : ''}
            </div>
        `;
    }
}