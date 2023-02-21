import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"

const tableros = sequelize.define('tableros', {
    ID_Tablero: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre_Tablero: {
        type: DataTypes.STRING(50),
        unique: true
    },
    Anio: DataTypes.INTEGER,
    Semestre: DataTypes.INTEGER,
    Color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Felicidad_Tablero: {
        allowNull: true,
        type: DataTypes.FLOAT(5, 2)
    },
},{
    timestamps: false
})

/* sequelize.sync()
    .then(() => {
        console.log("La tabla tableros está sincronizada")
    })
    .catch(err => {
        console.log("La tabla tableros no está sincronizada")
    }); */

export default tableros;