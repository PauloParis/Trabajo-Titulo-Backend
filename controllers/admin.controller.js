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
import ciclo_indicador from "../models/Cycle.Indicator.js";

//no traer el propio
export const allUsers = async (req, res) => {
    try {
        let users = await usuarios.findAll();
        return res.status(200).json({users})
    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}

export const updateTypeUser = async (req, res) => {
    const {tipo_usuario} = req.body;
    let id = req.params.id;
    try {
        let user = await usuarios.update({
            Tipo_Usuario: tipo_usuario
       }, {
           where: {
               ID_Usuario: id,
           }
       });

       let usertype = await usuarios.findOne({
        where: {
            ID_Usuario: id
        }
       })

       return res.status(200).json({usertype})
    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}

export const getMetric = async (req, res) => {
    let id_tablero = req.params.id
    try {
        let board = await tableros.findAll({
            attributes: [
                'ID_Tablero', 'Nombre_Tablero', 'Felicidad_Tablero', 'Anio', 'Semestre'
            ],           
            where: {
                ID_Tablero: id_tablero
            }
        })

        let cycles = await tableros.findAll({
            include: [
                {
                    model: ciclos,
                    required: true,
                    attributes: [
                        'ID_Ciclo', 'Nombre_Ciclo', 'Felicidad_Ciclo'
                    ]
                }
            ],
            where: {
                ID_Tablero: id_tablero
            }
        })

        let indicators = await indicadores.findAll({
            where: {
                tableroIDTablero: id_tablero
            }    
        })

        let cycles_indicators = await ciclos.findAll({
            include: [
                {
                    model: ciclo_indicador,
                    required: true,
                }
            ],
            where: {
                tableroIDTablero: id_tablero
            }
        })

        let users_indicators = await usuarios.findAll({
            include: [
                {
                    model: usuario_indicador,
                    required: true,
                    include: [
                        {
                            model: indicadores,
                            required: true,
                            where: {
                                tableroIDTablero: id_tablero
                            }
                        }
                    ]
                },
            ],
            attributes: [
                'Nombre_Usuario', 'Apellido'
            ]
        })
        /*
        let indicator2 = await indicadores.findAll({
            include: [{
                model: ciclos,
                required: true,
                include: [{
                    model: tableros,
                    required: true,
                    where: {
                        ID_Tablero: id_tablero
                    }
                }]
            }],
            attributes: [
                'ID_Indicador', 'Nombre_Indicador', 'Felicidad_Indicador'
            ]
            
        })

        let user = await tableros.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    attributes: [
                        'Felicidad_Usuario'
                    ],
                    include: [
                        {
                            model: usuarios,
                            required: false,
                            attributes: [
                                'ID_Usuario', 'Nombre_Usuario', 'Apellido'
                            ]
                        }
                    ],
                    where: {
                        Felicidad_Usuario: {
                            [Op.ne]: null
                        }
                        
                    }
                }
            ],
            where: {
                ID_Tablero: id_tablero
            }
        }) */

        //console.log({board, cycles,indicators /*indicator2, user */})
        return res.status(200).json({board, cycles, indicators, cycles_indicators, users_indicators /*, indicator2, user */})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const getAllBoard = async (req, res) => {
    try {
        let Boards = await tableros.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    where: {
                        usuarioIDUsuario: req.uid
                    }
                }
            ]
        })

        return res.status(200).json({Boards})

    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const getUsersBoard = async (req, res) => {
    let id_tablero = req.params.id;
    try {
        let usersBoard = await usuarios.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    where: {
                        tableroIDTablero: id_tablero
                    }
                }
            ],
            attributes: [
                'ID_Usuario', 'Nombre_Usuario', 'Apellido', 'Pais', 'Email', 'Tipo_Usuario', 'Descripcion'
            ]
        })

        return res.status(200).json({usersBoard});
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

