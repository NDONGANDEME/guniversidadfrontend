import { fetchEstudiante } from "../servicios/fetchEstudiante.js";

export class m_estudiante
{
    constructor (idEstudiante, idUsuario, codigoEstudiante, nombre, apellidos, dipEstudiante, fechaNacimiento, sexo, nacionalidad, direccion, 
        localidad, provincia, pais, telefono, correoEstudiante, centroProcedencia, estudiosAcceso, notaMediaAcceso, 
        titulacionAcceso, universidadProcedencia, esBecado) 
    {
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
        this.estudiosAcceso = estudiosAcceso;
        this.notaMediaAcceso = notaMediaAcceso;
        this.titulacionAcceso = titulacionAcceso;
        this.universidadProcedencia = universidadProcedencia;
        this.esBecado = esBecado;
    }

    static async obtenerEstudiantes() {
        return await fetchEstudiante.obtenerEstudiantesDelBackend();
    }

    static async insertarEstudiante(objeto) {
        return await fetchEstudiante.insertarEstudianteEnBDD(objeto);
    }

    static async actualizarEstudiante(objeto) {
        return await fetchEstudiante.actualizarEstudianteEnBDD(objeto);
    }
}