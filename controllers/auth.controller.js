
import bcryptjs from "bcryptjs";
import usuarios from "../models/User.js";
import usuario_indicador from "../models/User.Indicator.js"
import { generateToken, generateRefreshToken } from "../util/tokenManager.js";
import indicadores from "../models/Indicator.js";
import ciclos from "../models/Cycle.js";
import tableros from "../models/Board.js";
import usuario_tablero from "../models/User.Board.js"
import sequelize from "../database/connectdb.js";
import {Op} from "sequelize";



export const register = async (req, res) => {
    const {nombre_usuario, apellido, pais, email, password} = req.body;
    let tipo_usuario = 'Estandar'

    try {
        let user = await usuarios.findOne({
            where: {
                Email: email
            }
        });
        if (user) throw { code: 11000 };

        if (email == 'vescobar@utem.cl') {
            tipo_usuario = 'Administrador'
        }

        const passwordEncriptada = await bcryptjs.hash(password, 12)
        console.log("esta es la encriptada"+passwordEncriptada)

        user = await usuarios.create({
            Nombre_Usuario: nombre_usuario, 
            Apellido: apellido, 
            Pais: pais, 
            Email: email, 
            Password: passwordEncriptada, 
            Tipo_Usuario: tipo_usuario
        });

        return res.status(201).json({ok: "Registro Exitoso"})

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya existe este usuario" });
        }
        console.log(error)
        return res.status(500).json({ error: "Error de servidor" });
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        let user = await usuarios.findOne({
            where: {
                Email: email
            }
        });
        if (!user) throw { code: 11000 };

        let passwordUser = user.Password;
        const respuestaPassword = await user.comparePassword(password, passwordUser);
        if (!respuestaPassword)
            return res.status(403).json({ error: "Contraseña incorrecta" });

        // Generar el token JWT
        const uidUser = user.ID_Usuario
        const typeuser = user.Tipo_Usuario
        const { token, expiresIn } = generateToken(user.ID_Usuario);
        generateRefreshToken(user.ID_Usuario, res);
        return res.json({ token, expiresIn, typeuser, uidUser });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "No existe el usuario" });
        }
        return res.status(500).json({ error: "Error de servidor" });
    }
}

export const infoUser = async (req, res) => {
    try {
        let user = await usuarios.findOne({
            where: {
                ID_Usuario: req.uid 
            }
        });

        let nombre = user.Nombre_Usuario
        let apellido = user.Apellido
        let pais = user.Pais
        let email = user.Email
        let usuario_tipo = user.Tipo_Usuario
        let descripcion = user.Descripcion 

        res.send({nombre, apellido, pais, email, usuario_tipo, descripcion})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "error de server"})
    }
}

export const SaveUpdateUser = async (req, res) => {
    const {nombre_usuario, apellido, pais, descripcion} = req.body;
    try {
        let user = await usuarios.findOne({
            where: {
                ID_Usuario: req.uid
            }
        });

        if (!user) throw { code: 11000 };

        user = await usuarios.update({
             Nombre_Usuario: nombre_usuario,
             Apellido: apellido,
             Pais: pais,
             Descripcion: descripcion
        }, {
            where: {
                ID_Usuario: req.uid
            }
        });

        return res.json({ok: "Los datos del perfil, fueron actualizados correctamente"})

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "No existe el usuario" });
        }
        console.log(error)
        return res.status(500).json({error: "error de server"})
    }
}

export const updatePassword = async (req, res) => {
    const {password_actual, password_nueva} = req.body;
    try {
        let user = await usuarios.findOne({
            where: {
                ID_Usuario: req.uid
            }
        });
        if (!user) throw { code: 11000 };

        let passwordUser = user.Password;

        const respuestaPassword = await user.comparePassword(password_actual, passwordUser);
        if (!respuestaPassword)
            return res.status(403).json({ error: "La Contraseña Actual no Coincide" });

        const passwordEncriptadaEditada = await bcryptjs.hash(password_nueva, 12)
        console.log("esta es la encriptada"+passwordEncriptadaEditada)


        user = await usuarios.update({
            Password: passwordEncriptadaEditada,
       }, {
           where: {
               ID_Usuario: req.uid
           }
       });

       return res.send({ok: "La Contraseña fue actualizada correctamente"}) 

    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}

export const deleteUser = async (req, res) => {
    let id = req.uid
    try {
        let userboard = await usuario_tablero.findAll({
            attributes: [
                'tableroIDTablero'
            ],
            where: {
                usuarioIDUsuario: id
            }
        })
        const idboard = []

        for (var board of userboard){
            idboard.push(board.tableroIDTablero)
          }
        
        let boarddelete = await tableros.destroy({
            where: {
                ID_Tablero: idboard
            }
        })

        let user = await usuarios.destroy({
            include: [{
                model: usuario_tablero,
                required: true,
            },
            {
                model: usuario_indicador,
                required: true
            }],
            where: {
                ID_Usuario: id
              }
        })
        
        return res.json({ok: "Su Cuenta fue Eliminada con Exito"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "error de server"})
    }
}

export const refreshToken = (req, res) => {
    try {
        const { token, expiresIn } = generateToken(req.uid);
        
        return res.json({ token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "error de server" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ok: true})
}

export const saveHappyUser = async (req, res) => {
    let id_tablero = req.params.id; 
    let id_usuario = req.uid;
    try {  
        let suma = await usuario_indicador.sum('Evaluacion',{
            include: [
                {
                 model: indicadores,
                 required: true,
                 include: [
                    {
                        model: ciclos,
                        required: true,
                        include: [
                            {
                                model: tableros,
                                required: true,
                                where: {
                                    ID_Tablero: id_tablero
                                }
                            }
                        ]
                    }
                 ]   
                }
            ],
            where: {
                usuarioIDUsuario: id_usuario,
            }
        })
        
        let count = await usuario_indicador.count({
            include: [
                {
                    model: indicadores,
                    required: true,
                    include: [
                        {
                            model:ciclos,
                            required: true,
                            include: [
                                {
                                    model: tableros,
                                    required: true,
                                    where: {
                                        ID_Tablero: id_tablero
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                usuarioIDUsuario: id_usuario
            }
        })

        const prom = suma/count 
        const HappyUser = ((prom+1)/2)*100 

        let happy = await usuario_tablero.update({
            Felicidad_Usuario: HappyUser
       }, {
           where: {
            tableroIDTablero: id_tablero,
            usuarioIDUsuario: id_usuario,
           }
       });

       return res.json({ok: "El indice de Felicidad del usuario es: "+ HappyUser + " %"})

    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }


}