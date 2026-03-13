import { fetchProfesor } from "../servicios/fetchProfesor.js";
import { fetchFormacion } from "../servicios/fetchFormacion.js";

/**
 * CLASE PROFESOR
 */
export class m_profesor {
    constructor (idProfesor, nombreProfesor, apellidosProfesor, dipProfesor, especialidad, gradoEstudio, idDepartamento, idUsuario, genero, nacionalidad, 
        responsabilidad, correoProfesor, telefonoProfesor) {
            this.idProfesor = idProfesor;
            this.nombreProfesor = nombreProfesor;
            this.apellidosProfesor = apellidosProfesor;
            this.dipProfesor = dipProfesor;
            this.especialidad = especialidad;
            this.gradoEstudio = gradoEstudio;
            this.idDepartamento = idDepartamento;
            this.idUsuario = idUsuario;
            this.genero = genero;
            this.nacionalidad = nacionalidad;
            this.responsabilidad = responsabilidad;
            this.correoProfesor = correoProfesor;
            this.telefonoProfesor = telefonoProfesor;
    }

    static async obtenerProfesoresPorFacultad(idFacultad) {
        return await fetchProfesor.obtenerProfesoresPorFacultadDelBackend(idFacultad);
    }

    static async obtenerProfesoresPorDepartamento() {
        return await fetchProfesor.obtenerProfesoresPorDepartamentoDelBackend();
    }

    static async insertarProfesor(objeto) {
        return await fetchProfesor.insertarProfesorEnBDD(objeto);
    }

    static async actualizarProfesor(objeto) {
        return await fetchProfesor.actualizarProfesorEnBDD(objeto);
    }
}

/**
 * CLASE FORMACION
 */
export class m_formacion {
    constructor (idFormacion, institucion, tipoFormacion, titulo, nivel, idProfesor) {
        this.idFormacion = idFormacion;
        this.institucion = institucion;
        this.tipoFormacion = tipoFormacion;
        this.titulo = titulo;
        this.nivel = nivel;
        this.idProfesor = idProfesor;
    }

    static async obtenerFormacionPorProfesor(idProfesor) {
        return await fetchFormacion.obtenerFormacionPorProfesorDelBackend(idProfesor);
    }

    static async insertarFormacion(objeto) {
        return await fetchFormacion.insertarFormacionEnBDD(objeto);
    }

    static async actualizarFormacion(objeto) {
        return await fetchFormacion.actualizarFormacionEnBDD(objeto);
    }
}