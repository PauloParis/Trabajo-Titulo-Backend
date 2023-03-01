import sequelize from "../database/connectdb.js";
import tableros from "../models/Board.js";
import ciclos from "../models/Cycle.js";
import indicadores from "../models/Indicator.js";
import usuario_tablero from "../models/User.Board.js";
import usuario_indicador from "../models/User.Indicator.js";
import ciclo_indicador from "../models/Cycle.Indicator.js";
import { Op } from "sequelize";
import evaluaciones from "../models/Evaluation.js";

export const createIndicator = async (req, res) => { ///SOCKET IO
    const {nombre_indicador} = req.body; 
    let id_tablero = req.params.id;
    try {
        // Solo se pueden crear 10 indicadores
        let maxIndicator = await indicadores.count({ // cuento los indicadores existentes
            where: {
                tableroIDTablero: id_tablero
            }
        })
        if(maxIndicator>=10) throw { code: 400} // si excede los 10 throw error


        // restricción sino existen el ciclos
        let buscarCiclos = await ciclos.findAll({
            where: {
                tableroIDTablero: id_tablero
            }
        })
        if(!buscarCiclos.length) throw { code: 401 } // si no existe ciclos throw error
        

        // creo el indicador
        let indicator = await indicadores.create({
            Nombre_Indicador: nombre_indicador,
            //Felicidad_Indicador: 0,
            tableroIDTablero: id_tablero
        })

        /* console.log(indicator.ID_Indicador) */
        // busco el id del indicador recien creado
        /* let indicadorCreado = await indicadores.findOne({
            attributes: [
                'ID_Indicador'
            ],  
            where: {
                Nombre_Indicador: nombre_indicador,
                tableroIDTablero: id_tablero
            }
        }) */

        //busco usuarios relacionados al tablero
        let usuarios_del_tablero = await usuario_tablero.findAll({
            attributes: [
                'usuarioIDUsuario'
            ],
            where: {
                tableroIDTablero: id_tablero
            }
        })

        /* creo la tabla usuario_indicador, por cada usuario perteneciente al tablero,
        en relación a los indicadores  */
       for(let i= 0 ; i<usuarios_del_tablero.length ; i++){
        await usuario_indicador.create({
            Felicidad_Usuario: null,
            usuarioIDUsuario: usuarios_del_tablero[i].usuarioIDUsuario,
            indicadoreIDIndicador: indicator.ID_Indicador
        })
       }


       //busco ciclos relacionados al tablero
       let ciclos_del_tablero = await ciclos.findAll({
            attributes: [
                'ID_Ciclo'
            ],
            where: {
                tableroIDTablero: id_tablero
            }
       })



       /* creo la tabla ciclo_indicador por cada ciclo perteneciente al tablero,
       en relacion al indicador creado */
       for(let j=0 ; j<ciclos_del_tablero.length ; j++){
        await ciclo_indicador.create({
            Felicidad_Indicador: null,
            cicloIDCiclo: ciclos_del_tablero[j].ID_Ciclo,
            indicadoreIDIndicador: indicator.ID_Indicador
        })
       }


       // for usuarios
       for (let usu=0 ; usu<usuarios_del_tablero.length ; usu++){
        // for ciclos
        for(let cic=0 ; cic<ciclos_del_tablero.length ; cic++ ) {
            //creo la tabla Evaluaciones
            let evaluation = await evaluaciones.create({
                Evaluacion: null,
                cicloIDCiclo: ciclos_del_tablero[cic].ID_Ciclo,
                indicadoreIDIndicador: indicator.ID_Indicador,
                usuarioIDUsuario: usuarios_del_tablero[usu].usuarioIDUsuario
            })
        }
       }
       
       


        //return res.json({indicadorCreado})
        return res.status(200).json({indicator})

    } catch (error) {
        if (error.code === 400) {
            return res.status(400).json({ error: "Ya no se puede agregar mas indicadores, máximo 10" });
        }
        if (error.code === 401) {
            return res.status(401).json({ error: "Porfavor, crear al menos un Ciclo antes de crear Indicadores" });
        }
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const getIndicator = async (req, res) => { ///SOCKET IO
    let id_tablero = req.params.id 
    try {
        let indicator = await indicadores.findAll({
            include: [
                {
                    model: evaluaciones,
                    required: true,
                    where: {
                        usuarioIDUsuario: req.uid
                    }
                }
            ],
            where: {
                tableroIDTablero: id_tablero
            }
        })   
         
        return res.status(200).json({indicator});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const updateIndicator = async (req, res) => {
    let id_indicador = req.params.id;
    const {nombre_indicador} = req.body;
    try {

        await indicadores.update({
            Nombre_Indicador: nombre_indicador
        }, {
            where: {
                ID_Indicador: id_indicador
            }
        })

        let indicator = await indicadores.findOne({
            where: {
                ID_Indicador: id_indicador
            }
        })

        return res.status(200).json({indicator});
    
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const deleteIndicator = async (req, res) => { ///SOCKET IO
    let id_indicador = req.params.id;
    
    try {
        let indicator = await indicadores.destroy({
            where: {
                ID_Indicador: id_indicador
            }
        })

        await evaluaciones.destroy({
            where: {
                indicadoreIDIndicador: id_indicador
            }
        })

        return res.status(200).json({ok: "El indicador fue eliminado con exito"});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const createEvaluation = async (req, res) => { ///SOCKET IO
    let {evaluacion} = req.body;
    let id_indicador = req.params.id
    try {

        let existe = await usuario_indicador.findOne({
            where: {
                usuarioIDUsuario: req.uid,
                indicadoreIDIndicador: id_indicador,
            }
        })

        if(existe) throw { code: 11000 }

        let indicator = await usuario_indicador.create({
            usuarioIDUsuario: req.uid,
            indicadoreIDIndicador: id_indicador,
            Evaluacion: evaluacion, //la primera vez solo se recibe -1 , 0 , 1
        })
        
        return res.status(200).json({indicator})
        
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya se realizó la evaluación a este Indicador" });
        }
        return res.status(500).json({ error: "error de server" });
    }
}

export const deleteEvaluation = async (req, res) => {
    let id_evaluacion = req.params.id
    let idindicador = req.params.idi;
    let idciclo = req.params.idc;
    let idtablero = req.params.idt;
    let iduid = req.uid;
    try {
        let evaluacion = await evaluaciones.update({
            Evaluacion: null
        }, {
            where: {
                ID_Evaluacion: id_evaluacion,
            }
        })

        // busco la evaluación actualizada
        let evaluation = await evaluaciones.findOne({
            where: {
                ID_Evaluacion: id_evaluacion
            }
        })

        // sacar promedio y % de las evaluaciones indicador-usuario
        let suma_evaluaciones_indicador_usuario = await evaluaciones.sum('Evaluacion', {
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid
            }
        })
        let cantidad_evaluaciones_indicador_usuario = await evaluaciones.count({
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })

        /* console.log(suma_evaluaciones_indicador_usuario, ' - ', cantidad_evaluaciones_indicador_usuario) */
        const promedio_indicador_usuario = suma_evaluaciones_indicador_usuario/cantidad_evaluaciones_indicador_usuario
        let happy_indicador_usuario = ((promedio_indicador_usuario+1)/2)*100 

        if(suma_evaluaciones_indicador_usuario == null && cantidad_evaluaciones_indicador_usuario == 0){
            happy_indicador_usuario = null
        }
        /* console.log(iduid, ' - ', idindicador, ' - ', happy_indicador_usuario) */
        // actualizar porcentaje de Felicidad (FELICIDAD_USUARIO) en la tabla usuario_indicador
        await usuario_indicador.update({
            Felicidad_Usuario: happy_indicador_usuario
        }, {
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid
            }
        })

        let suma_evaluaciones_ciclo_indicador = await evaluaciones.sum('Evaluacion', {
            where: {
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador
            }
        })
        let cantidad_evaluaciones_ciclo_indicador = await evaluaciones.count({
            where: {
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_ciclo_indicador = suma_evaluaciones_ciclo_indicador/cantidad_evaluaciones_ciclo_indicador;
        let happy_ciclo_indicador = ((promedio_ciclo_indicador+1)/2)*100

        if(suma_evaluaciones_ciclo_indicador == null && cantidad_evaluaciones_indicador_usuario == 0){
            happy_ciclo_indicador = null
        }
        // actualizar porcentaje de Felicidad (FELICIDAD_INDICADOR) en la tabla ciclo_indicador
        await ciclo_indicador.update({
            Felicidad_Indicador: happy_ciclo_indicador
        }, {
            where: {
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador
            }
        })

        const suma_evaluaciones_ciclo = await evaluaciones.sum('Evaluacion', {
            where: {
                cicloIDCiclo: idciclo
            }
        })
        const cantidad_evaluaciones_ciclo = await evaluaciones.count({
            where: {
                cicloIDCiclo: idciclo,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_ciclo = suma_evaluaciones_ciclo/cantidad_evaluaciones_ciclo;
        const happy_ciclo = ((promedio_ciclo+1)/2)*100

        await ciclos.update({
            Felicidad_Ciclo: happy_ciclo
        }, {
            where: {
                ID_Ciclo: idciclo
            }
        })


        const suma_felicidad_ciclo = await ciclos.sum('Felicidad_Ciclo', {
            where: {
                tableroIDTablero: idtablero
            }
        })
        const cantidad_felicidad_ciclo = await ciclos.count({
            where: {
                tableroIDTablero: idtablero
            }
        })
        const promedio_tablero = suma_felicidad_ciclo/cantidad_felicidad_ciclo;
        //const happy_tablero = ((promedio_tablero+1)/2)*100
        await tableros.update({
            Felicidad_Tablero: promedio_tablero
        }, {
            where: {
                ID_Tablero: idtablero
            }
        })



        return res.status(200).json({ok: "Se elimino la evaluación"})
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
    

}

export const saveHappyIndicator = async (req, res) => { ///SOCKET IO
    let id_indicador = req.params.id;
    try {
        let suma = await usuario_indicador.sum('Evaluacion',{
            include: [
                {
                 model: indicadores,
                 required: true   
                }
            ],
            where: {
                indicadoreIDIndicador: id_indicador
            }
        })
        
        let count = await usuario_indicador.count({
            where: {
                indicadoreIDIndicador: id_indicador
            }
        })

        const prom = suma/count
        const HappyIndicator = ((prom+1)/2)*100

        //funcion update
        let happy = await indicadores.update({
            Felicidad_Indicador: HappyIndicator
        }, {
            where: {
                ID_Indicador: id_indicador
            }
        })

        return res.json({ok: "El indice de Felicidad del indicador es: "+ HappyIndicator + " %"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}




// solo actualizar evaluacion, || NO % DE FELCIDAD ||
export const updateEvaluation = async (req, res) => {
    try {
        const  { evaluacion } = req.body;
        let idindicador = req.params.idi;
        let idciclo = req.params.idc;
        let idtablero = req.params.idt;
        let iduid = req.uid;

        // actualizó evaluación
        await evaluaciones.update({
            Evaluacion: evaluacion
        }, {
            where: {
                usuarioIDUsuario: iduid,
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador
            }
        })
        // busco la evaluación actualizada
        let evaluation = await evaluaciones.findOne({
            where: {
                usuarioIDUsuario: iduid,
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador
            }
        })


        // buscar todas las evaluaciones del id indicador y del id usuario en la tabla evaluaciones
        /* let buscar_evaluaciones_indicador_usuario = await evaluaciones.findAll({
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid
            }
        }) */
        // sacar promedio y % de las evaluaciones indicador-usuario
        let suma_evaluaciones_indicador_usuario = await evaluaciones.sum('Evaluacion', {
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid
            }
        })
        let cantidad_evaluaciones_indicador_usuario = await evaluaciones.count({
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid
            }
        })
        const promedio_indicador_usuario = suma_evaluaciones_indicador_usuario/cantidad_evaluaciones_indicador_usuario
        const happy_indicador_usuario = ((promedio_indicador_usuario+1)/2)*100 

        // actualizar porcentaje de Felicidad (FELICIDAD_USUARIO) en la tabla usuario_indicador
        await usuario_indicador.update({
            Felicidad_Usuario: happy_indicador_usuario
        }, {
            where: {
                indicadoreIDIndicador: idindicador,
                usuarioIDUsuario: iduid
            }
        })


        let suma_evaluaciones_ciclo_indicador = await evaluaciones.sum('Evaluacion', {
            where: {
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador
            }
        })
        let cantidad_evaluaciones_ciclo_indicador = await evaluaciones.count({
            where: {
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_ciclo_indicador = suma_evaluaciones_ciclo_indicador/cantidad_evaluaciones_ciclo_indicador;
        const happy_ciclo_indicador = ((promedio_ciclo_indicador+1)/2)*100

        // actualizar porcentaje de Felicidad (FELICIDAD_INDICADOR) en la tabla ciclo_indicador
        await ciclo_indicador.update({
            Felicidad_Indicador: happy_ciclo_indicador
        }, {
            where: {
                cicloIDCiclo: idciclo,
                indicadoreIDIndicador: idindicador
            }
        })



        const suma_evaluaciones_ciclo = await evaluaciones.sum('Evaluacion', {
            where: {
                cicloIDCiclo: idciclo
            }
        })
        const cantidad_evaluaciones_ciclo = await evaluaciones.count({
            where: {
                cicloIDCiclo: idciclo,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_ciclo = suma_evaluaciones_ciclo/cantidad_evaluaciones_ciclo;
        const happy_ciclo = ((promedio_ciclo+1)/2)*100

        await ciclos.update({
            Felicidad_Ciclo: happy_ciclo
        }, {
            where: {
                ID_Ciclo: idciclo
            }
        })


        const suma_felicidad_ciclo = await ciclos.sum('Felicidad_Ciclo', {
            where: {
                tableroIDTablero: idtablero
            }
        })
        const cantidad_felicidad_ciclo = await ciclos.count({
            where: {
                tableroIDTablero: idtablero
            }
        })
        const promedio_tablero = suma_felicidad_ciclo/cantidad_felicidad_ciclo;
        //const happy_tablero = ((promedio_tablero+1)/2)*100
        await tableros.update({
            Felicidad_Tablero: promedio_tablero
        }, {
            where: {
                ID_Tablero: idtablero
            }
        })


        return res.status(200).json({evaluation});

        // actualizar felicidad indicador

        // usuarios que hayan votado en el indicador-ciclo
        /* await usuario_indicador.findAll({
            include: [
                {
                    model: indicadores,
                    required: true,
                    where: {
                        ID_Indicador: idindicador
                    },
                    include: [
                        {
                            model: ciclo_indicador,
                            required: true,
                            where: {
                                Evaluacion: {
                                    [Op.ne]: null //Op.ne <=> !=
                                },
                                cicloIDCiclo: idciclo
                            }
                        }
                    ]
                }
            ],
            attributes: [
                'usuarioIDUsuario'
            ],
            where: {
                usuarioIDUsuario: uid
            }
        }) */
        // se suman esas evalauciones
        // se cuenta cuantas evaluaciones fueron
        // se saca el promedio
        // se actualiza el Felicidad_Indicador

        // actualizar evaluacion
        /* await ciclo_indicador.update({
            Evaluacion: evaluation,
        }, {
            where: {
                indicadoreIDIndicador: idindicador,
                cicloIDCiclo: idciclo
            }
        }) */


    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}