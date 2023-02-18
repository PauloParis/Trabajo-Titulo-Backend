import sequelize from "../database/connectdb.js";
import tableros from "../models/Board.js";
import ciclos from "../models/Cycle.js";
import indicadores from "../models/Indicator.js";
import usuario_tablero from "../models/User.Board.js";
import usuario_indicador from "../models/User.Indicator.js";
import usuarios from "../models/User.js";

export const createBoard = async (req, res) => {
    const {nombre_tablero, semestre, color} = req.body;
    try {
        let board = await tableros.findOne({
            where: {
                Nombre_Tablero: nombre_tablero
            }
        });

        if (board) throw { code: 11000 };
        const date = new Date();
        let year = date.getFullYear();
        board = await tableros.create({
            Nombre_Tablero: nombre_tablero,
            Anio: year,
            Semestre: semestre,
            Color: color,
            Felicidad_Tablero: 0
        })

        //buscar por nombre, obtener id tablero
        let idboard = await tableros.findOne({
            attributes: [
                'ID_Tablero', 'Nombre_Tablero', 'Anio', 'Semestre', 'Color'
           ],
            where: {
                Nombre_Tablero: nombre_tablero
            }
        })

        let id_tablero = idboard.ID_Tablero //id-tablero creado

        //guardar info en la tabla usuario_Tablero
        let boardUser = await usuario_tablero.create({
            Categoria: 'Creador',
            usuarioIDUsuario: req.uid,
            tableroIDTablero: id_tablero
        })

        let myboard = await tableros.findOne({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    attributes: ['Categoria'],
                    include: [
                        {
                            model: usuarios,
                            required: true,
                            attributes: [
                                'ID_Usuario', 'Nombre_Usuario', 'Apellido', 'Tipo_Usuario'
                            ],
                            where: {
                                ID_Usuario: req.uid
                            }
                        }
                    ],
                }
            ],
            attributes: [
                'ID_Tablero', 'Nombre_Tablero', 'Anio', 'Semestre', 'Color', 'Felicidad_Tablero'
           ],
            where: {
                Nombre_Tablero: nombre_tablero
            }
        })
        
        return res.status(201).json({ myboard });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya Existe un Tablero con el mismo Nombre" });
        }
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const updateBoard = async (req, res) => {
    const {nombre_tablero, anio, semestre, color} = req.body;
    let id_tablero = req.params.id;
    try {
        var largoAnio = anio.toString().length; 
        if (largoAnio == 4 && anio<=2155 && anio>=1901) {
            
            let board = await tableros.update({
                Nombre_Tablero: nombre_tablero,
                Anio: anio,
                Semestre: semestre,
                Color: color
            },{
                where: {
                    ID_Tablero: id_tablero
                }
            })

        } else {
            return res.status(400).json({error: "El largo del Año debe ser de 4 caracteres"})
        }
        
        let myboard = await tableros.findOne({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    attributes: ['Categoria'],
                    include: [
                        {
                            model: usuarios,
                            required: true,
                            attributes: [
                                'ID_Usuario', 'Nombre_Usuario', 'Apellido', 'Tipo_Usuario'
                            ],
                            where: {
                                ID_Usuario: req.uid
                            }
                        }
                    ],
                }
            ],
            attributes: [
                'ID_Tablero', 'Nombre_Tablero', 'Anio', 'Semestre', 'Color', 'Felicidad_Tablero'
           ],
            where: {
                ID_Tablero: id_tablero
            }
        })

        return res.status(200).json({myboard})
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const deleteBoard = async (req, res) => {
    let id_tablero = req.params.id;
    try {
        let board = await tableros.destroy({
            where: {
                ID_Tablero: id_tablero
            }
        })
        return res.json({ok: "El tablero fue eliminado con exito"});
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const disassociateBoard = async (req, res) => {
    let id_tablero =  req.params.id
    try {
        let board = await usuario_tablero.destroy({
            where: {
                usuarioIDUsuario: req.uid,
                tableroIDTablero: id_tablero,
                Categoria: 'Invitado'
            }
        })

        let userIndi = await usuario_indicador.destroy({
            where: {
                usuarioIDUsuario: req.uid
            }
        })

        return res.json({ok: "Fuiste desvinculado del tablero correctamente"})
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const getMyBoards = async (req, res) => {
    try {

        let board = await tableros.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    attributes: ['Categoria'],
                    include: [
                        {
                            model: usuarios,
                            required: true,
                            attributes: [
                                'ID_Usuario', 'Nombre_Usuario', 'Apellido', 'Tipo_Usuario'
                            ],
                            where: {
                                ID_Usuario: req.uid
                            }
                        }
                    ],
                    where: {
                        usuarioIDUsuario: req.uid,
                        Categoria: 'Creador'
                    },
                    
                }
            ],
            attributes: [
                 'ID_Tablero', 'Nombre_Tablero', 'Anio', 'Semestre', 'Color', 'Felicidad_Tablero'
            ],
            order: [
                ["ID_Tablero",'DESC']
            ]
        })
      
        return res.json({board});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const getguestBoards = async (req, res) => {
    try {
        let board = await tableros.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    include: [
                        {
                            model: usuarios,
                            required: true,
                            attributes: [
                                'ID_Usuario', 'Nombre_Usuario', 'Apellido', 'Tipo_Usuario'
                            ],
                            where: {
                                ID_Usuario: req.uid
                            }
                        }
                    ],
                    where: {
                        usuarioIDUsuario: req.uid,
                        Categoria: 'Invitado'
                    },
                    
                }
            ],  
            attributes: 
                ['ID_Tablero','Nombre_Tablero', 'Anio', 'Semestre', 'Color', 'Felicidad_Tablero'],
            group: [
                'created_at'
            ]   
        })
        return res.json({board});
    } catch (error) {
        console.log(error)
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const invitationUser = async (req, res) => {
    const {email} = req.body;
    let id_tablero = req.params.id
    try {
        let user = await usuarios.findOne({
            where: {
                Email: email
            }
        })

        if (!user) throw { code: 11000 };

        let id_usuario = user.ID_Usuario

        //buscar si ya se invitó
        let userboardbuscar = await usuario_tablero.findOne({
            where: {
                usuarioIDUsuario: id_usuario,
                tableroIDTablero: id_tablero
            }
        })

        if (userboardbuscar) throw { code: 11001 };

        let userBoard = await usuario_tablero.create({
            Categoria: 'Invitado',
            usuarioIDUsuario: id_usuario,
            tableroIDTablero: id_tablero
        })

        

        //buscar datos del usuario para el nav
        let userbuscar = await usuarios.findOne({
            include: [{
                model: usuario_tablero,
                required: true,
                attributes: ["Categoria"],
                where: {
                    tableroIDTablero: id_tablero
                }
            }], 
            attributes: ["ID_Usuario", "Nombre_Usuario", "Apellido", "Tipo_Usuario", "Descripcion"],
            where: {
                ID_Usuario: id_usuario
            }
        })

        return res.status(200).json({userbuscar})

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "No existe el usuario" });
        }
        if (error.code === 11001) {
            return res.status(400).json({ error: "Ya se ha envitado a este usuario" });
        }
        return res.status(500).json({ error: "error de server" });
    }
}

