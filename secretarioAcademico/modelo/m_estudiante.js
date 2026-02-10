export class m_estudiante
{
    constructor(codigo, idUsuario, nombre, apellidos, fechaNacimiento, nacionalidad, centroProcedencia, genero, telefono, idFamiliar)
    {
        this.codigo = codigo || null;
        this.idUsuario = idUsuario || null;
        this.nombre = nombre || null;
        this.apellidos = apellidos || null;
        this.fechaNacimiento = fechaNacimiento || null;
        this.nacionalidad = nacionalidad || null;
        this.centroProcedencia = centroProcedencia || null;
        this.genero = genero || null;
        this.telefono = telefono || null;
        this.idFamiliar = idFamiliar || null;
    }
}