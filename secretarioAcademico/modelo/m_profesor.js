import { fetchProfesor } from "../servicios/fetchProfesor.js";

export class m_profesor
{
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

    static async obtenerProfesoresPorFacultad(idFacultad = null) {
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