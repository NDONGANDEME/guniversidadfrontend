import { sesiones } from "../../public/core/sesiones.js";
import { m_archivo } from "../../public/modelo/m_archivo.js";
import { m_noticia } from "../../public/modelo/m_noticia.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_profesor } from "../../secretarioAcademico/modelo/m_profesor.js";
import { u_noticia_profesor } from "../utilidades/u_noticias.js";

export class c_noticia_profesor {
    constructor() {
        // Datos del profesor
        this.profesor = null;
        this.usuario = null;
        this.idFacultad = null;
        
        // Noticias
        this.noticias = [];
        this.noticiaActual = null;
        
        // Paginación
        this.paginaActual = 1;
        this.totalPaginas = 1;
        this.noticiasPorPagina = 6; // 2 filas de 3 columnas
        
        // Modal
        this.modalInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            // Verificar sesión
            const sesionActiva = sesiones.verificarExistenciaSesion();
            if (!sesionActiva) return;

            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionProfesor();
            
            // Obtener datos del usuario actual
            await this.obtenerDatosProfesor();
            
            // Inicializar modal de Bootstrap
            const modalElement = document.getElementById('modalNoticias');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            // Cargar noticias según permisos
            await this.cargarNoticias();
            
            // Configurar eventos
            this.configurarEventos();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    // ========== OBTENER DATOS DEL PROFESOR ==========
    async obtenerDatosProfesor() {
        try {
            // Obtener usuario de sessionStorage
            const usuarioGuardado = sessionStorage.getItem('usuarioActual');
            if (!usuarioGuardado) {
                console.warn('No hay usuario en sesión');
                return;
            }

            this.usuario = JSON.parse(usuarioGuardado);
            
            // Buscar el profesor asociado a este usuario
            const profesores = await m_profesor.obtenerProfesores();
            this.profesor = profesores.find(p => p.idUsuario == this.usuario.idUsuario);
            
            if (this.profesor) {
                this.idFacultad = this.profesor.idFacultad;
                console.log('Profesor encontrado, facultad:', this.idFacultad);
            } else {
                console.warn('No se encontró el profesor asociado al usuario');
            }
            
        } catch (error) {
            console.error('Error al obtener datos del profesor:', error);
        }
    }

    // ========== CARGAR NOTICIAS ==========
    async cargarNoticias() {
        try {
            // Obtener todas las noticias del backend
            const todasLasNoticias = await m_noticia.obtenerNoticias();
            
            if (!todasLasNoticias || todasLasNoticias.length === 0) {
                this.noticias = [];
                this.actualizarVista();
                return;
            }

            // Convertir a objetos noticia
            const noticiasConvertidas = await u_noticia_profesor.convertirANoticias(todasLasNoticias);
            
            // Filtrar según permisos del profesor:
            // - Comunicado: visible para todos
            // - Interna: solo si es de su misma facultad
            const noticiasFiltradas = [];
            
            for (const noticia of noticiasConvertidas) {
                // Los comunicados siempre se muestran
                if (noticia.tipo === 'Comunicado') {
                    noticiasFiltradas.push(noticia);
                    continue;
                }
                
                // Para noticias internas, verificar si son de la facultad del profesor
                if (noticia.tipo === 'Interna') {
                    // Necesitamos saber a qué facultad pertenece la noticia
                    // Esto depende de cómo guardes esa información en el backend
                    // Por ahora, asumimos que las noticias internas tienen un campo idFacultad
                    if (noticia.idFacultad && noticia.idFacultad == this.idFacultad) {
                        noticiasFiltradas.push(noticia);
                    }
                }
                
                // Las noticias de tipo "Departamento" NO se muestran al profesor
            }

            // Cargar fotos para cada noticia filtrada
            for (const noticia of noticiasFiltradas) {
                try {
                    const archivos = await m_archivo.obtenerArchivosPorNoticia(noticia.idNoticia);
                    noticia.fotos = archivos || [];
                } catch (error) {
                    console.warn(`Error cargando fotos de noticia ${noticia.idNoticia}:`, error);
                    noticia.fotos = [];
                }
            }

            this.noticias = noticiasFiltradas;
            
            // Calcular total de páginas
            this.totalPaginas = Math.ceil(this.noticias.length / this.noticiasPorPagina);
            if (this.totalPaginas === 0) this.totalPaginas = 1;
            
            // Asegurar que la página actual sea válida
            if (this.paginaActual > this.totalPaginas) {
                this.paginaActual = this.totalPaginas;
            }
            
            this.actualizarVista();

        } catch (error) {
            console.error('Error al cargar noticias:', error);
            u_noticia_profesor.mostrarMensajeError('Error al cargar las noticias');
            this.noticias = [];
            this.actualizarVista();
        }
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Evento para botones "Leer más" (abren modal)
        $(document).on('click', '.btnLeerMasNoticias', async (e) => {
            e.preventDefault();
            const id = $(e.currentTarget).data('id');
            if (id) {
                await this.abrirModalNoticia(id);
            }
        });

        // Evento para cerrar modal y limpiar contenido
        $('#modalNoticias').on('hidden.bs.modal', () => {
            u_noticia_profesor.limpiarModal();
        });
    }

    // ========== ABRIR MODAL CON NOTICIA ==========
    async abrirModalNoticia(id) {
        try {
            // Buscar la noticia en las ya cargadas
            const noticia = this.noticias.find(n => n.idNoticia == id);
            
            if (!noticia) {
                u_noticia_profesor.mostrarMensajeError('Noticia no encontrada');
                return;
            }

            // Cargar fotos adicionales si es necesario (ya deberían estar cargadas)
            
            // Mostrar en el modal
            $('#tituloNoticiaDetalle').html(noticia.asunto);
            $('#contenidoNoticiadetalle').html(u_noticia_profesor.crearNoticiaCompletaHTML(noticia));
            
            // Abrir modal
            if (this.modalInstance) {
                this.modalInstance.show();
            }
        } catch (error) {
            console.error('Error abriendo modal:', error);
            u_noticia_profesor.mostrarMensajeError('Error al cargar la noticia');
        }
    }

    // ========== ACTUALIZAR VISTA ==========
    actualizarVista() {
        // Obtener noticias de la página actual
        const inicio = (this.paginaActual - 1) * this.noticiasPorPagina;
        const fin = inicio + this.noticiasPorPagina;
        const noticiasPagina = this.noticias.slice(inicio, fin);
        
        // Renderizar tarjetas
        u_noticia_profesor.renderizarTarjetas(noticiasPagina);
        
        // Renderizar paginación
        u_noticia_profesor.renderizarPaginacion(
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

    // ========== MÉTODO PARA RECARGAR NOTICIAS (SI SE AGREGA UNA NUEVA) ==========
    async recargarNoticias() {
        this.paginaActual = 1;
        await this.cargarNoticias();
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_noticia_profesor();
    await controlador.inicializar();
});