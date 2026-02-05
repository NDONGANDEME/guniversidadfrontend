export class m_profesor
{
    constructor(idProfesor, NombreProfesor, ApellidosProfesor, dipProfesor, Especialidad, GradoEstudio, Telefono, CorreoProfesor, idFacultad, idDepartamento, Foto) 
    {
        this.idProfesor = idProfesor || null;
        this.NombreProfesor = NombreProfesor || null;
        this.ApellidosProfesor = ApellidosProfesor || null;
        this.dipProfesor = dipProfesor || null;
        this.Especialidad = Especialidad || null;
        this.GradoEstudio = GradoEstudio || null;
        this.Telefono = Telefono || null;
        this.CorreoProfesor = CorreoProfesor || null;
        this.idFacultad = idFacultad || null;
        this.idDepartamento = idDepartamento || null;
        this.Foto = Foto || null;
    }



    // lista estatica de profesores
    static listaProfesoresEstaticas()
    {
        let profesores = [
            { id: 1, nombre: "Andrés Pérez" },
            { id: 2, nombre: "María Gómez" },
            { id: 3, nombre: "Carlos Ruiz" },
            { id: 4, nombre: "Laura Martínez" }
        ];
        
        return profesores;
    }
}