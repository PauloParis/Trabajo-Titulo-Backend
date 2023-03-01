import sequelize from "../database/connectdb.js";
import { DataTypes } from "sequelize";
import usuarios from "./User.js";
import ciclos from "./Cycle.js";
import indicadores from "./Indicator.js";

const evaluaciones = sequelize.define('evaluaciones', {
    ID_Evaluacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Evaluacion: {
        allowNull: true,
        type: DataTypes.INTEGER
    },
    usuarioIDUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: usuarios,
            key: 'ID_Usuario'
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
    cicloIDCiclo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ciclos,
            key: 'ID_Ciclo'
        }
    },
}, {
    freezeTableName: true,
    timestamps: false
})

usuarios.hasMany(evaluaciones, {
    foreignKey: 'usuarioIDUsuario',
    onDelete: 'CASCADE'
});
evaluaciones.belongsTo(usuarios);

ciclos.hasMany(evaluaciones, {
    foreignKey: 'cicloIDCiclo',
    onDelete: 'CASCADE'
});
evaluaciones.belongsTo(ciclos);


indicadores.hasMany(evaluaciones, {
    foreignKey: 'indicadoreIDIndicador',
    onDelete: 'CASCADE'
});
evaluaciones.belongsTo(indicadores);


export default evaluaciones;