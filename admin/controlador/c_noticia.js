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
        this.noticiasPorPagina = 6; // 2 filas de 3 columnas
        
        // Filtros
        this.filtroActual = 'Ninguno';
        
        // Modal
        this.modalInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            //sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar modal de Bootstrap
            const modalElement = document.getElementById('modalNuevaNoticia');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            await this.cargarNoticias();
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarSubidaArchivos();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    // ========== CARGA DE DATOS ==========
    async cargarNoticias() {
        try {
            const datosBackend = await m_noticia.obtenerNoticias();
            console.log(datosBackend)
            if (!datosBackend) {
                this.noticias = [];
                this.actualizarVista();
                return;
            }

            // Convertir a objetos noticia (las fotos vienen incluidas del backend ahora)
            const todasNoticias = await u_noticia_admin.convertirANoticias(datosBackend);
            console.log(todasNoticias)

            this.noticias = todasNoticias;
            
            // Calcular total de páginas
            this.totalPaginas = Math.ceil(this.noticias.length / this.noticiasPorPagina);
            
            // Asegurar que la página actual sea válida
            if (this.paginaActual > this.totalPaginas) {
                this.paginaActual = this.totalPaginas || 1;
            }
            
            this.actualizarVista();

        } catch (error) {
            console.error('Error al cargar noticias:', error);
            Alerta.error('Error', 'Fallo al cargar noticias');
            this.noticias = [];
            this.actualizarVista();
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
        $('#filtroPorTipo').on('change', (e) => {
            this.filtroActual = e.target.value;
            this.paginaActual = 1; // Volver a primera página al filtrar
            this.actualizarVista();
        });

        // Cuando se cierra el modal, limpiar
        $('#modalNuevaNoticia').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_noticia_admin.limpiarModal();
            }
        });
    }

    // ========== FUNCIONES PARA NOTICIAS ==========

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
            formData.append('fechaPublicacion', new Date().toISOString());
            
            // Si estamos en modo edición, agregar el ID
            if (this.modoEdicion) {
                formData.append('idNoticia', this.noticiaActual.idNoticia);
            }
            
            // Agregar archivos al FormData
            const archivos = u_noticia_admin.obtenerArchivosParaEnviar();
            console.log(archivos)
            archivos.forEach((archivo, index) => {
                console.log(archivo)
                formData.append('fotos[]', archivo);
            });

            console.log(Object.fromEntries(formData));
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar noticia existente
                resultado = await m_noticia.actualizarNoticia(formData);
            } else {
                // Insertar nueva noticia
                resultado = await m_noticia.insertarNoticia(formData);
            }
            
            if (resultado) {
                // Limpiar archivos después de guardar
                u_noticia_admin.limpiarArchivos();
                
                await this.cargarNoticias();
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                Alerta.exito('Éxito', this.modoEdicion ? 'Noticia actualizada' : 'Noticia creada');
            }
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            Alerta.notificarError(`No se pudo guardar la noticia: ${error}`, 1500);
        }
    }

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

    async eliminarNoticia(id) {
        const noticia = this.noticias.find(n => n.idNoticia == id);
        if (!noticia) return;
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿Eliminar la noticia "${noticia.asunto}"?`);
        if (!confirmacion) return;
        
        try {
            const resultado = await m_noticia.eliminarNoticia(id);
            
            if (resultado) {
                await this.cargarNoticias();
                Alerta.exito('Éxito', 'Noticia eliminada');
            }
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            Alerta.error('Error', 'No se pudo eliminar la noticia');
        }
    }

    // ========== ACTUALIZAR VISTA ==========
    actualizarVista() {
        // Aplicar filtro
        const noticiasFiltradas = u_noticia_admin.aplicarFiltro(this.noticias, this.filtroActual);
        
        // Calcular páginas
        this.totalPaginas = Math.ceil(noticiasFiltradas.length / this.noticiasPorPagina);
        if (this.totalPaginas === 0) this.totalPaginas = 1;
        
        // Ajustar página actual
        if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas;
        }
        
        // Obtener noticias de la página actual
        const inicio = (this.paginaActual - 1) * this.noticiasPorPagina;
        const fin = inicio + this.noticiasPorPagina;
        const noticiasPagina = noticiasFiltradas.slice(inicio, fin);
        
        // Renderizar tarjetas
        u_noticia_admin.renderizarTarjetas(noticiasPagina);
        
        // Renderizar paginación
        u_noticia_admin.renderizarPaginacion(
            this.paginaActual,
            this.totalPaginas,
            (nuevaPagina) => this.cambiarPagina(nuevaPagina)
        );
    }

    // ========== CAMBIAR PÁGINA ==========
    cambiarPagina(nuevaPagina) {
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas || nuevaPagina === this.paginaActual) return;
        
        this.paginaActual = nuevaPagina;
        this.actualizarVista();
        
        // Hacer scroll hacia arriba suavemente
        const contenedor = document.getElementById('contTarjetaNoticia');
        if (contenedor) contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_noticia_admin();
    await controlador.inicializar();
});