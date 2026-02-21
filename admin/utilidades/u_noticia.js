import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_noticia {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar asunto
    static validarAsunto(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar descripción
    static validarDescripcion(valor) {
        return u_verificaciones.validarDescripcion(valor);
    }
    
    // Validar tipo
    static validarTipo(valor) {
        return valor !== 'Ninguno' && valor !== '';
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Mostrar descripción según el tipo de noticia
    static mostrarDescripcionTipo(tipo) {
        const descripcionDiv = document.getElementById('descripcionTipo');
        
        const descripciones = {
            'Comunicado': '📢 Noticia pública para toda la comunidad universitaria',
            'Interna': '🏛️ Noticia interna para miembros de la misma facultad',
            'Departamento': '👥 Noticia para miembros del mismo departamento'
        };
        
        descripcionDiv.textContent = descripciones[tipo] || '';
    }
    
    // Limpiar formulario
    static limpiarFormulario() {
        document.getElementById('formNoticia').reset();
        
        // Limpiar clases de validación
        document.querySelectorAll('#formNoticia input, #formNoticia select, #formNoticia textarea').forEach(campo => {
            campo.classList.remove('border-success', 'border-danger');
        });
        
        // Limpiar mensajes de error
        document.querySelectorAll('.errorMensaje').forEach(error => {
            error.textContent = '';
            error.classList.add('d-none');
        });
        
        // Limpiar descripción del tipo
        document.getElementById('descripcionTipo').textContent = '';
        
        // Resetear select
        document.getElementById('tipoNoticia').value = 'Ninguno';
        
        // Limpiar área de archivos
        document.getElementById('campoArchivoFoto').value = '';
        document.getElementById('btnEliminarImagenes').disabled = true;
        
        // Restaurar área de drag & drop
        this.mostrarArchivosSeleccionados([]);
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            asunto: document.getElementById('asuntoNoticia').value.trim(),
            tipo: document.getElementById('tipoNoticia').value,
            descripcion: document.getElementById('descripcionNoticia').value.trim(),
            fechaPublicacion: new Date().toISOString().split('T')[0] // Fecha actual YYYY-MM-DD
        };
    }
    
    // ============================================
    // MANEJO DE ARCHIVOS
    // ============================================
    
    // Configurar área de drag & drop
    static configurarDragAndDrop() {
        const dropArea = document.getElementById('fileDropArea');
        const fileInput = document.getElementById('campoArchivoFoto');
        const btnEliminar = document.getElementById('btnEliminarImagenes');
        
        // Prevenir comportamiento por defecto
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, prevenirDefault, false);
        });
        
        function prevenirDefault(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Resaltar área cuando se arrastra
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('highlight');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('highlight');
            }, false);
        });
        
        // Manejar drop
        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            fileInput.files = files;
            this.mostrarArchivosSeleccionados(files);
            btnEliminar.disabled = false;
        }, false);
        
        // Manejar click en el área
        dropArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Manejar cambio en input file
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.mostrarArchivosSeleccionados(e.target.files);
                btnEliminar.disabled = false;
            }
        });
        
        // Botón eliminar imágenes
        btnEliminar.addEventListener('click', () => {
            fileInput.value = '';
            this.mostrarArchivosSeleccionados([]);
            btnEliminar.disabled = true;
        });
    }
    
    // Mostrar archivos seleccionados
    static mostrarArchivosSeleccionados(files) {
        const dropArea = document.getElementById('fileDropArea');
        
        if (files.length === 0) {
            dropArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <h5>Arrastra y suelta archivos aquí o cliquea</h5>
                <p class="text-muted small">Formatos permitidos: PNG, JPG, JPEG</p>
            `;
            return;
        }
        
        let html = '<div class="selected-files">';
        for (let i = 0; i < Math.min(files.length, 3); i++) {
            html += `<div class="file-badge">📷 ${files[i].name}</div>`;
        }
        if (files.length > 3) {
            html += `<div class="file-badge">... y ${files.length - 3} más</div>`;
        }
        html += '</div>';
        
        dropArea.innerHTML = html;
    }
    
    // Mostrar archivos existentes (para edición)
    static mostrarArchivosExistentes(archivos) {
        const dropArea = document.getElementById('fileDropArea');
        const imagenes = archivos.filter(a => a.tipoArchivo === 'foto' || a.tipoArchivo === 'imagen');
        
        if (imagenes.length === 0) return;
        
        let html = '<div class="selected-files">';
        html += `<div class="file-badge text-primary">📷 ${imagenes.length} imagen(es) existente(s)</div>`;
        
        // Mostrar miniaturas
        html += '<div class="d-flex flex-wrap gap-2 mt-2">';
        imagenes.slice(0, 3).forEach(img => {
            html += `<img src="${img.url}" class="rounded" width="50" height="50" style="object-fit: cover;">`;
        });
        if (imagenes.length > 3) {
            html += `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="width:50px;height:50px;">+${imagenes.length-3}</div>`;
        }
        html += '</div>';
        
        html += '<p class="text-muted small mt-2">Puedes agregar más imágenes</p>';
        html += '</div>';
        
        dropArea.innerHTML = html;
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(noticia) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info verDetalles" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalVerDetallesNoticia" 
                        title="Ver detalles" 
                        data-id="${noticia.idNoticia}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevaNoticia" 
                        title="Editar" 
                        data-id="${noticia.idNoticia}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger eliminar" 
                        title="Eliminar" 
                        data-id="${noticia.idNoticia}">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }
    
    // Formatear fecha
    static formatearFecha(fecha) {
        if (!fecha) return "Sin fecha";
        const partes = fecha.split('T')[0].split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return fecha;
    }
    
    // Obtener badge según tipo
    static obtenerBadgeTipo(tipo) {
        const colores = {
            'Comunicado': 'primary',
            'Interna': 'success',
            'Departamento': 'info'
        };
        const color = colores[tipo] || 'secondary';
        return `<span class="badge bg-${color}">${tipo}</span>`;
    }
}