export const saveHappyBoard = async (req, res) => { /// SOCKET IO
    let id_tablero = req.params.id; 
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
            ]
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
        })

        const prom = suma/count
        const HappyBoard = ((prom+1)/2)*100

        //funcion update
        let happy = await tableros.update({
            Felicidad_Tablero: HappyBoard
        }, {
            where: {
                ID_Tablero: id_tablero
            }
        })

        let traerTablero = await tableros.findOne({
            where: 
                {   
                    ID_Tablero: id_tablero
                }
        })

        return res.status(200).json({traerTablero})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

//usuarios para el nav
export const getUsers = async (req, res) => {
    let id_tablero = req.params.id; 
    //let id_usuario = req.uid;

    try {
        let traerusuarios = await usuarios.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    attributes: ["Categoria"],
                    where: {
                        tableroIDTablero: id_tablero
                    }
                }
            ],
            attributes: ["ID_Usuario", "Nombre_Usuario", "Apellido", "Tipo_Usuario", "Descripcion"]      
        })

        return res.status(200).json({traerusuarios})

    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}


export const getIndicadorDissociated = async (req, res) => {
    let id_tablero = req.params.id; 
    try {
        let indicatores = await indicadores.findAll({
            include: [
                {
                    model: ciclos,
                    required: true,
                    attributes: [],
                    include: [
                        {
                            model: tableros,
                            required: true,
                            attributes: [],
                            where: {
                                ID_Tablero: id_tablero
                            }
                        }
                    ]
                }
            ],
            attributes: ["ID_Indicador", "Felicidad_Indicador"]
        })

        return res.status(200).json({indicatores})
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}