import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js";
import ciclos from "./Cycle.js";
import indicadores from "./Indicator.js";

const ciclo_indicador = sequelize.define('ciclo_indicador', {
    cicloIDCiclo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ciclos,
            key: 'ID_Ciclo'
        }
    },
    indicadoreIDIndicador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: indicadores,
            key: 'ID_Indicador'
        }
    },
    Felicidad_Indicador: {
        allowNull: true,
        type: DataTypes.FLOAT(5, 2)}
}, {
    freezeTableName: true,
    timestamps: false

})

ciclos.belongsToMany(indicadores, {through: ciclo_indicador});
indicadores.belongsToMany(ciclos, {through: ciclo_indicador});

ciclos.hasMany(ciclo_indicador, {
    foreignKey: {
        name: 'cicloIDCiclo'
    }
})
ciclo_indicador.belongsTo(ciclos)

indicadores.hasMany(ciclo_indicador, {
    foreignKey: {
        name: 'indicadorIDIndicador'
    }
})
ciclo_indicador.belongsTo(indicadores)


sequelize.sync()
    .then(() => {
        console.log("La tabla ciclo_indicador está sincronizada")
    })
    .catch(err => {
        console.log("La tabla ciclo_indicador no está sincronizada")
        console.log(err)
    });

export default ciclo_indicador;