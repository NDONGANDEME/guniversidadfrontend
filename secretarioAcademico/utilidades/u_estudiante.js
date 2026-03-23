import { Alerta } from "../../public/utilidades/u_alertas.js";

/**
 * Utilidades para la gestión de estudiantes
 * Contiene funciones para renderizar tarjetas, listas y formato de datos
 */
export class u_estudiante {
    
    /**
     * URL base para imágenes
     */
    static urlBase = '/guniversidadfrontend/public/img';

    /**
     * CREAR TARJETA DE ESTUDIANTE HTML
     */
    static crearTarjetaEstudianteHTML(estudiante, permisos) {
        // Obtener foto o icono por defecto
        let fotoHtml = '<i class="fas fa-user-graduate fa-3x text-muted"></i>';
        
        if (estudiante.foto) {
            const fotoUrl = estudiante.foto.url_completa || estudiante.foto;
            if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.length > 0) {
                fotoHtml = `<img src="${this.escapeHTML(fotoUrl)}" alt="${this.escapeHTML(estudiante.nombre)}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;" onerror="this.onerror=null;this.src='';this.style.display='none';this.nextSibling.style.display='flex';">`;
                fotoHtml += `<div style="display: none;" class="d-flex justify-content-center align-items-center bg-light rounded-circle" style="width: 60px; height: 60px;"><i class="fas fa-user-graduate fa-3x text-muted"></i></div>`;
            } else {
                fotoHtml = '<div class="d-flex justify-content-center align-items-center bg-light rounded-circle" style="width: 60px; height: 60px;"><i class="fas fa-user-graduate fa-3x text-muted"></i></div>';
            }
        }

        // Estado del estudiante
        const estadoActivo = estudiante.estado === 'activo' || estudiante.estado === 1;
        const estadoBadge = estadoActivo 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        // Nombre completo
        const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim();

        // Generar botones según permisos
        let botonesHtml = '';
        
        // Botón visualizar (siempre visible)
        botonesHtml += `
            <button class="btn btn-sm btn-outline-info visualizar-estudiante" title="Visualizar" data-id="${estudiante.idEstudiante}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // Botón editar (solo si tiene permiso)
        if (permisos.actualizarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-warning editar-estudiante" title="Editar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }
        
        // Botón eliminar (solo si tiene permiso)
        if (permisos.eliminarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-danger eliminar-estudiante" title="Eliminar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm estudiante-card">
                    <div class="card-body text-center">
                        <div class="mb-3 d-flex justify-content-center">
                            ${fotoHtml}
                        </div>
                        <h5 class="card-title">${this.escapeHTML(nombreCompleto || 'Sin nombre')}</h5>
                        <p class="card-text text-muted small">
                            <strong>Código:</strong> ${this.escapeHTML(estudiante.codigoEstudiante || 'N/A')}<br>
                            <strong>DIP:</strong> ${this.escapeHTML(estudiante.dipEstudiante || 'N/A')}
                        </p>
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            ${estadoBadge}
                        </div>
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            ${botonesHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * CREAR FILA DE LISTA HTML
     */
    static crearFilaListaHTML(estudiante, permisos) {
        const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim();
        const estadoActivo = estudiante.estado === 'activo' || estudiante.estado === 1;
        const estadoBadge = estadoActivo 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        // Generar botones según permisos
        let botonesHtml = '';
        
        botonesHtml += `
            <button class="btn btn-sm btn-outline-info visualizar-estudiante me-1" title="Visualizar" data-id="${estudiante.idEstudiante}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        if (permisos.actualizarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-warning editar-estudiante me-1" title="Editar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }
        
        if (permisos.eliminarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-danger eliminar-estudiante" title="Eliminar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        return `
            <tr>
                <td>${this.escapeHTML(estudiante.codigoEstudiante || 'N/A')}</td>
                <td>${this.escapeHTML(nombreCompleto)}</td>
                <td>${this.escapeHTML(estudiante.dipEstudiante || 'N/A')}</td>
                <td>${this.escapeHTML(estudiante.correoEstudiante || '-')}</td>
                <td>${this.escapeHTML(estudiante.telefono || '-')}</td>
                <td>${botonesHtml}</td>
            </tr>
        `;
    }

    /**
     * CREAR TARJETA DE MATRÍCULA HTML
     */
    static crearTarjetaMatriculaHTML(matricula, permisos) {
        const estadoActivo = matricula.estado === 'Completo' || matricula.estado === 'Completada';
        const estadoBadge = estadoActivo 
            ? '<span class="badge bg-success">Completada</span>' 
            : '<span class="badge bg-warning text-dark">Incompleta</span>';
        
        let botonesHtml = '';
        
        if (permisos.actualizarMatricula) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-warning editar-matricula" title="Editar matrícula" data-id="${matricula.idMatricula}">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }
        
        if (permisos.eliminarMatricula) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-danger eliminar-matricula" title="Eliminar matrícula" data-id="${matricula.idMatricula}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        return `
            <div class="col-md-6 mb-3">
                <div class="card shadow-sm">
                    <div class="card-header bg-warning text-dark">
                        <strong>Curso: ${this.escapeHTML(matricula.cursoAcademico)}</strong>
                    </div>
                    <div class="card-body">
                        <p><strong>Fecha:</strong> ${this.formatearFecha(matricula.fechaMatricula)}</p>
                        <p><strong>Modalidad:</strong> ${this.escapeHTML(matricula.modalidadMatricula)}</p>
                        <p><strong>Créditos:</strong> ${this.escapeHTML(matricula.totalCreditos)}</p>
                        <p><strong>Estado:</strong> ${estadoBadge}</p>
                        <div class="d-flex gap-2 mt-2">
                            ${botonesHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * ESCAPAR HTML PARA PREVENIR XSS
     */
    static escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * FORMATEAR FECHA
     */
    static formatearFecha(fecha) {
        if (!fecha) return '';
        try {
            const date = new Date(fecha);
            if (isNaN(date.getTime())) return fecha;
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return fecha;
        }
    }
}