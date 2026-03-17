/**
 * Controlador para la gestión académica
 * Maneja facultades, departamentos, carreras y asignaturas
 */

import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_academico } from "../utilidades/u_academico.js";
import { m_asignatura, m_carrera, m_departamento, m_facultad } from "../modelo/m_academico.js";

export class c_academico {
    
    /**
     * VARIABLES DE ESTADO
     */
    static facultades = [];
    static departamentos = [];
    static comboDepartamentoControl = null;
    static modoEdicion = {
        facultad: null,
        departamento: null,
        carrera: null,
        asignatura: null
    };
    
    // Variables para paginación (solo para los que la necesitan)
    static paginaActualDepartamentos = 1;
    static totalPaginasDepartamentos = 1;
    
    static paginaActualCarreras = 1;
    static totalPaginasCarreras = 1;
    
    static paginaActualAsignaturas = 1;
    static totalPaginasAsignaturas = 1;

    /**
     * INICIALIZACIÓN
     */

    /**
     * Inicializa el controlador
     */
    static async iniciar() {
        await this.cargarDatosIniciales();
        this.inicializarEventos();
        this.inicializarCombos();
        this.inicializarPestañas();
        this.inicializarPaginacion();
    }

    /**
     * Carga los datos iniciales de todas las entidades
     */
    static async cargarDatosIniciales() {
        try {
            // Facultades se cargan completas (sin paginación)
            await this.cargarFacultades();
            
            // El resto con paginación
            await this.cargarTotalPaginasDepartamentos();
            await this.cargarDepartamentosPaginados(1);
            
            await this.cargarTotalPaginasCarreras();
            await this.cargarCarrerasPaginadas(1);
            
            await this.cargarTotalPaginasAsignaturas();
            await this.cargarAsignaturasPaginadas(1);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos iniciales');
        }
    }

    /**
     * Inicializa los eventos de los botones
     */
    static inicializarEventos() {
        // Botones guardar
        document.getElementById('btnGuardarFacultad')?.addEventListener('click', () => this.guardarFacultad());
        document.getElementById('btnGuardarDepartamento')?.addEventListener('click', () => this.guardarDepartamento());
        document.getElementById('btnGuardarCarrera')?.addEventListener('click', () => this.guardarCarrera());
        document.getElementById('btnGuardarAsignatura')?.addEventListener('click', () => this.guardarAsignatura());

        // Botones de paginación - Departamentos (estos son para los fetch)
        document.getElementById('btnAnteriorDepartamentos')?.addEventListener('click', () => this.irAPaginaAnteriorDepartamentos());
        document.getElementById('btnSiguienteDepartamentos')?.addEventListener('click', () => this.irAPaginaSiguienteDepartamentos());

        // Botones de paginación - Carreras (estos son para los fetch)
        document.getElementById('btnAnteriorCarreras')?.addEventListener('click', () => this.irAPaginaAnteriorCarreras());
        document.getElementById('btnSiguienteCarreras')?.addEventListener('click', () => this.irAPaginaSiguienteCarreras());

        // Botones de paginación - Asignaturas (estos son para los fetch)
        document.getElementById('btnAnteriorAsignaturas')?.addEventListener('click', () => this.irAPaginaAnteriorAsignaturas());
        document.getElementById('btnSiguienteAsignaturas')?.addEventListener('click', () => this.irAPaginaSiguienteAsignaturas());

        // Validaciones en tiempo real
        this.inicializarValidacionesEnTiempoReal();
    }

    /**
     * Inicializa las validaciones en tiempo real
     */
    static inicializarValidacionesEnTiempoReal() {
        // Validaciones facultad
        document.getElementById('nombreFacultad')?.addEventListener('input', (e) => {
            const valido = u_academico.validarNombreFacultad(e.target.value);
            u_utiles.colorearCampo(valido, '#nombreFacultad', '#errorNombreFacultad', 
                valido ? '' : 'El nombre debe tener entre 5 y 100 caracteres');
        });

        document.getElementById('direccionFacultad')?.addEventListener('input', (e) => {
            const valido = u_academico.validarDireccionFacultad(e.target.value);
            u_utiles.colorearCampo(valido, '#direccionFacultad', '#errorDireccionFacultad',
                valido ? '' : 'La dirección debe tener entre 5 y 200 caracteres');
        });

        document.getElementById('correoFacultad')?.addEventListener('input', (e) => {
            const valido = u_academico.validarCorreoFacultad(e.target.value);
            u_utiles.colorearCampo(valido, '#correoFacultad', '#errorCorreoFacultad',
                valido ? '' : 'Formato de correo inválido');
        });

        document.getElementById('telefonoFacultad')?.addEventListener('input', (e) => {
            const valido = u_academico.validarTelefonoFacultad(e.target.value);
            u_utiles.colorearCampo(valido, '#telefonoFacultad', '#errorTelefonoFacultad',
                valido ? '' : 'Formato: +240 222 123 456');
        });

        // Validaciones departamento
        document.getElementById('nombreDepartamento')?.addEventListener('input', (e) => {
            const valido = u_academico.validarNombreDepartamento(e.target.value);
            u_utiles.colorearCampo(valido, '#nombreDepartamento', '#errorNombreDepartamento',
                valido ? '' : 'El nombre debe tener entre 5 y 100 caracteres');

        });

        document.getElementById('facultadesDepartamento')?.addEventListener('change', (e) => {
            const valido = u_academico.validarFacultadSeleccionada(e.target.value);
            u_utiles.colorearCampo(valido, '#facultadesDepartamento', '#errorFacultadesDepartamento',
                valido ? '' : 'Seleccione una facultad');
        });

        // Validaciones carrera
        document.getElementById('nombreCarrera')?.addEventListener('input', (e) => {
            const valido = u_academico.validarNombreCarrera(e.target.value);
            u_utiles.colorearCampo(valido, '#nombreCarrera', '#errorNombreCarrera',
                valido ? '' : 'El nombre debe tener entre 5 y 100 caracteres');
        });

        // Validaciones asignatura
        document.getElementById('nombreAsignatura')?.addEventListener('input', (e) => {
            const valido = u_academico.validarNombreAsignatura(e.target.value);
            u_utiles.colorearCampo(valido, '#nombreAsignatura', '#errorNombreAsignatura',
                valido ? '' : 'El nombre debe tener entre 5 y 100 caracteres');
        });

        document.getElementById('descripcionAsignatura')?.addEventListener('input', (e) => {
            const valido = u_academico.validarDescripcionAsignatura(e.target.value);
            u_utiles.colorearCampo(valido, '#descripcionAsignatura', '#errorDescripcionAsignatura',
                valido ? '' : 'La descripción debe tener entre 10 y 500 caracteres');
        });

        document.getElementById('facultadesAsignatura')?.addEventListener('change', (e) => {
            const valido = u_academico.validarFacultadSeleccionada(e.target.value);
            u_utiles.colorearCampo(valido, '#facultadesAsignatura', '#errorFacultadesAsignatura',
                valido ? '' : 'Seleccione una facultad');
        });
    }

