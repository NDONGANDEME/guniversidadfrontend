import { fetchEstudiante } from "../servicios/fetchEstudiante.js";
import { fetchFamiliar } from "../servicios/fetchFamiliar.js";
import { fetchBeca } from "../servicios/fetchBeca.js";
import { fetchEstudianteBeca } from "../servicios/fetchEstudianteBeca.js";

/**
 * CLASE ESTUDIANTE
 */
export class m_estudiante {
    constructor (idEstudiante, idUsuario, codigoEstudiante, nombre, apellidos, dipEstudiante, fechaNacimiento, sexo, nacionalidad, direccion, 
        localidad, provincia, pais, telefono, correoEstudiante, centroProcedencia, universidadProcedencia, esBecado) {
        this.idEstudiante = idEstudiante;
        this.idUsuario = idUsuario;
        this.codigoEstudiante = codigoEstudiante;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dipEstudiante = dipEstudiante;
        this.fechaNacimiento = fechaNacimiento;
        this.sexo = sexo;
        this.nacionalidad = nacionalidad;
        this.direccion = direccion;
        this.localidad = localidad;
        this.provincia = provincia;
        this.pais = pais;
        this.telefono = telefono;
        this.correoEstudiante = correoEstudiante;
        this.centroProcedencia = centroProcedencia;
        this.universidadProcedencia = universidadProcedencia;
        this.esBecado = esBecado;
    }

    /*
        el codigo del estudiante se generará automaticamente en el metodo generarCodigoEstudiante(nombreFacultad, nombreCarrera){} y devolverá un string del formato:
        facultad-numero-carrera. ejemplo: FI-0001-INF (faciltad de ingenierias, numero 0001, carrera: informatica).
    */
       
    static async obtenerEstudiantes() {
        return await fetchEstudiante.obtenerEstudiantesDelBackend();
    }

    static async obtenerEstudiantesPorAsignatura(idAsignatura) {
        return await fetchEstudiante.obtenerEstudiantesPorAsignaturaDelBackend(idAsignatura);
    }

    static async obtenerEstudiantesPorFacultad(idFacultad) {
        return await fetchEstudiante.obtenerEstudiantesPorFacultadDelBackend(idFacultad);
    }

    static async obtenerDatosEspecificosEstudiantes() {
        return await fetchEstudiante.obtenerDatosEspecificosEstudiantesDelBackend();
    }

    static async insertarEstudiante(objeto) {
        return await fetchEstudiante.insertarEstudianteEnBDD(objeto);
    }

    static async actualizarEstudiante(objeto) {
        return await fetchEstudiante.actualizarEstudianteEnBDD(objeto);
    }
}

/**
 * CLASE FAMILIAR
 */
export class m_familiar {
    constructor (idFamiliar, nombre, apellidos, dipFamiliar, telefono, correoFamiliar, direccion, parentesco, esContactoIncidentes, esResponsablePago, idEstudiante) {
        this.idFamiliar = idFamiliar;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dipFamiliar = dipFamiliar;
        this.telefono = telefono;
        this.correoFamiliar = correoFamiliar;
        this.direccion = direccion;
        this.parentesco = parentesco;
        this.esContactoIncidentes = esContactoIncidentes;
        this.esResponsablePago = esResponsablePago;
        this.idEstudiante = idEstudiante;
    }

    static async obtenerFamiliares() {
        return await fetchFamiliar.obtenerFamiliaresDelBackend();
    }

    static async obtenerFamiliarResponsablePorEstudiante(idEstudiante) {
        return await fetchFamiliar.obtenerFamiliarResponsablePorEstudianteDelBackend(idEstudiante);
    }

    static async obtenerFamiliarPorEstudiante(idEstudiante) {
        return await fetchFamiliar.obtenerFamiliarPorEstudianteDelBackend(idEstudiante);
    }

    static async insertarFamiliar(objeto) {
        return await fetchFamiliar.insertarFamiliarEnBDD(objeto);
    }

    static async actualizarFamiliar(objeto) {
        return await fetchFamiliar.actualizarFamiliarEnBDD(objeto);
    }

    static async eliminarFamiliar(id) {
        return await fetchFamiliar.eliminarFamiliarEnBDD(id);
    }
}

/**
 * CLASE BECA
 */
export class m_beca {
    constructor (idBeca, institucionBeca, tipoBeca) {
        this.idBeca = idBeca;
        this.institucionBeca = institucionBeca;
        this.tipoBeca = tipoBeca;
    }

    static async obtenerBecas() {
        return await fetchBeca.obtenerBecasDelBackend();
    }

    static async insertarBeca(objeto) {
        return await fetchBeca.insertarBecaEnBDD(objeto);
    }

    static async actualizarBeca(objeto) {
        return await fetchBeca.actualizarBecaEnBDD(objeto);
    }

    static async eliminarBeca(id) {
        return await fetchBeca.eliminarBecaEnBDD(id);
    }
}

/**
 * CLASE ESTUDIANTEBECA
 */
export class m_estudianteBeca {
    constructor (idEstudianteBecario, idEstudiante, idBeca, fechaInicio, fechaFinal, estado, observaciones) {
        this.idEstudianteBecario = idEstudianteBecario;
        this.idEstudiante = idEstudiante;
        this.idBeca = idBeca;
        this.fechaInicio = fechaInicio;
        this.fechaFinal = fechaFinal;
        this.estado = estado;
        this.observaciones = observaciones;
    } 

    static async obtenerEstudiantes() {
        return await fetchEstudianteBeca.obtenerEstudiantesBecaDelBackend();
    }

    static async insertarEstudianteBecado(objeto) {
        return await fetchEstudianteBeca.insertarEstudianteBecadoEnBDD(objeto);
    }

    static async actualizarEstudianteBecado(objeto) {
        return await fetchEstudianteBeca.actualizarEstudianteBecadoEnBDD(objeto);
    }
}