export class m_departamento
{
    constructor(iddepartamento, NombreDepartamento, TelefonoDepartamento, idFacultad)
    {
        this.iddepartamento = iddepartamento || null;
        this.NombreDepartamento = NombreDepartamento || null;
        this.TelefonoDepartamento = TelefonoDepartamento || null;
        this.idFacultad = idFacultad || null;
    }
}