    /**
     * Inicializa los combos de selección
     */
    static async inicializarCombos() {
        await this.cargarSelectFacultades('facultadesDepartamento');
        await this.cargarSelectFacultades('facultadesAsignatura');
        
        if (this.departamentos.departamentos?.length > 0) {
            this.comboDepartamentoControl = u_academico.inicializarComboDepartamentos(
                'comboDepartamentoCarrera',
                'opcionesDepartamentosCarrera',
                this.departamentos.departamentos,
                (id, nombre) => {
                    console.log('Departamento seleccionado:', id, nombre);
                }
            );
        }
    }

    /**
     * Inicializa las pestañas/botones desplegables
     */
    static inicializarPestañas() {
        u_academico.inicializarBotonesDesplegables(
            ['btnDesplegableFacultades', 'btnDesplegableDepartamentos', 'btnDesplegableCarreras', 'btnDesplegableAsignaturas'],
            ['seccionFacultad', 'seccionDepartamento', 'seccionCarrera', 'seccionAsignaturas']
        );
    }

    /**
     * Inicializa los eventos de paginación
     */
    static inicializarPaginacion() {
        this.actualizarEstadoBotonesPaginacionDepartamentos();
        this.actualizarEstadoBotonesPaginacionCarreras();
        this.actualizarEstadoBotonesPaginacionAsignaturas();
    }

    /**
     * CARGA DE DATOS - FACULTADES (SIN PAGINACIÓN)
     */

    /**
     * Carga todas las facultades (sin paginación)
     */
    static async cargarFacultades() {
        try {
            const response = await m_facultad.obtenerFacultades();
            this.facultades = response.datos || response || [];
            this.mostrarFacultadesEnTabla();
        } catch (error) {
            console.error('Error cargando facultades:', error);
            Alerta.error('Error', 'No se pudieron cargar las facultades');
        }
    }

    /**
     * Muestra las facultades en la tabla
     */
    static mostrarFacultadesEnTabla() {
        const tbody = document.getElementById('tbodyTablaFacultades');
        if (!tbody) return;

        // Destruir DataTable si existe
        if ($.fn.dataTable.isDataTable('#tablaFacultades')) {
            $('#tablaFacultades').DataTable().destroy();
        }

        tbody.innerHTML = this.facultades.map(f => `
            <tr>
                <td class="align-middle">${f.nombreFacultad}</td>
                <td class="align-middle">${f.direccionFacultad}</td>
                <td class="align-middle">
                    ${f.correo}<br>
                    <small>${f.telefono}</small>
                </td>
                <td class="align-middle">
                    <div class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-info editar-facultad" data-id="${f.idFacultad}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger eliminar-facultad" data-id="${f.idFacultad}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Inicializar DataTable
        $('#tablaFacultades').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            pageLength: 10,
            order: [[0, 'asc']]
        });
        
        this.agregarEventosBotonesFacultad();
    }

    /**
     * Agrega eventos a los botones de la tabla de facultades
     */
    static agregarEventosBotonesFacultad() {
        document.querySelectorAll('.editar-facultad').forEach(btn => {
            btn.addEventListener('click', () => this.editarFacultad(btn.dataset.id));
        });

        document.querySelectorAll('.eliminar-facultad').forEach(btn => {
            btn.addEventListener('click', () => this.eliminarFacultad(btn.dataset.id));
        });
    }

    /**
     * CARGA DE DATOS - DEPARTAMENTOS (CON PAGINACIÓN EN SERVIDOR)
     */

    /**
     * Carga el total de páginas de departamentos
     */
    static async cargarTotalPaginasDepartamentos() {
        try {
            const response = await m_departamento.obtenerTotalPaginasDepartamento();
            this.totalPaginasDepartamentos = response.total_paginas || 1;
            this.actualizarEstadoBotonesPaginacionDepartamentos();
            this.actualizarIndicadorPaginaDepartamentos();
        } catch (error) {
            console.error('Error cargando total de páginas de departamentos:', error);
        }
    }

    /**
     * Carga departamentos paginados
     * @param {number} pagina - Número de página a cargar
     */
    static async cargarDepartamentosPaginados(pagina) {
        try {
            this.departamentos = await m_departamento.obtenerDepartamentosAPaginar(pagina);
            this.paginaActualDepartamentos = pagina;
            this.mostrarDepartamentosEnTabla();
            this.actualizarEstadoBotonesPaginacionDepartamentos();
            this.actualizarIndicadorPaginaDepartamentos();
        } catch (error) {
            console.error('Error cargando departamentos paginados:', error);
            Alerta.error('Error', 'No se pudieron cargar los departamentos');
        }
    }

    /**
     * Actualiza el estado de los botones de paginación de departamentos
     */
    static actualizarEstadoBotonesPaginacionDepartamentos() {
        const btnAnterior = document.getElementById('btnAnteriorDepartamentos');
        const btnSiguiente = document.getElementById('btnSiguienteDepartamentos');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActualDepartamentos <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActualDepartamentos >= this.totalPaginasDepartamentos;
        }
    }

    /**
     * Actualiza el indicador de página actual de departamentos
     */
    static actualizarIndicadorPaginaDepartamentos() {
        const indicador = document.getElementById('paginaActualDepartamentos');
        if (indicador) {
            indicador.textContent = `Página ${this.paginaActualDepartamentos} de ${this.totalPaginasDepartamentos}`;
        }
    }

    /**
     * Navega a la página anterior de departamentos
     */
    static async irAPaginaAnteriorDepartamentos() {
        if (this.paginaActualDepartamentos > 1) {
            await this.cargarDepartamentosPaginados(this.paginaActualDepartamentos - 1);
        }
    }

    /**
     * Navega a la página siguiente de departamentos
     */
    static async irAPaginaSiguienteDepartamentos() {
        if (this.paginaActualDepartamentos < this.totalPaginasDepartamentos) {
            await this.cargarDepartamentosPaginados(this.paginaActualDepartamentos + 1);
        }
    }

    /**
     * Muestra los departamentos en la tabla
     */
    static mostrarDepartamentosEnTabla() {
        const tbody = document.getElementById('tbodyTablaDepartamentos');
        if (!tbody) return;

        // Destruir DataTable si existe
        if ($.fn.dataTable.isDataTable('#tablaDepartamentos')) {
            $('#tablaDepartamentos').DataTable().destroy();
        }

        tbody.innerHTML = this.departamentos.departamentos?.map(d => {
            const facultad = this.facultades.find(f => f.idFacultad == d.idFacultad);
            return `
                <tr>
                    <td class="align-middle">${d.nombreDepartamento}</td>
                    <td class="align-middle">${facultad ? facultad.nombreFacultad : 'Ninguna'}</td>
                    <td class="align-middle">
                        <div class="d-flex justify-content-center gap-1">
                            <button class="btn btn-sm btn-outline-info editar-departamento" data-id="${d.idDepartamento}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger eliminar-departamento" data-id="${d.idDepartamento}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="3" class="text-center">No hay departamentos</td></tr>';

        // Inicializar DataTable (solo para ordenamiento y búsqueda, la paginación la manejamos nosotros)
        $('#tablaDepartamentos').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            paging: false, // Desactivamos la paginación de DataTable
            searching: true, // Mantenemos búsqueda
            ordering: true, // Mantenemos ordenamiento
            info: false // Ocultamos información de paginación
        });
        
