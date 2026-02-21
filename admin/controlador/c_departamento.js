import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_departamento } from "../modelo/m_departamento.js";
import { u_departamento } from "../utilidades/u_departamento.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_facultad } from "../modelo/m_facultad.js";

export class c_departamento {
    constructor() {
        // Datos principales
        this.departamentos = [];
        this.facultades = [];
        
        // Control de edición
        this.modoEdicion = false;
        this.departamentoActual = null;
        
        // DataTable
        this.tablaDepartamentos = null;
        
        // Validaciones
        this.validaciones = {
            nombre: false,
            idFacultad: false
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
            
            // Cargar facultades primero (para el select)
            await this.cargarFacultades();
            
            // Cargar departamentos de la base de datos
            await this.cargarDepartamentos();
            
            // Inicializar DataTable
            this.inicializarTabla();
            
            // Configurar eventos
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.notificarError(`No se pudo inicializar el módulo de departamentos: ${error}`, 1500);
        }
    }
    
    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    // ============================================
// CARGA DE DATOS
// ============================================

    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades();

            if(this.facultades==[]) Alerta.notificar('No hay facultades almacenadas', 1500);
            
            // Cargar facultades en el select
            u_departamento.cargarSelectFacultades('facultadesDepartamento', this.facultades);
        } catch (error) {
            Alerta.error('Error', `No se pudieron cargar las facultades: ${error}`);
        }
    }
    
    async cargarDepartamentos() {
        try {
            this.departamentos = await m_departamento.obtenerDepartamentos();

            if(this.departamentos==[]) Alerta.notificar('No hay departamentos almacenados', 1500);

            this.actualizarTabla();
        } catch (error) {
            Alerta.error('Error', `No se pudieron cargar los departamentos: ${error}`);
        }
    }
    
    // ============================================
    // CONFIGURACIÓN DE TABLA
    // ============================================
    
    inicializarTabla() {
        // Destruir DataTable existente si la hay
        if ($.fn.dataTable.isDataTable('#tablaDepartamentos')) {
            $('#tablaDepartamentos').DataTable().destroy();
        }
        
        this.tablaDepartamentos = $('#tablaDepartamentos').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [2] } // No ordenar por acciones
            ]
        });
    }
    
    actualizarTabla() {
        this.tablaDepartamentos.clear();
        
        this.departamentos.forEach(departamento => {
            const nombreFacultad = u_departamento.obtenerNombreFacultad(this.facultades, departamento.idFacultad);
            
            this.tablaDepartamentos.row.add([
                departamento.nombre || 'Sin nombre',
                nombreFacultad,
                u_departamento.crearBotonesAccion(departamento)
            ]);
        });
        
        this.tablaDepartamentos.draw();
        
        // Asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    // ============================================
    // CONFIGURACIÓN DE EVENTOS
    // ============================================
    
    configurarEventos() {
        // Botón guardar departamento
        document.querySelector('.btnGuardarDepartamento').addEventListener('click', () => {
            this.guardarDepartamento();
        });
    }
    
    asignarEventosBotones() {
        // Botones de editar
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editarDepartamento(id);
            });
        });
        
        // Botones de deshabilitar
        document.querySelectorAll('.deshabilitar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.cambiarEstadoDepartamento(id, 'deshabilitar');
            });
        });
    }
    
    configurarValidaciones() {
        // Validar nombre del departamento
        document.getElementById('nombreDepartamento').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.nombre = u_departamento.validarNombre(valor);
            u_utiles.colorearCampo(
                this.validaciones.nombre,
                '#nombreDepartamento',
                '#errorNombreDepartamento',
                'El nombre debe tener entre 3 y 100 caracteres'
            );
        });
        
        // Validar facultad seleccionada
        document.getElementById('facultadesDepartamento').addEventListener('change', (e) => {
            const valor = e.target.value;
            this.validaciones.idFacultad = u_departamento.validarFacultad(valor);
            u_utiles.colorearCampo(
                this.validaciones.idFacultad,
                '#facultadesDepartamento',
                '#errorFacultadesDepartamento',
                'Seleccione una facultad'
            );
        });
    }
    
    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarDepartamento() {
        // Validar todos los campos
        if (!this.validaciones.nombre || !this.validaciones.idFacultad) {
            Alerta.notificarAdvertencia('Complete todos los campos correctamente', 1500);
            return;
        }
        
        try {
            const datos = u_departamento.obtenerDatosFormulario();
            
            // Crear objeto departamento
            const departamentoData = {
                nombre: datos.nombre,
                idFacultad: datos.idFacultad
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar departamento existente
                departamentoData.idDepartamento = this.departamentoActual.idDepartamento;
                resultado = await m_departamento.actualizarDepartamento(departamentoData);
            } else {
                // Insertar nuevo departamento
                resultado = await m_departamento.insertarDepartamento(departamentoData);
            }
            
            if (resultado) {
                // Recargar departamentos
                await this.cargarDepartamentos();
                
                // Limpiar formulario
                u_departamento.limpiarFormulario();
                this.modoEdicion = false;
                this.departamentoActual = null;
                
                Alerta.exito(
                    this.modoEdicion ? 'Departamento actualizado' : 'Departamento creado',
                    `El departamento se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar el departamento: ${error}`);
        }
    }
    
    async cambiarEstadoDepartamento(id, accion) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion === 'deshabilitar' ? 'deshabilitar' : 'habilitar'} este departamento?`
            );
            
            if (confirmacion) {
                let resultado;
                if (accion === 'deshabilitar') {
                    resultado = await m_departamento.deshabilitarDepartamento(id);
                } else {
                    resultado = await m_departamento.habilitarDepartamento(id);
                }
                
                if (resultado) {
                    // Recargar departamentos
                    await this.cargarDepartamentos();
                    
                    Alerta.exito(
                        'Éxito',
                        `Departamento ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'} correctamente`
                    );
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado del departamento: ${error}`);
        }
    }
    
    editarDepartamento(id) {
        const departamento = this.departamentos.find(d => d.idDepartamento == id);
        
        if (departamento) {
            this.modoEdicion = true;
            this.departamentoActual = departamento;
            
            // Cargar datos en el formulario
            document.getElementById('nombreDepartamento').value = departamento.nombre || '';
            
            // Seleccionar la facultad correspondiente
            const selectFacultad = document.getElementById('facultadesDepartamento');
            if (departamento.idFacultad) {
                selectFacultad.value = departamento.idFacultad;
            } else {
                selectFacultad.value = 'Ninguno';
            }
            
            // Forzar validaciones
            document.getElementById('nombreDepartamento').dispatchEvent(new Event('input'));
            document.getElementById('facultadesDepartamento').dispatchEvent(new Event('change'));
        }
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_departamento();
    await controlador.inicializar();
});