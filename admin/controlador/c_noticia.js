// c_noticia.js - Controlador de noticias
import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_noticia } from "../utilidades/u_noticia.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_archivo } from "../../public/modelo/m_archivo.js";
import { m_noticia } from "../../public/modelo/m_noticia.js";

export class c_noticia {
    constructor() {
        // Datos principales
        this.noticias = [];
        this.archivos = [];
        
        // Control de edición
        this.modoEdicion = false;
        this.noticiaActual = null;
        
        // DataTable
        this.tablaNoticias = null;
        
        // Validaciones
        this.validaciones = {
            asunto: false,
            tipo: false,
            descripcion: false
        };
    }
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    async inicializar() {
        try {
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Cargar datos del actor (usuario que hace la acción)
            this.actor = JSON.parse(sessionStorage.getItem('usuarioActual'));
            
            // Cargar noticias de la base de datos
            await this.cargarNoticias();
            
            // Inicializar DataTable
            this.inicializarTabla();
            
            // Configurar eventos
            this.configurarEventos();
            this.configurarValidaciones();
            
            // Configurar drag & drop para imágenes
            u_noticia.configurarDragAndDrop();
        } catch (error) {
            Alerta.notificarError(`Error. No se pudo inicializar el módulo de noticias: ${error}`, 1500);
        }
    }
    
    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarNoticias() {
        try {
            // Obtener noticias desde el backend
            this.noticias = await m_noticia.obtenerNoticias();
            
            // Por cada noticia, cargar sus archivos (imágenes)
            for (let noticia of this.noticias) {
                noticia.archivos = await m_archivo.obtenerArchivosPorNoticia(noticia.idNoticia, this.actor);
            }
            
            this.actualizarTabla();
        } catch (error) {
            Alerta.notificarError(`Error. No se pudieron cargar las noticias: ${error}`, 1500);
        }
    }
    
    async cargarArchivosPorNoticia(idNoticia) {
        try {
            return await m_archivo.obtenerArchivosPorNoticia(idNoticia, this.actor);
        } catch (error) {
            console.error('Error cargando archivos:', error);
            return [];
        }
    }
    
    // ============================================
    // CONFIGURACIÓN DE TABLA
    // ============================================
    
