import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"
import tableros from "./Board.js";
/* import ciclos from "./Cycle.js"; */

const indicadores = sequelize.define('indicadores', {
    ID_Indicador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre_Indicador: DataTypes.STRING(50),

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

tableros.hasMany(indicadores, {
    foreignKey: 'tableroIDTablero'
});
indicadores.belongsTo(tableros);

/* sequelize.sync()
    .then(() => {
        console.log("La tabla indicadores está sincronizada")
    })
    .catch(err => {
        console.log("La tabla indicadores no está sincronizada")
    }); */


export default indicadores;