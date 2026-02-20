export const Alerta = {
    /**
     * Muestra un modal de carga con redirección automática
     * @param {number} tiempo - Tiempo en milisegundos
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} url - URL para redireccionar
     */
    cargarSimple: function(tiempo = 3000, mensaje, url) {
        // Crear estructura del modal
        const modalId = 'loadingModal' + Date.now();
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" 
                 data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-body text-center p-5">
                            <!-- Spinner con color personalizado -->
                            <div class="mb-4">
                                <div class="spinner-border" style="width: 70px; height: 70px; color: #ffd600 !important;" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                            
                            <!-- Mensaje -->
                            <h5 class="text-dark mb-3 fw-semibold">${mensaje}</h5>
                            
                            <!-- Barra de progreso con color personalizado -->
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                    role="progressbar" 
                                    style="width: 100%; background-color: #ffd600 !important;" 
                                    aria-valuenow="100" 
                                    aria-valuemin="0" 
                                    aria-valuemax="100">
                                </div>
                            </div>
                            
                            <!-- Texto adicional -->
                            <small class="text-muted d-block mt-3">
                                Redireccionando automáticamente...
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Obtener elementos
        const modalElement = document.getElementById(modalId);
        
        // Forzar a que el modal se muestre
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        modalElement.setAttribute('aria-hidden', 'false');
        
        // Añadir backdrop manualmente
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
        
        // Configurar redirección
        setTimeout(() => {
            // Remover backdrop
            if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            
            // Ocultar modal
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            modalElement.setAttribute('aria-hidden', 'true');
            
            // Remover elementos del DOM
            setTimeout(() => {
                if (modalElement.parentNode) {
                    modalElement.parentNode.removeChild(modalElement);
                }
                if (url) {
                    window.location.href = url;
                }
            }, 300);
        }, tiempo);
    },


    /***************************************************************************/
    /* MÉTODOS DE NOTIFICACIONES TOAST */
    /***************************************************************************/
    
    /**
     * Muestra una notificación toast (mensajes no intrusivos)
     * @param {string} tipo - success, error, warning, info
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en milisegundos
     */
    notificar: function(tipo = 'info', mensaje, duracion = 5000) {
        const toastId = 'toast-' + Date.now();
        const tipoBootstrap = this._mapearTipoBootstrap(tipo);
        const icono = this._obtenerIcono(tipo, false);
        
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center border-0" 
                 role="alert" aria-live="assertive" aria-atomic="true"
                 style="background-color: ${tipoBootstrap === 'warning' ? '#ffd600' : 
                                         tipoBootstrap === 'danger' ? '#dc3545' :
                                         tipoBootstrap === 'success' ? '#198754' :
                                         tipoBootstrap === 'info' ? '#0dcaf0' : '#6c757d'};
                        color: ${tipoBootstrap === 'warning' ? '#000000' : '#ffffff'};">
                <div class="d-flex">
                    <div class="toast-body p-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3 fs-4">
                                ${icono}
                            </div>
                            <div class="flex-grow-1">
                                ${mensaje}
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn-close ${tipoBootstrap === 'warning' ? 'btn-close-dark' : 'btn-close-white'}" 
                            data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        // Crear contenedor de toasts si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '999999';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: duracion
        });
        
        toast.show();
        
        // Remover del DOM cuando se oculte
        toastElement.addEventListener('hidden.bs.toast', function() {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        });
    },


    /***************************************************************************/
    /* MÉTODOS DE ALERTAS MODALES (DIÁLOGOS) */
    /***************************************************************************/
    
    /**
     * Muestra una alerta personalizada
     * @param {string} tipo - success, error, warning, info, question
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise} Promise que resuelve con la acción del usuario
     */
    mostrar: function(tipo, titulo, texto = '', opciones = {}) 
    {
        return new Promise((resolve) => {
            const alertaId = 'alerta-' + Date.now();
            const tipoBootstrap = this._mapearTipoBootstrap(tipo);
            const icono = this._obtenerIcono(tipo, true);
            
            // Determinar color del botón basado en el tipo
            let claseBoton = 'btn-';
            if (tipo === 'warning' || tipo === 'question') {
                claseBoton += 'warning';
            } else {
                claseBoton += tipoBootstrap;
            }
            
            // Configuración por defecto
            const config = {
                textoConfirmar: 'Aceptar',
                textoCancelar: 'Cancelar',
                mostrarCancelar: tipo === 'question',
                temporizador: null,
                ...opciones
            };
            
            // Crear alerta con Bootstrap
            const alertaHTML = `
                <div id="${alertaId}" class="modal fade" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 shadow-lg">
                            <div class="modal-body p-4">
                                <!-- Encabezado -->
                                <div class="text-center mb-3">
                                    <div class="mb-3" style="font-size: 2rem; ${tipo === 'warning' ? 'color: #ffd600 !important;' : `color: var(--bs-${tipoBootstrap})`}">
                                        ${icono}
                                    </div>
                                    <h4 class="modal-title text-dark fw-bold mb-2">${titulo}</h4>
                                    ${texto ? `<p class="text-muted mb-0">${texto}</p>` : ''}
                                </div>
                                
                                <!-- Botones -->
                                <div class="d-flex justify-content-center gap-3 mt-4">
                                    ${config.mostrarCancelar ? 
                                        `<button type="button" class="btn btn-outline-secondary btn-cancel" 
                                                style="min-width: 100px;">
                                            ${config.textoCancelar}
                                        </button>` : ''}
                                    <button type="button" class="btn ${claseBoton} btn-confirm" 
                                            style="min-width: 100px;">
                                        ${config.textoConfirmar}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Añadir al DOM
            document.body.insertAdjacentHTML('beforeend', alertaHTML);
            const alertaElement = document.getElementById(alertaId);
            const modal = new bootstrap.Modal(alertaElement);
            
            // Configurar eventos
            const btnConfirm = alertaElement.querySelector('.btn-confirm');
            const btnCancel = alertaElement.querySelector('.btn-cancel');
            
            const cerrarYResolver = (resultado) => {
                modal.hide();
                setTimeout(() => {
                    if (alertaElement.parentNode) {
                        alertaElement.parentNode.removeChild(alertaElement);
                    }
                    resolve(resultado);
                }, 300);
            };
            
            btnConfirm.addEventListener('click', () => cerrarYResolver(true));
            
            if (btnCancel) {
                btnCancel.addEventListener('click', () => cerrarYResolver(false));
            }
            
            // Cerrar al hacer clic fuera
            alertaElement.addEventListener('hidden.bs.modal', () => {
                cerrarYResolver(false);
            });
            
            // Temporizador automático
            if (config.temporizador) {
                setTimeout(() => cerrarYResolver(null), config.temporizador);
            }
            
            // Mostrar alerta
            modal.show();
        });
    },


    /***************************************************************************/
    /* MÉTODOS RÁPIDOS (SUGAR SYNTAX) PARA ALERTAS */
    /***************************************************************************/
    
    /**
     * Muestra una alerta de éxito
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise}
     */
    exito: function(titulo, texto = '', opciones = {}) {
        return this.mostrar('success', titulo, texto, opciones);
    },
    
    /**
     * Muestra una alerta de error
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise}
     */
    error: function(titulo, texto = '', opciones = {}) {
        return this.mostrar('error', titulo, texto, opciones);
    },
    
    /**
     * Muestra una alerta de advertencia (usando tu color amarillo)
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise}
     */
    advertencia: function(titulo, texto = '', opciones = {}) {
        return this.mostrar('warning', titulo, texto, opciones);
    },
    
    /**
     * Muestra una alerta de información
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise}
     */
    informacion: function(titulo, texto = '', opciones = {}) {
        return this.mostrar('info', titulo, texto, opciones);
    },
    
    /**
     * Muestra una alerta de pregunta/confirmación
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise} - Resuelve true (Sí) o false (No)
     */
    pregunta: function(titulo, texto = '', opciones = {}) {
        const opcionesDefault = {
            textoConfirmar: 'Sí',
            textoCancelar: 'No',
            mostrarCancelar: true,
            ...opciones
        };
        return this.mostrar('question', titulo, texto, opcionesDefault);
    },
    
    /**
     * Alias de pregunta() para mayor claridad
     * @param {string} titulo - Título de la alerta
     * @param {string} texto - Texto adicional (opcional)
     * @param {Object} opciones - Opciones de configuración
     * @returns {Promise}
     */
    confirmar: function(titulo, texto = '', opciones = {}) {
        return this.pregunta(titulo, texto, opciones);
    },


    /***************************************************************************/
    /* MÉTODOS RÁPIDOS PARA NOTIFICACIONES TOAST */
    /***************************************************************************/
    
    /**
     * Muestra un toast de éxito
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en milisegundos
     */
    notificarExito: function(mensaje, duracion = 5000) {
        this.notificar('success', mensaje, duracion);
    },
    
    /**
     * Muestra un toast de error
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en milisegundos
     */
    notificarError: function(mensaje, duracion = 5000) {
        this.notificar('error', mensaje, duracion);
    },
    
    /**
     * Muestra un toast de advertencia (usando tu color amarillo)
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en milisegundos
     */
    notificarAdvertencia: function(mensaje, duracion = 5000) {
        this.notificar('warning', mensaje, duracion);
    },
    
    /**
     * Muestra un toast de información
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en milisegundos
     */
    notificarInfo: function(mensaje, duracion = 5000) {
        this.notificar('info', mensaje, duracion);
    },


    /***************************************************************************/
    /* MÉTODOS RÁPIDOS PARA MODALES DE CARGA */
    /***************************************************************************/
    
    /**
     * Muestra un modal de carga y redirige después
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} url - URL para redireccionar
     * @param {number} tiempo - Tiempo en milisegundos
     */
    cargarYRedirigir: function(mensaje, url, tiempo = 3000) {
        this.cargarSimple(tiempo, mensaje, url);
    },
    
    /**
     * Muestra un modal de carga sin redirección
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} tiempo - Tiempo en milisegundos
     */
    cargar: function(mensaje, tiempo = 3000) {
        this.cargarSimple(tiempo, mensaje);
    },

    
    /***************************************************************************/
    /* MÉTODOS AUXILIARES INTERNOS */
    /***************************************************************************/
    
    /**
     * Mapea tipos amigables a clases de Bootstrap
     * @private
     */
    _mapearTipoBootstrap: function(tipo) {
        const mapa = {
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'info',
            question: 'primary'
        };
        return mapa[tipo] || 'primary';
    },
    
    /**
     * Obtiene el icono correspondiente según el tipo
     * @private
     */
    _obtenerIcono: function(tipo, grande = false) {
        // Para modales (grande = true) usamos tamaño 2rem, para toasts (grande = false) usamos tamaño normal
        const tamaño = grande ? ' style="font-size: 2rem;"' : '';
        const iconos = {
            success: `<i class="fas fa-check-circle"${tamaño}></i>`,
            error: `<i class="fas fa-times-circle"${tamaño}></i>`,
            warning: `<i class="fas fa-exclamation-triangle"${tamaño}></i>`,
            info: `<i class="fas fa-info-circle"${tamaño}></i>`,
            question: `<i class="fas fa-question-circle"${tamaño}></i>`
        };
        return iconos[tipo] || iconos.info;
    }
};