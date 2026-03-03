import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_curso {
    
    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarNivel(valor) {
        return valor > 0 && valor < 10; // Nivel entre 1 y 9
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre del curso
        $('#nombreCurso').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_curso.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreCurso', '#errorNombreCurso', 'Mínimo 3 caracteres');
        });

        // Validación del nivel del curso
        $('#nivelCurso').on('input', function() {
            const valor = $(this).val();
            const valido = valor > 0 && valor < 10;
            u_utiles.colorearCampo(valido, '#nivelCurso', '#errorNivelCurso', 'Nivel debe ser entre 1 y 9');
        });

        // Validaciones para semestre
        $('#numeroSemestre').on('input', function() {
            const valor = $(this).val();
            const valido = valor > 0 && valor < 15; // Semestre entre 1 y 14
            u_utiles.colorearCampo(valido, '#numeroSemestre', '#errorNumeroSemestre', 'Semestre entre 1 y 14');
        });

        $('#cursoSemestre').on('change', function() {
            const valor = $(this).val();
            const valido = valor && valor !== 'Ninguno';
            u_utiles.colorearCampo(valido, '#cursoSemestre', '#errorCursoSemestre', 'Seleccione un curso');
        });
    }

    // ========== DETERMINAR TIPO DE SEMESTRE ==========
    static determinarTipoSemestre(numero) {
        return numero % 2 === 0 ? 'Par' : 'Impar';
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo, tipo) {
        if (tipo === 'curso') {
            if (activo) {
                $('#btnGuardarCurso').text('Actualizar');
                if ($('#btnCancelarEdicionCurso').length === 0) {
                    $('#btnGuardarCurso').after(`
                        <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicionCurso">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `);
                }
            } else {
                $('#btnGuardarCurso').text('Guardar');
                $('#btnCancelarEdicionCurso').remove();
            }
        } else if (tipo === 'semestre') {
            if (activo) {
                $('#btnGuardarSemestre').text('Actualizar');
                if ($('#btnCancelarEdicionSemestre').length === 0) {
                    $('#btnGuardarSemestre').after(`
                        <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicionSemestre">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `);
                }
            } else {
                $('#btnGuardarSemestre').text('Guardar');
                $('#btnCancelarEdicionSemestre').remove();
            }
        }
    }

    // ========== GENERAR BOTONES PARA CURSO ==========
    static generarBotonesCurso(id, habilitado) {
        const iconoToggle = habilitado == 1 ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = habilitado == 1 ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = habilitado == 1 ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-curso" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseToggle} toggle-estado-curso" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
                </button>
            </div>
        `;
    }

    // ========== GENERAR BOTONES PARA SEMESTRE ==========
    static generarBotonesSemestre(id, habilitado) {
        const iconoToggle = habilitado == 1 ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = habilitado == 1 ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = habilitado == 1 ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-semestre" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseToggle} toggle-estado-semestre" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE CURSOS ==========
    static actualizarTablaCursos(dataTable, cursos) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        cursos.forEach(c => {
            const fila = [
                c.nombreCurso,
                c.nivel,
                this.generarBotonesCurso(c.idCurso, c.habilitado)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            // Si está deshabilitado, atenuar la fila
            if (c.habilitado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }

    // ========== ACTUALIZAR TABLA DE SEMESTRES ==========
    static actualizarTablaSemestres(dataTable, semestres, cursos) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        semestres.forEach(s => {
            // Buscar el nombre del curso al que pertenece el semestre
            const curso = cursos.find(c => c.idCurso == s.idCurso);
            const nombreCurso = curso ? curso.nombreCurso : 'Desconocido';
            
            // Determinar el tipo de semestre (Par/Impar)
            const tipo = u_curso.determinarTipoSemestre(s.numeroSemestre);
            
            const fila = [
                s.numeroSemestre,
                tipo,
                nombreCurso,
                this.generarBotonesSemestre(s.idSemestre, s.habilitado)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            // Si está deshabilitado, atenuar la fila
            if (s.habilitado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }

    // ========== CARGAR CURSOS EN EL SELECT DE SEMESTRE ==========
    static cargarCursosEnSelect(cursos) {
        const select = $('#cursoSemestre');
        select.empty();
        select.append('<option value="Ninguno">Seleccione</option>');
        
        cursos.forEach(c => {
            select.append(`<option value="${c.idCurso}">${c.nombreCurso}</option>`);
        });
    }
}