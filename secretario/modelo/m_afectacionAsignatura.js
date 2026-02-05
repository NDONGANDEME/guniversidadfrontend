export class m_afectacionAsignatura
{
    constructor(idAfectacionasignatura, idCurso, idCarrera, idSemestre, idEstudiante, idAsignatura)
    {
        this.idAfectacionasignatura = idAfectacionasignatura || null;
        this.idCurso = idCurso || null;
        this.idCarrera = idCarrera || null;
        this.idSemestre = idSemestre || null;
        this.idEstudiante = idEstudiante || null;
        this.idAsignatura = idAsignatura || null;
    }
}