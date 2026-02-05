export class m_semestre
{
    constructor(idSemestre, NombreSemestre, idAsignatura, idCarrera, idCurso, idEstudiante)
    {
        this.idSemestre = idSemestre || null;
        this.NombreSemestre = NombreSemestre || null;
        this.idAsignatura = idAsignatura || null;
        this.idCarrera = idCarrera || null;
        this.idCurso = idCurso || null;
        this.idEstudiante = idEstudiante || null;
    }



    // lista estatica de semestres
    static listaSemestresEstaticas()
    {
        let cursos = [
            { id: 1, nombre: "Primero" },
            { id: 2, nombre: "Segundo" },
            { id: 3, nombre: "Tercero" },
            { id: 4, nombre: "Cuarto" },
            { id: 5, nombre: "Quinto" },
            { id: 6, nombre: "Sexto" },
            { id: 7, nombre: "Séptimo" },
            { id: 8, nombre: "Octavo" }
        ];
        
        return cursos;
    }
}