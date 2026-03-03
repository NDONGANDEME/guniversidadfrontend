import { sesiones } from "../../public/core/sesiones.js";
import { m_archivo } from "../../public/modelo/m_archivo.js";
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
            sesiones.verificarExistenciaSesion();
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
            
            if (!datosBackend) {
                this.noticias = [];
                this.actualizarVista();
                return;
            }

            // Convertir a objetos noticia
            const todasNoticias = await u_noticia_admin.convertirANoticias(datosBackend);

            // Cargar fotos para cada noticia
            for (const noticia of todasNoticias) {
                try {
                    const archivos = await m_archivo.obtenerArchivosPorNoticia(noticia.idNoticia);
                    noticia.fotos = archivos || [];
                } catch (error) {
                    console.warn(`Error cargando fotos de noticia ${noticia.idNoticia}:`, error);
                    noticia.fotos = [];
                }
            }

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
            Alerta.advertencia('Campos inválidos', 'Complete correctamente los campos');
            return;
        }
        
        try {
            const asunto = $('#asuntoNoticia').val().trim();
            const descripcion = $('#descripcionNoticia').val().trim();
            const tipo = $('#tipoNoticia').val();
            
            const datos = {
                asunto: asunto,
                descripcion: descripcion,
                tipo: tipo,
                fechaPublicacion: new Date().toISOString()
            };
            
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
                // Suponiendo que el backend devuelve el ID de la noticia creada
                idNoticia = resultado.idNoticia || resultado.id;
            }
            
            // Subir archivos si hay
            const archivos = u_noticia_admin.obtenerArchivosParaEnviar();
            if (archivos.length > 0 && idNoticia) {
                // Aquí iría la lógica para subir los archivos al servidor
                // Por ejemplo: await m_archivo.subirArchivos(idNoticia, archivos);
                console.log(`Subir ${archivos.length} archivos para noticia ${idNoticia}`);
            }
            
            if (resultado) {
                await this.cargarNoticias();
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                Alerta.exito('Éxito', this.modoEdicion ? 'Noticia actualizada' : 'Noticia creada');
            }
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            Alerta.error('Error', 'No se pudo guardar la noticia');
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
                // Eliminar también los archivos asociados si es necesario
                // await m_archivo.eliminarArchivosPorNoticia(id);
                
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