        this.agregarEventosBotonesDepartamento();
    }

    /**
     * Agrega eventos a los botones de la tabla de departamentos
     */
    static agregarEventosBotonesDepartamento() {
        document.querySelectorAll('.editar-departamento').forEach(btn => {
            btn.addEventListener('click', () => this.editarDepartamento(btn.dataset.id));
        });

        document.querySelectorAll('.eliminar-departamento').forEach(btn => {
            btn.addEventListener('click', () => this.eliminarDepartamento(btn.dataset.id));
        });
    }

    /**
     * CARGA DE DATOS - CARRERAS (CON PAGINACIÓN EN SERVIDOR)
     */

    /**
     * Carga el total de páginas de carreras
     */
    static async cargarTotalPaginasCarreras() {
        try {
            const response = await m_carrera.obtenerTotalPaginasCarrera();
            this.totalPaginasCarreras = response.total_paginas || 1;
            this.actualizarEstadoBotonesPaginacionCarreras();
            this.actualizarIndicadorPaginaCarreras();
        } catch (error) {
            console.error('Error cargando total de páginas de carreras:', error);
        }
    }

    /**
     * Carga carreras paginadas
     * @param {number} pagina - Número de página a cargar
     */
    static async cargarCarrerasPaginadas(pagina) {
        try {
            const response = await m_carrera.obtenerCarrerasAPaginar(pagina);
            const carreras = response.datos || response || [];
            this.paginaActualCarreras = pagina;
            this.mostrarCarrerasEnTabla(carreras);
            this.actualizarEstadoBotonesPaginacionCarreras();
            this.actualizarIndicadorPaginaCarreras();
        } catch (error) {
            console.error('Error cargando carreras paginadas:', error);
            Alerta.error('Error', 'No se pudieron cargar las carreras');
        }
    }

    /**
     * Actualiza el estado de los botones de paginación de carreras
     */
    static actualizarEstadoBotonesPaginacionCarreras() {
        const btnAnterior = document.getElementById('btnAnteriorCarreras');
        const btnSiguiente = document.getElementById('btnSiguienteCarreras');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActualCarreras <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActualCarreras >= this.totalPaginasCarreras;
        }
    }

    /**
     * Actualiza el indicador de página actual de carreras
     */
    static actualizarIndicadorPaginaCarreras() {
        const indicador = document.getElementById('paginaActualCarreras');
        if (indicador) {
            indicador.textContent = `Página ${this.paginaActualCarreras} de ${this.totalPaginasCarreras}`;
        }
    }

    /**
     * Navega a la página anterior de carreras
     */
    static async irAPaginaAnteriorCarreras() {
        if (this.paginaActualCarreras > 1) {
            await this.cargarCarrerasPaginadas(this.paginaActualCarreras - 1);
        }
    }

    /**
     * Navega a la página siguiente de carreras
     */
    static async irAPaginaSiguienteCarreras() {
        if (this.paginaActualCarreras < this.totalPaginasCarreras) {
            await this.cargarCarrerasPaginadas(this.paginaActualCarreras + 1);
        }
    }

    /**
     * Muestra las carreras en la tabla
     */
    static mostrarCarrerasEnTabla(carreras) {
        const tbody = document.getElementById('tbodyTablaCarreras');
        if (!tbody) return;

        // Destruir DataTable si existe
        if ($.fn.dataTable.isDataTable('#tablaCarreras')) {
            $('#tablaCarreras').DataTable().destroy();
        }

        tbody.innerHTML = carreras.map(c => {
            const departamento = this.departamentos.departamentos?.find(d => d.idDepartamento == c.idDepartamento);
            const estadoActivo = c.estado === 1 || c.estado === 'activo';
            
            return `
                <tr>
                    <td class="align-middle">${c.nombreCarrera}</td>
                    <td class="align-middle">${departamento ? departamento.nombreDepartamento : 'Ninguno'}</td>
                    <td class="align-middle">
                        <span class="badge ${estadoActivo ? 'bg-success' : 'bg-danger'}">
                            ${estadoActivo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="align-middle">
                        <div class="d-flex justify-content-center gap-1">
                            <button class="btn btn-sm btn-outline-info editar-carrera" data-id="${c.idCarrera}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm ${estadoActivo ? 'btn-outline-warning' : 'btn-outline-success'} toggle-estado-carrera" 
                                    data-id="${c.idCarrera}" 
                                    data-estado="${c.estado}"
                                    title="${estadoActivo ? 'Deshabilitar' : 'Habilitar'}">
                                <i class="fas ${estadoActivo ? 'fa-toggle-off' : 'fa-toggle-on'}"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger eliminar-carrera" data-id="${c.idCarrera}" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="text-center">No hay carreras</td></tr>';

        // Inicializar DataTable (solo para ordenamiento y búsqueda, la paginación la manejamos nosotros)
        $('#tablaCarreras').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            paging: false, // Desactivamos la paginación de DataTable
            searching: true, // Mantenemos búsqueda
            ordering: true, // Mantenemos ordenamiento
            info: false // Ocultamos información de paginación
        });
        
        this.agregarEventosBotonesCarrera();
    }

    /**
     * Agrega eventos a los botones de la tabla de carreras
     */
    static agregarEventosBotonesCarrera() {
        document.querySelectorAll('.editar-carrera').forEach(btn => {
            btn.addEventListener('click', () => this.editarCarrera(btn.dataset.id));
        });

        document.querySelectorAll('.eliminar-carrera').forEach(btn => {
            btn.addEventListener('click', () => this.eliminarCarrera(btn.dataset.id));
        });

        document.querySelectorAll('.toggle-estado-carrera').forEach(btn => {
            btn.addEventListener('click', () => this.toggleEstadoCarrera(btn.dataset.id, btn.dataset.estado));
        });
    }

    /**
     * Cambia el estado de una carrera (activo/inactivo)
     * @param {string} id - ID de la carrera
     * @param {string} estadoActual - Estado actual (1: activo, 0: inactivo)
     */
    static async toggleEstadoCarrera(id, estadoActual) {
        const esActivo = estadoActual == 1 || estadoActual === 'activo';
        const nuevoEstado = esActivo ? 'inactivo' : 'activo';
        const accion = nuevoEstado === 'activo' ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.pregunta(
            `¿${nuevoEstado === 'activo' ? 'Habilitar' : 'Deshabilitar'} carrera?`,
            `Esta acción ${nuevoEstado === 'activo' ? 'activará' : 'desactivará'} la carrera en el sistema`
        );

        if (!confirmacion) return;

        try {
            await m_carrera.cambioEstadoCarrera(id, nuevoEstado);
            Alerta.notificarExito(`Carrera ${accion}da correctamente`);
            await this.cargarCarrerasPaginadas(this.paginaActualCarreras);
        } catch (error) {
            Alerta.error('Error', `No se pudo ${accion} la carrera`);
        }
    }

    /**
     * CARGA DE DATOS - ASIGNATURAS (CON PAGINACIÓN EN SERVIDOR)
     */

    /**
     * Carga el total de páginas de asignaturas
     */
    static async cargarTotalPaginasAsignaturas() {
        try {
            const response = await m_asignatura.obtenerTotalPaginasAsignatura();
            this.totalPaginasAsignaturas = response.total_paginas || 1;
            this.actualizarEstadoBotonesPaginacionAsignaturas();
            this.actualizarIndicadorPaginaAsignaturas();
        } catch (error) {
            console.error('Error cargando total de páginas:', error);
        }
    }

    /**
     * Carga asignaturas paginadas
     * @param {number} pagina - Número de página a cargar
     */
    static async cargarAsignaturasPaginadas(pagina) {
        try {
            const response = await m_asignatura.obtenerAsignaturasAPaginar(pagina);
            const asignaturas = response.datos || response || [];
            this.paginaActualAsignaturas = pagina;
            this.mostrarAsignaturasEnTabla(asignaturas);
            this.actualizarEstadoBotonesPaginacionAsignaturas();
            this.actualizarIndicadorPaginaAsignaturas();
        } catch (error) {
            console.error('Error cargando asignaturas paginadas:', error);
            Alerta.error('Error', 'No se pudieron cargar las asignaturas');
        }
    }

    /**
     * Actualiza el estado de los botones de paginación de asignaturas
     */
    static actualizarEstadoBotonesPaginacionAsignaturas() {
        const btnAnterior = document.getElementById('btnAnteriorAsignaturas');
        const btnSiguiente = document.getElementById('btnSiguienteAsignaturas');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActualAsignaturas <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActualAsignaturas >= this.totalPaginasAsignaturas;
        }
    }

    /**
     * Actualiza el indicador de página actual de asignaturas
     */
    static actualizarIndicadorPaginaAsignaturas() {
        const indicador = document.getElementById('paginaActualAsignaturas');
        if (indicador) {
            indicador.textContent = `Página ${this.paginaActualAsignaturas} de ${this.totalPaginasAsignaturas}`;
        }
    }

    /**
     * Navega a la página anterior de asignaturas
     */
    static async irAPaginaAnteriorAsignaturas() {
        if (this.paginaActualAsignaturas > 1) {
            await this.cargarAsignaturasPaginadas(this.paginaActualAsignaturas - 1);
        }
    }

    /**
     * Navega a la página siguiente de asignaturas
     */
    static async irAPaginaSiguienteAsignaturas() {
        if (this.paginaActualAsignaturas < this.totalPaginasAsignaturas) {
            await this.cargarAsignaturasPaginadas(this.paginaActualAsignaturas + 1);
        }
    }

    /**
     * Muestra las asignaturas en la tabla
     */
    static mostrarAsignaturasEnTabla(asignaturas) {
        const tbody = document.getElementById('tbodyTablaAsignaturas');
        if (!tbody) return;

        // Destruir DataTable si existe
        if ($.fn.dataTable.isDataTable('#tablaAsignaturas')) {
            $('#tablaAsignaturas').DataTable().destroy();
        }

        tbody.innerHTML = asignaturas.map(a => {
            const facultad = this.facultades.find(f => f.idFacultad == a.idFacultad);
            return `
                <tr>
                    <td class="align-middle">${a.codigoAsignatura || 'N/A'}</td>
                    <td class="align-middle">${a.nombreAsignatura}</td>
                    <td class="align-middle text-start">${a.descripcion || ''}</td>
                    <td class="align-middle">${facultad ? facultad.nombreFacultad : 'Ninguna'}</td>
                    <td class="align-middle">
                        <div class="d-flex justify-content-center gap-1">
                            <button class="btn btn-sm btn-outline-info editar-asignatura" data-id="${a.idAsignatura}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger eliminar-asignatura" data-id="${a.idAsignatura}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="5" class="text-center">No hay asignaturas</td></tr>';

        // Inicializar DataTable (solo para ordenamiento y búsqueda, la paginación la manejamos nosotros)
        $('#tablaAsignaturas').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            paging: false, // Desactivamos la paginación de DataTable
            searching: true, // Mantenemos búsqueda
            ordering: true, // Mantenemos ordenamiento
            info: false // Ocultamos información de paginación
        });
        
        this.agregarEventosBotonesAsignatura();
    }

    /**
     * Agrega eventos a los botones de la tabla de asignaturas
     */
    static agregarEventosBotonesAsignatura() {
        document.querySelectorAll('.editar-asignatura').forEach(btn => {
            btn.addEventListener('click', () => this.editarAsignatura(btn.dataset.id));
        });

        document.querySelectorAll('.eliminar-asignatura').forEach(btn => {
            btn.addEventListener('click', () => this.eliminarAsignatura(btn.dataset.id));
        });
    }

    /**
     * CARGA DE SELECTS
     */

    /**
     * Carga el select de facultades
     * @param {string} selectId - ID del select
     */
    static async cargarSelectFacultades(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        try {
            if (this.facultades.length === 0) {
                const response = await m_facultad.obtenerFacultades();
                this.facultades = response.datos || response || [];
            }

            const valorActual = select.value;
            
            select.innerHTML = '<option value="Ninguno">Seleccione una facultad...</option>' +
                this.facultades.map(f => `<option value="${f.idFacultad}">${f.nombreFacultad}</option>`).join('');
            
            if (valorActual && valorActual !== 'Ninguno') {
                const existe = this.facultades.some(f => f.idFacultad.toString() === valorActual.toString());
                if (existe) {
                    select.value = valorActual;
                }
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudieron cargar las facultades');
        }
    }

    /**
     * Genera el código de asignatura
     * @param {string} nombreFacultad - Nombre de la facultad
     * @param {string} nombreAsignatura - Nombre de la asignatura
     * @param {number} numero - Número secuencial
     * @returns {string} - Código generado
     */
    static generarCodigoAsignatura(nombreFacultad, nombreAsignatura, numero) {
        const inicialesFacultad = nombreFacultad
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase())
            .filter(letra => /[A-Z]/.test(letra))
            .join('')
            .substring(0, 2);

        const inicialesAsignatura = nombreAsignatura
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase())
            .filter(letra => /[A-Z]/.test(letra))
            .join('')
            .substring(0, 3);

        const numeroFormateado = numero.toString().padStart(4, '0');

        return `${inicialesFacultad}-${numeroFormateado}-${inicialesAsignatura}`;
    }

    /**
     * Obtiene el siguiente número para el código de asignatura
     * @returns {Promise<number>} - Siguiente número disponible
     */
    static async obtenerSiguienteNumeroAsignatura() {
        try {
            const response = await m_asignatura.obtenerAsignaturasAPaginar(1, 1000);
            const asignaturas = response.datos || response || [];
            
            if (!asignaturas || asignaturas.length === 0) return 1;
            
            const numeros = asignaturas
                .map(a => {
                    const match = a.codigoAsignatura?.match(/-(\d{4})-/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(n => n > 0);
            
            return numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
        } catch (error) {
            console.error('Error obteniendo siguiente número:', error);
            return 1;
        }
    }

    /**
     * GUARDAR ENTIDADES
     */

    /**
     * Guarda una facultad (crea o actualiza)
     */
    static async guardarFacultad() {
        const nombre = document.getElementById('nombreFacultad').value;
        const direccion = document.getElementById('direccionFacultad').value;
        const correo = document.getElementById('correoFacultad').value;
        const telefono = document.getElementById('telefonoFacultad').value;

        const validaciones = {
            nombre: u_academico.validarNombreFacultad(nombre),
            direccion: u_academico.validarDireccionFacultad(direccion),
            correo: u_academico.validarCorreoFacultad(correo),
            telefono: u_academico.validarTelefonoFacultad(telefono)
        };

        u_utiles.colorearCampo(validaciones.nombre, '#nombreFacultad', '#errorNombreFacultad',
            validaciones.nombre ? '' : 'Nombre inválido');
        u_utiles.colorearCampo(validaciones.direccion, '#direccionFacultad', '#errorDireccionFacultad',
            validaciones.direccion ? '' : 'Dirección inválida');
        u_utiles.colorearCampo(validaciones.correo, '#correoFacultad', '#errorCorreoFacultad',
            validaciones.correo ? '' : 'Correo inválido');
        u_utiles.colorearCampo(validaciones.telefono, '#telefonoFacultad', '#errorTelefonoFacultad',
            validaciones.telefono ? '' : 'Teléfono inválido');

        if (!Object.values(validaciones).every(v => v === true)) {
            Alerta.notificarAdvertencia('Campos inválidos. Revise los campos marcados en rojo', 1500);
            return;
        }

        try {
            if (this.modoEdicion.facultad) {
                await m_facultad.actualizarFacultad({
                    idFacultad: this.modoEdicion.facultad,
                    nombreFacultad: nombre,
                    direccionFacultad: direccion,
                    correo: correo,
                    telefono: telefono
                });
                Alerta.notificarExito('Facultad actualizada correctamente');
                this.modoEdicion.facultad = null;
            } else {
                await m_facultad.insertarFacultad({
                    nombreFacultad: nombre,
                    direccionFacultad: direccion,
                    correo: correo,
                    telefono: telefono
                });
                Alerta.notificarExito('Facultad guardada correctamente');
            }

            this.limpiarFormularioFacultad();
            await this.cargarFacultades(); // Recargar todas las facultades
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar la facultad');
        }
    }

    /**
     * Guarda un departamento (crea o actualiza)
     */
    static async guardarDepartamento() {
        const nombre = document.getElementById('nombreDepartamento').value;
        const idFacultad = document.getElementById('facultadesDepartamento').value;

        const validaciones = {
            nombre: u_academico.validarNombreDepartamento(nombre),
            facultad: u_academico.validarFacultadSeleccionada(idFacultad)
        };

        u_utiles.colorearCampo(validaciones.nombre, '#nombreDepartamento', '#errorNombreDepartamento',
            validaciones.nombre ? '' : 'Nombre inválido');
        u_utiles.colorearCampo(validaciones.facultad, '#facultadesDepartamento', '#errorFacultadesDepartamento',
            validaciones.facultad ? '' : 'Seleccione una facultad');

        if (!Object.values(validaciones).every(v => v === true)) {
            Alerta.notificarAdvertencia('Campos inválidos. Revise los campos marcados en rojo', 1500);
            return;
        }

        try {
            if (this.modoEdicion.departamento) {
                await m_departamento.actualizarDepartamento({
                    idDepartamento: this.modoEdicion.departamento,
                    nombreDepartamento: nombre,
                    idFacultad: idFacultad
                });
                Alerta.notificarExito('Departamento actualizado correctamente');
                this.modoEdicion.departamento = null;
            } else {
                await m_departamento.insertarDepartamento({
                    nombreDepartamento: nombre,
                    idFacultad: idFacultad
                });
                Alerta.notificarExito('Departamento guardado correctamente');
            }

            this.limpiarFormularioDepartamento();
            
            // Recargar facultades y departamentos
            await this.cargarFacultades();
            await this.cargarTotalPaginasDepartamentos();
            await this.cargarDepartamentosPaginados(this.paginaActualDepartamentos);
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar el departamento');
        }
    }

    /**
     * Guarda una carrera (crea o actualiza)
     */
    static async guardarCarrera() {
        const nombre = document.getElementById('nombreCarrera').value;
        const idDepartamento = this.comboDepartamentoControl?.getSelectedId();

        const validaciones = {
            nombre: u_academico.validarNombreCarrera(nombre),
            departamento: u_academico.validarDepartamentoCarrera(idDepartamento)
        };

        u_utiles.colorearCampo(validaciones.nombre, '#nombreCarrera', '#errorNombreCarrera',
            validaciones.nombre ? '' : 'Nombre inválido');

        if (!validaciones.departamento) {
            u_utiles.colorearCampo(false, '#comboDepartamentoCarrera', null);
        }

        if (!Object.values(validaciones).every(v => v === true)) {
            Alerta.notificarAdvertencia('Campos inválidos. Seleccione un departamento válido', 1500);
            return;
        }

        try {
            if (this.modoEdicion.carrera) {
                await m_carrera.actualizaCarrera({
                    idCarrera: this.modoEdicion.carrera,
                    nombreCarrera: nombre,
                    idDepartamento: idDepartamento,
                    estado: 'activo'
                });
                Alerta.notificarExito('Carrera actualizada correctamente');
                this.modoEdicion.carrera = null;
            } else {
                await m_carrera.insertaCarrera({
                    nombreCarrera: nombre,
                    idDepartamento: idDepartamento,
                    estado: 'activo'
                });
                Alerta.notificarExito('Carrera guardada correctamente');
            }

            this.limpiarFormularioCarrera();
            
            // Recargar departamentos y carreras
            await this.cargarFacultades();
            await this.cargarTotalPaginasDepartamentos();
            await this.cargarDepartamentosPaginados(this.paginaActualDepartamentos);
            await this.cargarTotalPaginasCarreras();
            await this.cargarCarrerasPaginadas(this.paginaActualCarreras);
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar la carrera');
        }
    }

    /**
     * Guarda una asignatura (crea o actualiza)
     */
    static async guardarAsignatura() {
        const nombre = document.getElementById('nombreAsignatura').value;
        const descripcion = document.getElementById('descripcionAsignatura').value;
        const idFacultad = document.getElementById('facultadesAsignatura').value;

        const validaciones = {
            nombre: u_academico.validarNombreAsignatura(nombre),
            descripcion: u_academico.validarDescripcionAsignatura(descripcion),
            facultad: u_academico.validarFacultadSeleccionada(idFacultad)
        };

        u_utiles.colorearCampo(validaciones.nombre, '#nombreAsignatura', '#errorNombreAsignatura',
            validaciones.nombre ? '' : 'Nombre inválido');
        u_utiles.colorearCampo(validaciones.descripcion, '#descripcionAsignatura', '#errorDescripcionAsignatura',
            validaciones.descripcion ? '' : 'Descripción inválida');
        u_utiles.colorearCampo(validaciones.facultad, '#facultadesAsignatura', '#errorFacultadesAsignatura',
            validaciones.facultad ? '' : 'Seleccione una facultad');

        if (!Object.values(validaciones).every(v => v === true)) {
            Alerta.advertencia('Campos inválidos', 'Revise los campos marcados en rojo');
            return;
        }

        try {
            const facultad = this.facultades.find(f => f.idFacultad == idFacultad);
            
            if (!facultad) {
                Alerta.error('Error', 'No se encontró la facultad seleccionada');
                return;
            }

            if (this.modoEdicion.asignatura) {
                const response = await m_asignatura.obtenerAsignaturasAPaginar(1, 1000);
                const asignaturas = response.datos || response || [];
                const asignaturaActual = asignaturas.find(a => a.idAsignatura == this.modoEdicion.asignatura);

                await m_asignatura.actualizarAsignatura({
                    idAsignatura: this.modoEdicion.asignatura,
                    codigoAsignatura: asignaturaActual.codigoAsignatura,
                    nombreAsignatura: nombre,
                    descripcion: descripcion,
                    idFacultad: idFacultad
                });
                Alerta.notificarExito('Asignatura actualizada correctamente');
                this.modoEdicion.asignatura = null;
            } else {
                const siguienteNumero = await this.obtenerSiguienteNumeroAsignatura();
                const codigo = this.generarCodigoAsignatura(
                    facultad.nombreFacultad,
                    nombre,
                    siguienteNumero
                );

                await m_asignatura.insertarAsignatura({
                    codigoAsignatura: codigo,
                    nombreAsignatura: nombre,
                    descripcion: descripcion,
                    idFacultad: idFacultad
                });
                Alerta.notificarExito('Asignatura guardada correctamente');
            }

            this.limpiarFormularioAsignatura();
            await this.cargarTotalPaginasAsignaturas();
            await this.cargarAsignaturasPaginadas(this.paginaActualAsignaturas);
        } catch (error) {
            console.error('Error guardando asignatura:', error);
            Alerta.error('Error', 'No se pudo guardar la asignatura');
        }
    }

    /**
     * EDITAR ENTIDADES
     */

    /**
     * Prepara el formulario para editar una facultad
     * @param {string} id - ID de la facultad
     */
    static async editarFacultad(id) {
        const facultad = this.facultades.find(f => f.idFacultad == id);
        if (!facultad) return;

        document.getElementById('nombreFacultad').value = facultad.nombreFacultad;
        document.getElementById('direccionFacultad').value = facultad.direccionFacultad;
        document.getElementById('correoFacultad').value = facultad.correo;
        document.getElementById('telefonoFacultad').value = facultad.telefono;

        u_utiles.colorearCampo(true, '#nombreFacultad', '#errorNombreFacultad');
        u_utiles.colorearCampo(true, '#direccionFacultad', '#errorDireccionFacultad');
        u_utiles.colorearCampo(true, '#correoFacultad', '#errorCorreoFacultad');
        u_utiles.colorearCampo(true, '#telefonoFacultad', '#errorTelefonoFacultad');

        this.modoEdicion.facultad = id;
        
        const btn = document.getElementById('btnGuardarFacultad');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-sync-alt"></i></span> <span class="text">Actualizar</span>';
    }

    /**
     * Prepara el formulario para editar un departamento
     * @param {string} id - ID del departamento
     */
    static async editarDepartamento(id) {
        const departamento = this.departamentos.departamentos?.find(d => d.idDepartamento == id);
        if (!departamento) return;

        document.getElementById('nombreDepartamento').value = departamento.nombreDepartamento;
        document.getElementById('facultadesDepartamento').value = departamento.idFacultad;

        u_utiles.colorearCampo(true, '#nombreDepartamento', '#errorNombreDepartamento');
        u_utiles.colorearCampo(true, '#facultadesDepartamento', '#errorFacultadesDepartamento');

        this.modoEdicion.departamento = id;
        
        const btn = document.getElementById('btnGuardarDepartamento');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-sync-alt"></i></span> <span class="text">Actualizar</span>';
    }

    /**
     * Prepara el formulario para editar una carrera
     * @param {string} id - ID de la carrera
     */
    static async editarCarrera(id) {
        const response = await m_carrera.obtenerCarrerasAPaginar(1, 1000);
        const carreras = response.datos || response || [];
        const carrera = carreras.find(c => c.idCarrera == id);
        if (!carrera) return;

        const deptResponse = await m_departamento.obtenerDepartamentosAPaginar(1);
        this.departamentos = deptResponse;
        const departamento = this.departamentos.departamentos?.find(d => d.idDepartamento == carrera.idDepartamento);

        document.getElementById('nombreCarrera').value = carrera.nombreCarrera;
        
        if (this.comboDepartamentoControl && departamento) {
            this.comboDepartamentoControl.setSelected(departamento.idDepartamento, departamento.nombreDepartamento);
        }

        u_utiles.colorearCampo(true, '#nombreCarrera', '#errorNombreCarrera');

        this.modoEdicion.carrera = id;
        
        const btn = document.getElementById('btnGuardarCarrera');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-sync-alt"></i></span> <span class="text">Actualizar</span>';
    }

    /**
     * Prepara el formulario para editar una asignatura
     * @param {string} id - ID de la asignatura
     */
    static async editarAsignatura(id) {
        const response = await m_asignatura.obtenerAsignaturasAPaginar(1, 1000);
        const asignaturas = response.datos || response || [];
        const asignatura = asignaturas.find(a => a.idAsignatura == id); 
        if (!asignatura) return;

        if (this.facultades.length === 0) {
            const facResponse = await m_facultad.obtenerFacultades();
            this.facultades = facResponse.datos || facResponse || [];
        }

        const selectFacultad = document.getElementById('facultadesAsignatura');
        
        if (selectFacultad.options.length <= 1) {
            selectFacultad.innerHTML = '<option value="Ninguno">Seleccione una facultad...</option>' +
                this.facultades.map(f => `<option value="${f.idFacultad}">${f.nombreFacultad}</option>`).join('');
        }

        document.getElementById('nombreAsignatura').value = asignatura.nombreAsignatura;
        document.getElementById('descripcionAsignatura').value = asignatura.descripcion || '';
        
        selectFacultad.value = asignatura.idFacultad.toString();

        if (selectFacultad.value !== asignatura.idFacultad.toString()) {
            for (let i = 0; i < selectFacultad.options.length; i++) {
                if (selectFacultad.options[i].value === asignatura.idFacultad.toString()) {
                    selectFacultad.selectedIndex = i;
                    break;
                }
            }
        }

        u_utiles.colorearCampo(true, '#nombreAsignatura', '#errorNombreAsignatura');
        u_utiles.colorearCampo(true, '#descripcionAsignatura', '#errorDescripcionAsignatura');
        u_utiles.colorearCampo(true, '#facultadesAsignatura', '#errorFacultadesAsignatura');

        this.modoEdicion.asignatura = id;
        
        const btn = document.getElementById('btnGuardarAsignatura');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-sync-alt"></i></span> <span class="text">Actualizar</span>';
    }

    /**
     * ELIMINAR ENTIDADES
     */

    /**
     * Elimina una facultad
     * @param {string} id - ID de la facultad
     */
    static async eliminarFacultad(id) {
        const confirmacion = await Alerta.pregunta(
            '¿Eliminar facultad?',
            'Esta acción no se puede deshacer'
        );

        if (!confirmacion) return;

        try {
            await m_facultad.eliminarFacultad(id);
            Alerta.notificarExito('Facultad eliminada correctamente');
            
            await this.cargarFacultades();
        } catch (error) {
            Alerta.error('Error', 'No se pudo eliminar la facultad');
        }
    }

    /**
     * Elimina un departamento
     * @param {string} id - ID del departamento
     */
    static async eliminarDepartamento(id) {
        const confirmacion = await Alerta.pregunta(
            '¿Eliminar departamento?',
            'Esta acción no se puede deshacer'
        );

        if (!confirmacion) return;

        try {
            await m_departamento.eliminarDepartamento(id);
            Alerta.notificarExito('Departamento eliminado correctamente');
            
            await this.cargarTotalPaginasDepartamentos();
            
            if (this.paginaActualDepartamentos > this.totalPaginasDepartamentos) {
                this.paginaActualDepartamentos = this.totalPaginasDepartamentos;
            }
            
            await this.cargarDepartamentosPaginados(this.paginaActualDepartamentos);
        } catch (error) {
            Alerta.error('Error', 'No se pudo eliminar el departamento');
        }
    }

    /**
     * Elimina una carrera
     * @param {string} id - ID de la carrera
     */
    static async eliminarCarrera(id) {
        const confirmacion = await Alerta.pregunta(
            '¿Eliminar carrera?',
            'Esta acción no se puede deshacer'
        );

        if (!confirmacion) return;

        try {
            await m_carrera.eliminarCarrera(id);
            Alerta.notificarExito('Carrera eliminada correctamente');
            
            await this.cargarTotalPaginasCarreras();
            
            if (this.paginaActualCarreras > this.totalPaginasCarreras) {
                this.paginaActualCarreras = this.totalPaginasCarreras;
            }
            
            await this.cargarCarrerasPaginadas(this.paginaActualCarreras);
        } catch (error) {
            Alerta.error('Error', 'No se pudo eliminar la carrera');
        }
    }

    /**
     * Elimina una asignatura
     * @param {string} id - ID de la asignatura
     */
    static async eliminarAsignatura(id) {
        const confirmacion = await Alerta.pregunta(
            '¿Eliminar asignatura?',
            'Esta acción no se puede deshacer'
        );

        if (!confirmacion) return;

        try {
            await m_asignatura.eliminarAsignatura(id);
            Alerta.notificarExito('Asignatura eliminada correctamente');
            
            await this.cargarTotalPaginasAsignaturas();
            
            if (this.paginaActualAsignaturas > this.totalPaginasAsignaturas) {
                this.paginaActualAsignaturas = this.totalPaginasAsignaturas;
            }
            
            await this.cargarAsignaturasPaginadas(this.paginaActualAsignaturas);
        } catch (error) {
            Alerta.error('Error', 'No se pudo eliminar la asignatura');
        }
    }

    /**
     * LIMPIAR FORMULARIOS
     */

    /**
     * Limpia el formulario de facultad
     */
    static limpiarFormularioFacultad() {
        document.getElementById('nombreFacultad').value = '';
        document.getElementById('direccionFacultad').value = '';
        document.getElementById('correoFacultad').value = '';
        document.getElementById('telefonoFacultad').value = '';

        ['#nombreFacultad', '#direccionFacultad', '#correoFacultad', '#telefonoFacultad'].forEach(id => {
            document.querySelector(id)?.classList.remove('border-success', 'border-danger');
        });

        this.modoEdicion.facultad = null;
        
        const btn = document.getElementById('btnGuardarFacultad');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-save"></i></span> <span class="text">Guardar</span>';
    }

    /**
     * Limpia el formulario de departamento
     */
    static limpiarFormularioDepartamento() {
        document.getElementById('nombreDepartamento').value = '';
        document.getElementById('facultadesDepartamento').value = 'Ninguno';

        ['#nombreDepartamento', '#facultadesDepartamento'].forEach(id => {
            document.querySelector(id)?.classList.remove('border-success', 'border-danger');
        });

        this.modoEdicion.departamento = null;
        
        const btn = document.getElementById('btnGuardarDepartamento');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-save"></i></span> <span class="text">Guardar</span>';
    }

    /**
     * Limpia el formulario de carrera
     */
    static limpiarFormularioCarrera() {
        document.getElementById('nombreCarrera').value = '';
        
        if (this.comboDepartamentoControl) {
            this.comboDepartamentoControl.setSelected(null, '');
        }

        document.querySelector('#nombreCarrera')?.classList.remove('border-success', 'border-danger');
        document.querySelector('#comboDepartamentoCarrera')?.classList.remove('border-success', 'border-danger');

        this.modoEdicion.carrera = null;
        
        const btn = document.getElementById('btnGuardarCarrera');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-save"></i></span> <span class="text">Guardar</span>';
    }

    /**
     * Limpia el formulario de asignatura
     */
    static limpiarFormularioAsignatura() {
        document.getElementById('nombreAsignatura').value = '';
        document.getElementById('descripcionAsignatura').value = '';
        document.getElementById('facultadesAsignatura').value = 'Ninguno';

        ['#nombreAsignatura', '#descripcionAsignatura', '#facultadesAsignatura'].forEach(id => {
            document.querySelector(id)?.classList.remove('border-success', 'border-danger');
        });

        this.modoEdicion.asignatura = null;
        
        const btn = document.getElementById('btnGuardarAsignatura');
        btn.innerHTML = '<span class="icon text-white-50"><i class="fas fa-save"></i></span> <span class="text">Guardar</span>';
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionAdministrador();
    
    await c_academico.iniciar();
});