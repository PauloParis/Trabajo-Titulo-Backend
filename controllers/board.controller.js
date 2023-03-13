import tableros from "../models/Board.js";
import ciclo_indicador from "../models/Cycle.Indicator.js";
import ciclos from "../models/Cycle.js";
import evaluaciones from "../models/Evaluation.js";
import indicadores from "../models/Indicator.js";
import usuario_tablero from "../models/User.Board.js";
import usuario_indicador from "../models/User.Indicator.js";
import usuarios from "../models/User.js";
import { Op } from "sequelize";

// crear tablero
export const createBoard = async (req, res) => {
    const {nombre_tablero, semestre, color} = req.body;
    try {

        // busco si existe el tablero con el mismo nombre
        let board = await tableros.findOne({
            where: {
                Nombre_Tablero: nombre_tablero
            }
        });

        if (board) throw { code: 11000 }; // si existe tablero con el mismo nombre


        // solo se pueden crear 5 tableros
        let maxBoard = await usuario_tablero.count({
            where: {
                tableroIDTablero: id_tablero,
                Categoria: 'Creador'
            }
        })
        if(maxBoard>=5) throw { code: 400} // si excede los 5 throw error

        // se obtiene el año
        const date = new Date();
        let year = date.getFullYear();
        
        await tableros.create({
            Nombre_Tablero: nombre_tablero,
            Anio: year,
            Semestre: semestre,
            Color: color,
            Felicidad_Tablero: 0
        })

        // se obtiene el id del tablero
        let idboard = await tableros.findOne({
            where: {
                Nombre_Tablero: nombre_tablero
            }
        })

        let id_tablero = idboard.ID_Tablero // id-tablero creado

        // guardar info en la tabla usuario_Tablero
        await usuario_tablero.create({
            Categoria: 'Creador',
            usuarioIDUsuario: req.uid,
            tableroIDTablero: id_tablero
        })

        let myboard = await tableros.findOne({
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
            return res.status(400).json({ error: "Ya existe un tablero con el mismo nombre" });
        }
        if (error.code === 400) {
            return res.status(400).json({ error: "Solo puede crear un máximo de 5 tableros" });
        }
        return res.status(500).json({ error: "error de server" });
    }
}

// editar tablero
export const updateBoard = async (req, res) => {
    const {nombre_tablero, anio, semestre, color} = req.body;
    let id_tablero = req.params.id;
    try {
        var largoAnio = anio.toString().length; 
        if (largoAnio == 4 && anio<=2155 && anio>=1901) {
            
            await tableros.update({
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

// eliminar tablero
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

// desvincularse de un tablero
export const disassociateBoard = async (req, res) => {
    let id_tablero =  req.params.idt;
    let id_usuario = req.params.idu;

    try {

        // destruir relación usuario-tablero
        await usuario_tablero.destroy({
            where: {
                usuarioIDUsuario: id_usuario,
                tableroIDTablero: id_tablero,
            }
        })

        // buscar los indicadores del tablero
        let indicadores_del_tablero = await indicadores.findAll({
            attributes: ['ID_Indicador', 'Nombre_Indicador'],
            where:{
                tableroIDTablero: id_tablero
            }
        })


        
        // destruir usuario_indicador where: id_indicador and req.uid
        for (let i = 0 ; i< indicadores_del_tablero.length ; i++) {
            await usuario_indicador.destroy({
                where: {
                    indicadoreIDIndicador: indicadores_del_tablero[i].ID_Indicador,
                    usuarioIDUsuario: id_usuario
                }
            })
        }
        // destruir evaluaciones where: id_indicador and req.uid

  
        // buscar los ciclos del tablero
        let ciclos_del_tablero = await ciclos.findAll({
            attributes: ['ID_Ciclo', 'Nombre_Ciclo'],
            where: {
                tableroIDTablero: id_tablero
            }
        })
        // suma de las evaluaciones where: id_indicador and id_ciclo and evaluacion != null
        // cuento las evaluaciones where:  id_indicador and id_ciclo and evaluacion != null
        // hago la formula
        // hago los if suma == null and count == 0

     
        // doble for y actualizo ciclo_indicador where: id_indicador and id_ciclo
        for (let ind=0 ; ind<indicadores_del_tablero.length ; ind ++) {
            for(let cic=0 ; cic<ciclos_del_tablero.length ; cic ++){
                // destruyo los campos de evaluaciones
                await evaluaciones.destroy({
                    where: {
                        usuarioIDUsuario: id_usuario,
                        cicloIDCiclo: ciclos_del_tablero[cic].ID_Ciclo,
                        indicadoreIDIndicador: indicadores_del_tablero[ind].ID_Indicador
                    }
                })

          
                // actualizó los valores de ciclo_indicador
                let suma_evaluaciones_ciclo_indicador = await evaluaciones.sum('Evaluacion', {
                    where: {
                        cicloIDCiclo: ciclos_del_tablero[cic].ID_Ciclo,
                        indicadoreIDIndicador: indicadores_del_tablero[ind].ID_Indicador
                    }
                })
               
                let cantidad_evaluaciones_ciclo_indicador = await evaluaciones.count({
                    where: {
                        cicloIDCiclo: ciclos_del_tablero[cic].ID_Ciclo,
                        indicadoreIDIndicador: indicadores_del_tablero[ind].ID_Indicador,
                        Evaluacion: {
                            [Op.ne]: null
                        }
                    }
                })
              
                let promedio_ciclo_indicador = suma_evaluaciones_ciclo_indicador/cantidad_evaluaciones_ciclo_indicador;
                let happy_ciclo_indicador = ((promedio_ciclo_indicador+1)/2)*100
                await ciclo_indicador.update({
                    Felicidad_Indicador: happy_ciclo_indicador
                },{
                    where: {
                        cicloIDCiclo: ciclos_del_tablero[cic].ID_Ciclo,
                        indicadoreIDIndicador: indicadores_del_tablero[ind].ID_Indicador
                    }
                })
            }
        }

        for(let j=0 ; j<ciclos_del_tablero.length ; j++){
            let suma_evaluaciones_ciclo = await evaluaciones.sum('Evaluacion', {
                where: {
                    cicloIDCiclo: ciclos_del_tablero[j].ID_Ciclo
                }
            })
         
            let cantidad_evaluaciones_ciclo = await evaluaciones.count({
                where: {
                    cicloIDCiclo: ciclos_del_tablero[j].ID_Ciclo,
                    Evaluacion: {
                        [Op.ne]: null
                    }
                }
            }) 
     
            let promedio_ciclo = suma_evaluaciones_ciclo/cantidad_evaluaciones_ciclo
            let happy_ciclo = ((promedio_ciclo+1)/2)*100
            await ciclos.update({
                Felicidad_Ciclo: happy_ciclo
            }, {
                where: {
                    ID_Ciclo: ciclos_del_tablero[j].ID_Ciclo
                }
            })
        }


        let suma_felicidad_ciclo = await ciclos.sum('Felicidad_Ciclo', {
            where: {
                tableroIDTablero: id_tablero
            }
        })

        let cantidad_felicidad_ciclo = await ciclos.count({
            where: {
                tableroIDTablero: id_tablero
            }
        })

        let promedio_tablero = suma_felicidad_ciclo/cantidad_felicidad_ciclo
        await tableros.update({
            Felicidad_Tablero: promedio_tablero
        }, {
            where: {
                ID_Tablero: id_tablero
            }
        })

        let Board = await tableros.findOne({
            where: {
                ID_Tablero: id_tablero
            }
        })

        return res.status(200).json({Board})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

// traer tableros del creador
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

// traer tableros del invitado
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

// invitar usuario
export const invitationUser = async (req, res) => {
    const {email} = req.body;
    let id_tablero = req.params.id
    try {
        // busco al usuario que se pretende invitar
        let user = await usuarios.findOne({
            where: {
                Email: email
            }
        })
        if (!user) throw { code: 11000 }; // sino existe el usuario

        let id_usuario = user.ID_Usuario

        //buscar si ya se invitó
        let userboardbuscar = await usuario_tablero.findOne({
            where: {
                usuarioIDUsuario: id_usuario,
                tableroIDTablero: id_tablero
            }
        })
        if (userboardbuscar) throw { code: 11001 }; // si ya se invitó


        // solo se pueden invitar 5 usuarios
        let maxUser = await usuario_tablero.count({
            where: {
                tableroIDTablero: id_tablero
            }
        })
        if(maxUser>=5) throw { code: 400} // si excede los 5 throw error


        // creo la tabla usuario_tablero
        await usuario_tablero.create({
            Categoria: 'Invitado',
            Notificacion: 1,
            usuarioIDUsuario: id_usuario,
            tableroIDTablero: id_tablero
        })


        //buscar los indicadores relacionados al tablero
        let indicadores_del_tablero = await indicadores.findAll({
            where: {
                tableroIDTablero: id_tablero
            }
        })

         /* creo la tabla usuario_indicador, por cada indicador perteneciente al tablero,
        en relación al usuario invitado */
        if(indicadores_del_tablero.length != 0) { // compruebo que hayan indicadores creados
            for(let i=0 ; i<indicadores_del_tablero.length ; i++){
                await usuario_indicador.create({
                    Felicidad_Usuario: null,
                    usuarioIDUsuario: id_usuario,
                    indicadoreIDIndicador: indicadores_del_tablero[i].ID_Indicador
                })
            }
        }
        
        // buscar los ciclos relacionados al tablero
        let ciclos_del_tablero = await ciclos.findAll({
            attributes: [
                'ID_Ciclo'
            ],
            where: {
                tableroIDTablero: id_tablero
            }
        })

        // for ciclos
        for(let cic=0 ; cic<ciclos_del_tablero.length ; cic++) {
            // for indicadores
            for(let ind=0 ; ind<indicadores_del_tablero.length ; ind++) {
                //creo la tabla Evaluaciones
                let evaluation = await evaluaciones.create({
                    evaluaciones: null,
                    usuarioIDUsuario: id_usuario,
                    cicloIDCiclo: ciclos_del_tablero[cic].ID_Ciclo,
                    indicadoreIDIndicador: indicadores_del_tablero[ind].ID_Indicador
                })
            }
        }
        

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



        return res.status(200).json({indicadores_del_tablero})

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "No existe el usuario" });
        }
        if (error.code === 11001) {
            return res.status(400).json({ error: "Ya se ha envitado a este usuario" });
        }
        if (error.code === 400) {
            return res.status(400).json({ error: "Solo se puede invitar 5 usuarios por tablero" });
        }
        return res.status(500).json({ error: "error de server" });
    }
}

// traer información del usuario - socket
export const getInfoUserSocket = async (req, res) => {
    let id_tablero = req.params.id
    let id_user = req.uid;
    try {
        
        let infoUser = await usuarios.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: true,
                    attributes: ['Categoria'],
                    where: {
                        usuarioIDUsuario: id_user,
                        tableroIDTablero: id_tablero
                    }
                }
            ],
            attributes: ['Nombre_Usuario', 'Apellido', 'Email', 'Pais', 'Tipo_Usuario', 'Descripcion']
        })

        return res.status(200).json({infoUser});

    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

// actualizar notificación (añadido a un tablero)
export const updateNotify = async (req, res) => {
    let id_tablero = req.params.id;
    let id_usuario = req.uid;
    try {
        await usuario_tablero.update({
            Notificacion: 0
        },{
            where: {
                tableroIDTablero: id_tablero,
                usuarioIDUsuario: id_usuario
            }
        })

        return res.status(200).json({ok: "Listo"})

    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}