import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"
import tableros from "./Board.js";

const ciclos = sequelize.define('ciclos', {
    ID_Ciclo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre_Ciclo: DataTypes.STRING(50),
    Felicidad_Ciclo: {
        allowNull: true,
        type: DataTypes.FLOAT(5, 2)
    },
    tableroIDTablero: {
        type: DataTypes.INTEGER,
        references: {
            model: tableros,
            key: "ID_Tablero"
        }
    }
},{
    timestamps: false 
})

tableros.hasMany(ciclos, {
    foreignKey: 'tableroIDTablero',
    onDelete: 'CASCADE'
});
ciclos.belongsTo(tableros);

/* sequelize.sync()
    .then(() => {
        console.log("La tabla ciclos está sincronizada")
    })
    .catch(err => {
        console.log("La tabla ciclos no está sincronizada")
    }); */

export default ciclos;