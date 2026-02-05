export class m_subEstudiante
{
    constructor(idEstudiante, CodigoEstudiante, NombreEstudiante, ApellidosEstudiante, dipEstudiante, CorreoEstudiante, idCarrera, idCurso, FechadeNacimiento, 
        Sexo, Nacionalidad, Foto)
    {
        this.idEstudiante = idEstudiante || null;
        this.CodigoEstudiante = CodigoEstudiante || null;
        this.NombreEstudiante = NombreEstudiante || null;
        this.ApellidosEstudiante = ApellidosEstudiante || null;
        this.dipEstudiante = dipEstudiante || null;
        this.CorreoEstudiante = CorreoEstudiante || null;
        this.idCarrera = idCarrera || null;
        this.idCurso = idCurso || null;
        this.FechadeNacimiento = FechadeNacimiento || null;
        this.Sexo = Sexo || null;
        this.Nacionalidad = Nacionalidad || null;
        this.Foto = Foto || null;
    }
}