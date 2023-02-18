import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"
import ciclos from "./Cycle.js";

const indicadores = sequelize.define('indicadores', {
    ID_Indicador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre_Indicador: DataTypes.STRING(50),
    Felicidad_Indicador: {
        allowNull: true,
        type: DataTypes.FLOAT(5, 2)
    },
    cicloIDCiclo: {
        type: DataTypes.INTEGER,
        references: {
            model: ciclos,
            key: "ID_Ciclo"
        }
    }
},{
    timestamps: false
})

ciclos.hasMany(indicadores, {
    foreignKey: 'cicloIDCiclo'
});
indicadores.belongsTo(ciclos);

sequelize.sync()
    .then(() => {
        console.log("La tabla indicadores está sincronizada")
    })
    .catch(err => {
        console.log("La tabla indicadores no está sincronizada")
    });


export default indicadores;