    inicializarTabla() {
        // Destruir DataTable existente si la hay
        if ($.fn.dataTable.isDataTable('#tablaNoticias')) {
            $('#tablaNoticias').DataTable().destroy();
        }
        
        this.tablaNoticias = $('#tablaNoticias').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [0, 3] } // No ordenar por imagen y acciones
            ]
        });
    }
    
    actualizarTabla() {
        this.tablaNoticias.clear();
        
        this.noticias.forEach(noticia => {
            // Mostrar la primera imagen si existe
            let fotoHTML = '<span class="text-muted">Sin imagen</span>';
            if (noticia.archivos && noticia.archivos.length > 0) {
                const primeraImagen = noticia.archivos.find(a => a.tipoArchivo === 'foto' || a.tipoArchivo === 'imagen');
                if (primeraImagen) {
                    fotoHTML = `<img src="${primeraImagen.url}" class="rounded" width="50" height="50" style="object-fit: cover;">`;
                }
            }
            
            this.tablaNoticias.row.add([
                fotoHTML,
                noticia.asunto || 'Sin asunto',
                u_noticia.obtenerBadgeTipo(noticia.tipo),
                u_noticia.crearBotonesAccion(noticia)
            ]);
        });
        
        this.tablaNoticias.draw();
        
        // Asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    // ============================================
    // CONFIGURACIÓN DE EVENTOS
    // ============================================
    
    configurarEventos() {
        // Botón nueva noticia
        document.querySelector('.nueva').addEventListener('click', () => {
            this.modoEdicion = false;
            this.noticiaActual = null;
            document.getElementById('modalNuevaNoticiaLabel').textContent = 'Agregar nueva noticia';
            u_noticia.limpiarFormulario();
        });
        
        // Cambio en el select de tipo
        document.getElementById('tipoNoticia').addEventListener('change', (e) => {
            u_noticia.mostrarDescripcionTipo(e.target.value);
        });
        
        // Botón guardar noticia
        document.getElementById('btnGuardarNoticia').addEventListener('click', () => {
            this.guardarNoticia();
        });
        
        // Filtro por tipo
        document.getElementById('filtroPorTipo').addEventListener('change', () => {
            this.aplicarFiltro();
        });
    }
    
    asignarEventosBotones() {
        // Botones de ver detalles
        document.querySelectorAll('.verDetalles').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.verDetallesNoticia(id);
            });
        });
        
        // Botones de editar
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editarNoticia(id);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.eliminarNoticia(id);
            });
        });
    }
    
    configurarValidaciones() {
        // Validar asunto
        document.getElementById('asuntoNoticia').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.asunto = u_noticia.validarAsunto(valor);
            u_utiles.colorearCampo(
                this.validaciones.asunto,
                '#asuntoNoticia',
                '#errorAsuntoNoticia',
                'El asunto debe tener entre 5 y 100 caracteres'
            );
        });
        
        // Validar tipo
        document.getElementById('tipoNoticia').addEventListener('change', (e) => {
            const valor = e.target.value;
            this.validaciones.tipo = u_noticia.validarTipo(valor);
            u_utiles.colorearCampo(
                this.validaciones.tipo,
                '#tipoNoticia',
                '#errorTipoNoticia',
                'Seleccione un tipo de noticia'
            );
        });
        
        // Validar descripción
        document.getElementById('descripcionNoticia').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.descripcion = u_noticia.validarDescripcion(valor);
            u_utiles.colorearCampo(
                this.validaciones.descripcion,
                '#descripcionNoticia',
                '#errorDescripcionNoticia',
                'La descripción debe tener entre 10 y 500 caracteres'
            );
        });
    }
    
    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarNoticia() {
        // Validar todos los campos
        if (!this.validaciones.asunto || !this.validaciones.tipo || !this.validaciones.descripcion) {
            Alerta.notificarAdvertencia('Campos incompletos. Complete todos los campos correctamente', 1500);
            return;
        }
        
        try {
            const datos = u_noticia.obtenerDatosFormulario();
            
            let resultado;
            let idNoticia;
            
            if (this.modoEdicion) {
                // Actualizar noticia existente
                datos.idNoticia = this.noticiaActual.idNoticia;
                resultado = await m_noticia.actualizarNoticia(datos);
                idNoticia = this.noticiaActual.idNoticia;
            } else {
                // Insertar nueva noticia
                resultado = await m_noticia.insertarNoticiaEn(datos);
                idNoticia = resultado.idNoticia; // Suponiendo que el backend devuelve el ID
            }
            
            if (resultado) {
                // Subir imágenes si hay
                const fileInput = document.getElementById('campoArchivoFoto');
                if (fileInput.files.length > 0) {
                    await this.subirImagenes(idNoticia, fileInput.files);
                }
                
                // Recargar noticias
                await this.cargarNoticias();
                
                // Cerrar modal
                $('#modalNuevaNoticia').modal('hide');
                
                Alerta.exito(
                    this.modoEdicion ? 'Noticia actualizada' : 'Noticia creada',
                    `La noticia se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.notificarError(`No se pudo guardar la noticia: ${error}`, 1500);
        }
    }
    
    async subirImagenes(idNoticia, files) {
        try {
            // Crear FormData para subir las imágenes
            const formData = new FormData();
            
            for (let i = 0; i < files.length; i++) {
                const archivo = files[i];
                
                // Crear objeto archivo para cada imagen
                const objetoArchivo = {
                    url: '', // La URL la generará el backend
                    tipoArchivo: 'foto',
                    idReferencia: idNoticia,
                    tablaReferencia: 'noticias'
                };
                
                // Aquí iría la lógica para subir el archivo al servidor
                // Por ahora solo simulamos
                console.log('Subiendo imagen:', archivo.name);
                
                // await m_archivo.insertarArchivo(objetoArchivo, this.actor);
            }
            
            console.log(`${files.length} imágenes subidas correctamente`);
        } catch (error) {
            Alerta.notificarError(`No se pudieron subir las imágenes: ${error}`, 1500);
        }
    }
    
    async eliminarNoticia(id) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar eliminación',
                '¿Está seguro de eliminar esta noticia? Esta acción no se puede deshacer.'
            );
            
            if (confirmacion) {
                // Primero eliminar los archivos asociados
                const archivos = await this.cargarArchivosPorNoticia(id);
                for (let archivo of archivos) {
                    await m_archivo.eliminarArchivo(archivo.idArchivo, this.actor);
                }
                
                // Luego eliminar la noticia
                const resultado = await m_noticia.eliminarNoticia(id);
                
                if (resultado) {
                    // Recargar noticias
                    await this.cargarNoticias();
                    
                    Alerta.exito('Éxito', 'Noticia eliminada correctamente');
                }
            }
        } catch (error) {
            Alerta.notificarError(`No se pudo eliminar la noticia: ${error}`, 1500);
        }
    }
    
    async editarNoticia(id) {
        const noticia = this.noticias.find(n => n.idNoticia == id);
        
        if (noticia) {
            this.modoEdicion = true;
            this.noticiaActual = noticia;
            
            // Cargar datos en el formulario
            document.getElementById('asuntoNoticia').value = noticia.asunto || '';
            document.getElementById('tipoNoticia').value = noticia.tipo || 'Ninguno';
            document.getElementById('descripcionNoticia').value = noticia.descripcion || '';
            
            // Mostrar descripción del tipo
            u_noticia.mostrarDescripcionTipo(noticia.tipo);
            
            // Si hay archivos, mostrar información
            if (noticia.archivos && noticia.archivos.length > 0) {
                const btnEliminar = document.getElementById('btnEliminarImagenes');
                btnEliminar.disabled = false;
                // Mostrar indicador de que ya tiene imágenes
                u_noticia.mostrarArchivosExistentes(noticia.archivos);
            }
            
            document.getElementById('modalNuevaNoticiaLabel').textContent = 'Editar noticia';
            
            // Forzar validaciones
            document.getElementById('asuntoNoticia').dispatchEvent(new Event('input'));
            document.getElementById('tipoNoticia').dispatchEvent(new Event('change'));
            document.getElementById('descripcionNoticia').dispatchEvent(new Event('input'));
        }
    }
    
    async verDetallesNoticia(id) {
        const noticia = this.noticias.find(n => n.idNoticia == id);
        
        if (noticia) {
            // Cargar archivos de la noticia si no están cargados
            const archivos = noticia.archivos || await this.cargarArchivosPorNoticia(id);
            
            // Construir HTML de detalles
            let archivosHTML = '';
            const imagenes = archivos.filter(a => a.tipoArchivo === 'foto' || a.tipoArchivo === 'imagen');
            
            if (imagenes.length > 0) {
                archivosHTML = '<div class="row mt-3">';
                imagenes.forEach(archivo => {
                    archivosHTML += `
                        <div class="col-md-4 mb-2">
                            <img src="${archivo.url}" class="img-fluid rounded" alt="Imagen noticia" 
                                 style="width: 100%; height: 150px; object-fit: cover;">
                        </div>
                    `;
                });
                archivosHTML += '</div>';
            } else {
                archivosHTML = '<p class="text-muted">Sin imágenes</p>';
            }
            
            const html = `
                <div class="mb-3">
                    <h5 class="text-primary">${noticia.asunto}</h5>
                    <p class="mb-1"><strong>Tipo:</strong> ${u_noticia.obtenerBadgeTipo(noticia.tipo)}</p>
                    <p class="mb-1"><strong>Fecha publicación:</strong> ${u_noticia.formatearFecha(noticia.fechaPublicacion)}</p>
                    <hr>
                    <p class="mb-1"><strong>Descripción:</strong></p>
                    <p class="text-justify">${noticia.descripcion || 'Sin descripción'}</p>
                    <hr>
                    <p class="mb-2"><strong>Imágenes (${imagenes.length}):</strong></p>
                    ${archivosHTML}
                </div>
            `;
            
            document.querySelector('#modalVerDetallesNoticia .card-body').innerHTML = html;
        }
    }
    
    // ============================================
    // FILTROS
    // ============================================
    
    aplicarFiltro() {
        const tipo = document.getElementById('filtroPorTipo').value;
        this.tablaNoticias.column(2).search(tipo !== 'Ninguno' ? tipo : '').draw();
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_noticia();
    await controlador.inicializar();
});