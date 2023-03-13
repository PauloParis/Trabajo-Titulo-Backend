import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"
import indicadores from "./Indicator.js";
import usuarios from "./User.js";

const usuario_indicador = sequelize.define('usuario_indicador', {
    
    Felicidad_Usuario: {
        allowNull: true,
        type: DataTypes.FLOAT(5, 2)
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
    } 
}, {
    freezeTableName: true,
    timestamps: false
})

usuarios.belongsToMany(indicadores, {through: usuario_indicador});
indicadores.belongsToMany(usuarios, {through: usuario_indicador});
usuarios.hasMany(usuario_indicador, {
    foreignKey: {
        name: 'usuarioIDUsuario'
    }
})
usuario_indicador.belongsTo(usuarios)
indicadores.hasMany(usuario_indicador, {
    foreignKey: {
        name: 'indicadoreIDIndicador'
    }
})
usuario_indicador.belongsTo(indicadores)

sequelize.sync()
    .then(() => {
        console.log("La tabla usuario-indicador está sincronizada")
    })
    .catch(err => {
        console.log("La tabla usuario-indicador no está sincronizada")
    });

export default usuario_indicador;