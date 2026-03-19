import { sesiones } from "../../public/core/sesiones.js";
import { m_noticia } from "../../public/modelo/m_noticia.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_noticia_admin } from "../utilidades/u_noticia.js";

export class c_noticia_admin {
    constructor() {
        // Noticias
        this.noticias = [];
        this.noticiaActual = null;
        this.modoEdicion = false;
        
        // Paginación
        this.paginaActual = 1;
        this.totalPaginas = 1;
        
        // Filtros
        this.filtroActual = 'Ninguno';
        
        // Modal
        this.modalInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar modal de Bootstrap
            const modalElement = document.getElementById('modalNuevaNoticia');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            // Cargar primera página
            await this.cargarTotalPaginas();
            await this.cargarNoticias(this.paginaActual);
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarSubidaArchivos();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    // ========== CARGA DE DATOS ==========
    
    /**
     * Carga el total de páginas desde el backend
     */
    async cargarTotalPaginas() {
        try {
            let totalPaginas = 1;
            
            if (this.filtroActual === 'Ninguno') {
                const respuesta = await m_noticia.obtenerTotalPaginasNoticia();
                totalPaginas = respuesta || 1;
            } else {
                const respuesta = await m_noticia.obtenerTotalPaginasNoticiaPorTipo(this.filtroActual);
                totalPaginas = respuesta || 1;
            }
            
            this.totalPaginas = totalPaginas;
            this.actualizarInfoPaginacion();
            this.actualizarEstadoBotonesPaginacion();
            
        } catch (error) {
            console.error('Error al cargar total de páginas:', error);
            this.totalPaginas = 1;
        }
    }

    /**
     * Carga las noticias de una página específica
     * @param {number} pagina - Número de página a cargar
     */
    static respuesta = null;

    async cargarNoticias(pagina) {
        if (this.cargando) return;
        
        try {
            if (this.filtroActual === 'Ninguno') {
                this.respuesta = await m_noticia.obtenerNoticiasAPaginar(pagina);
                console.log(this.respuesta)
            } else {
                this.respuesta = await m_noticia.obtenerNoticiasPorTipoAPaginar(pagina, this.filtroActual);
            }

            console.log(this.respuesta.pagina_actual)

            const noticiasData = this.respuesta.noticias || [];
            
            this.noticias = await u_noticia_admin.convertirANoticias(noticiasData);
            
            this.paginaActual = this.respuesta.pagina_actual || pagina;
            
            this.renderizarNoticias();
            this.actualizarInfoPaginacion();
            this.actualizarEstadoBotonesPaginacion();
        } catch (error) {
            console.error('Error al cargar noticias:', error);
            Alerta.error('Error', 'Fallo al cargar noticias');
            this.noticias = [];
            this.renderizarNoticias();
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_noticia_admin.configurarValidaciones();
    }

    // ========== CONFIGURAR SUBIDA DE ARCHIVOS ==========
    configurarSubidaArchivos() {
        u_noticia_admin.configurarSubidaArchivos();
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Botón nueva noticia
        $('.nueva').on('click', () => {
            this.modoEdicion = false;
            this.noticiaActual = null;
            u_noticia_admin.limpiarModal();
            u_noticia_admin.configurarModoEdicion(false);
        });

        // Guardar noticia
        $('#btnGuardarNoticia').on('click', () => this.guardarNoticia());

        // Editar noticia
        $(document).on('click', '.editar-noticia', (e) => {
            e.stopPropagation();
            this.editarNoticia($(e.currentTarget).data('id'));
        });

        // Eliminar noticia
        $(document).on('click', '.eliminar-noticia', (e) => {
            e.stopPropagation();
            this.eliminarNoticia($(e.currentTarget).data('id'));
        });

        // Ver detalles de noticia
        $(document).on('click', '.ver-detalles-noticia', (e) => {
            e.stopPropagation();
            this.verDetallesNoticia($(e.currentTarget).data('id'));
        });

        // Filtro por tipo
        $('#filtroPorTipo').on('change', async (e) => {
            this.filtroActual = e.target.value;
            this.paginaActual = 1;
            
            await this.cargarTotalPaginas();
            await this.cargarNoticias(1);
        });

        // Botones de paginación
        $('#btnAnteriorNoticia').on('click', () => this.irPaginaAnterior());
        $('#btnSiguienteNoticia').on('click', () => this.irPaginaSiguiente());

        // Cuando se cierra el modal, limpiar
        $('#modalNuevaNoticia').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_noticia_admin.limpiarModal();
            }
        });
    }

    // ========== PAGINACIÓN ==========
    
    // Navega a la página anterior
    async irPaginaAnterior() {
        if (this.paginaActual > 1) {
            await this.cargarNoticias(this.paginaActual - 1);
        }
    }

    // Navega a la página siguiente
    async irPaginaSiguiente() {
        if (this.paginaActual < this.totalPaginas) {
            await this.cargarNoticias(this.paginaActual + 1);
        }
    }

    // Actualiza la información de paginación en la interfaz
    actualizarInfoPaginacion() {
        const indicador = document.getElementById('paginaActualNoticia');
        if (indicador) {
            indicador.textContent = `Página ${this.paginaActual} de ${this.totalPaginas}`;
        }
        this.actualizarEstadoBotonesPaginacion();
    }

    // Actualiza el estado de los botones de paginación
    actualizarEstadoBotonesPaginacion() {
        const btnAnterior = document.getElementById('btnAnteriorNoticia');
        const btnSiguiente = document.getElementById('btnSiguienteNoticia');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActual <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActual >= this.totalPaginas;
        }
    }

    // ========== RENDERIZADO ==========
    
    // Renderiza las noticias en la interfaz
    renderizarNoticias() {
        u_noticia_admin.renderizarTarjetas(this.noticias);
    }

    // ========== VER DETALLES DE NOTICIA ==========
    async verDetallesNoticia(id) {
        const noticia = this.noticias.find(n => n.idNoticia == id);
        if (!noticia) return;
        
        try {
            const detallesHtml = u_noticia_admin.crearDetallesNoticiaHTML(noticia);
            $('#modalVerDetallesNoticia .card-body').html(detallesHtml);
            $('#modalVerDetallesNoticia').modal('show');
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }
    
    // ========== VALIDACIÓN DE FORMULARIO ==========
    formularioNoticiaEsValido() {
        const asunto = $('#asuntoNoticia').val().trim();
        const descripcion = $('#descripcionNoticia').val().trim();
        const tipo = $('#tipoNoticia').val();
        
        // Si estamos en modo edición
        if (this.modoEdicion) {
            if (asunto && !u_noticia_admin.validarAsunto(asunto)) return false;
            if (descripcion && !u_noticia_admin.validarDescripcion(descripcion)) return false;
            if (tipo && !u_noticia_admin.validarTipo(tipo)) return false;
            return true;
        }
        
        // Si es nueva, todos los campos son obligatorios
        return u_noticia_admin.validarAsunto(asunto) && 
               u_noticia_admin.validarDescripcion(descripcion) && 
               u_noticia_admin.validarTipo(tipo);
    }

    // ========== GUARDAR NOTICIA ==========
    async guardarNoticia() {
        if (!this.formularioNoticiaEsValido()) {
            Alerta.notificarAdvertencia('Complete correctamente los campos', 1500);
            return;
        }
        
        try {
            // Crear FormData
            const formData = new FormData();
            
            // Agregar campos del formulario
            formData.append('asunto', $('#asuntoNoticia').val().trim());
            formData.append('descripcion', $('#descripcionNoticia').val().trim());
            formData.append('tipo', $('#tipoNoticia').val());
            formData.append('fechaPublicacion', new Date().toISOString().split('T')[0]); // Solo fecha YYYY-MM-DD
            
            // Si estamos en modo edición, agregar el ID
            if (this.modoEdicion) {
                formData.append('idNoticia', this.noticiaActual.idNoticia);
            }
            
            // Agregar archivos al FormData
            const archivos = u_noticia_admin.obtenerArchivosParaEnviar();
            
            archivos.forEach((archivo, _index) => {
                formData.append('fotos[]', archivo);
            });
            
            let resultado;
            
            if (this.modoEdicion) {
                resultado = await m_noticia.actualizarNoticia(formData);
            } else {
                resultado = await m_noticia.insertarNoticia(formData);
            }
            
            if (resultado) {
                // Limpiar archivos después de guardar
                u_noticia_admin.limpiarArchivos();
                
                // Recargar total de páginas y la página actual
                await this.cargarTotalPaginas();
                await this.cargarNoticias(this.paginaActual);
                
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                
                Alerta.notificarExito(this.modoEdicion ? 'Noticia actualizada' : 'Noticia creada', 1500);
            }
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            Alerta.notificarError(`No se pudo guardar la noticia: ${error}`, 1500);
        }
    }

    // ========== EDITAR NOTICIA ==========
    async editarNoticia(id) {
        const noticia = this.noticias.find(n => n.idNoticia == id);
        if (!noticia) return;
        
        this.modoEdicion = true;
        this.noticiaActual = noticia;
        
        // Cargar datos en el modal
        u_noticia_admin.cargarDatosEnModal(noticia);
        u_noticia_admin.configurarModoEdicion(true);
        
        // Abrir el modal
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    // ========== ELIMINAR NOTICIA ==========
    async eliminarNoticia(id) {
        const noticia = this.noticias.find(n => n.idNoticia == id);
        if (!noticia) return;
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿Eliminar la noticia "${noticia.asunto}"?`);
        if (!confirmacion) return;
        
        try {
            const resultado = await m_noticia.eliminarNoticia(id);
            
            if (resultado) {
                // Recargar total de páginas y la página actual
                await this.cargarTotalPaginas();
                
                // Si la página actual se queda sin noticias, ir a la página anterior
                if (this.paginaActual > this.totalPaginas) {
                    this.paginaActual = this.totalPaginas;
                }
                
                let eliminado = await this.cargarNoticias(this.paginaActual);

                if (eliminado==false) return;

                Alerta.notificarExito('Noticia eliminada', 1500);
            }
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            Alerta.error('Error', 'No se pudo eliminar la noticia');
        }
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_noticia_admin();
    await controlador.inicializar();
});