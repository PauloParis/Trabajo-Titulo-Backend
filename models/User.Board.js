import { DataTypes } from "sequelize";
import sequelize from "../database/connectdb.js"
import tableros from "./Board.js";
import usuarios from "./User.js";

const usuario_tablero = sequelize.define('usuario_tablero', {
    Categoria: DataTypes.STRING(50),
/*     Felicidad_Usuario: {
        allowNull: true,
        type: DataTypes.FLOAT(5, 2)
    }, */
    Notificacion: DataTypes.BOOLEAN(),
    usuarioIDUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: usuarios,
            key: 'ID_Usuario'
        }
    },
    tableroIDTablero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: tableros,
            key: 'ID_Tablero'
        }
    },
    created_at: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
    
}, {
    freezeTableName: true,
    timestamps: false

})

usuarios.belongsToMany(tableros, {through: usuario_tablero});
tableros.belongsToMany(usuarios, {through: usuario_tablero});
usuarios.hasMany(usuario_tablero, {
    foreignKey: {
        name: 'usuarioIDUsuario',
    }
})

usuario_tablero.belongsTo(usuarios)
tableros.hasMany(usuario_tablero, {
    foreignKey: {
        name: 'tableroIDTablero',
    }
})
usuario_tablero.belongsTo(tableros)

/* sequelize.sync()
    .then(() => {
        console.log("La tabla usuario-tablero está sincronizada")
    })
    .catch(err => {
        console.log("La tabla usuario-tablero no está sincronizada")
        console.log(err)
    }); */

export default usuario_tablero;