export class m_matricula
{
    constructor(idMatricula, idEstudiante, idCurso, FechaMatricula, AñoAcademico, EstadoMatricula)
    {
        this.idMatricula = idMatricula || null;
        this.EstadoMatricula= idEstudiante || null;
        this.idCurso = idCurso || null;
        this.FechaMatricula = FechaMatricula || null;
        this.AñoAcademico = AñoAcademico || null;
        this.EstadoMatricula = EstadoMatricula || null;
    }
}