import bcryptjs from "bcryptjs";
import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"

const usuarios = sequelize.define('usuarios', {
    ID_Usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre_Usuario: DataTypes.STRING(50),
    Apellido: DataTypes.STRING(50),
    Pais: DataTypes.STRING(50),
    Email: {
        type: DataTypes.STRING(50),
        unique: true
    },
    Password: DataTypes.STRING(200),
    Tipo_Usuario: DataTypes.STRING(50),
    Descripcion: {
        allowNull: true,
        type: DataTypes.STRING(250),
    }, 
}, {
    timestamps: false,
})

usuarios.prototype.comparePassword = async (canditatePassword, password) => {
    return await bcryptjs.compare(canditatePassword, password);
}

sequelize.sync()
    .then(() => {
        console.log("La tabla Usuarios está sincronizada")
    })
    .catch(err => {
        console.log("La tabla usuarios no está sincronizada")
        console.log(err)
    });


export default usuarios