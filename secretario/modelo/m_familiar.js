export class m_familiar
{
    constructor(idFamilia, idEstudiante, NombreTutor, ResponsabledePago, Telefono, Correo)
    {
        this.idFamilia = idFamilia || null;
        this.idEstudiante = idEstudiante || null;
        this.NombreTutor = NombreTutor || null;
        this.ResponsabledePago = ResponsabledePago || null;
        this.Telefono = Telefono || null;
        this.Correo = Correo || null;
    }
}