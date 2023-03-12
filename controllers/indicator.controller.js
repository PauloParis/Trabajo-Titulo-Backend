import tableros from "../models/Board.js";
import ciclos from "../models/Cycle.js";
import indicadores from "../models/Indicator.js";
import usuario_tablero from "../models/User.Board.js";
import usuario_indicador from "../models/User.Indicator.js";
import ciclo_indicador from "../models/Cycle.Indicator.js";
import { Op } from "sequelize";
import evaluaciones from "../models/Evaluation.js";
import { actualizarEvaluaciones } from "../util/updateEvaluations.js";


// crear indicador - socket 
export const createIndicator = async (req, res) => { 
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
       
       

        return res.status(200).json({indicator})

    } catch (error) {
        if (error.code === 400) {
            return res.status(400).json({ error: "Ya no se puede agregar mas indicadores, máximo 10" });
        }
        if (error.code === 401) {
            return res.status(401).json({ error: "Porfavor, crear al menos un Ciclo antes de crear Indicadores" });
        }
        return res.status(500).json({ error: "error de server" });
    }
}

// obtener indicadores
export const getIndicator = async (req, res) => { 
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
        return res.status(500).json({ error: "error de server" });
    }
}

// editar indicador - socket
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

        // se incluya la evaluación para que no desaparezca en la vista
        let indicator = await indicadores.findOne({
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
                ID_Indicador: id_indicador
            }
        })

        return res.status(200).json({indicator});
    
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

// eliminar indicador - socket
export const deleteIndicator = async (req, res) => { ///SOCKET IO
    let id_indicador = req.params.id;
    try {

        //buscar INDICADOR_CICLO y obtener el id del ciclo
        let cycle_Indicator = await ciclo_indicador.findAll({
            where: {
                indicadoreIDIndicador: id_indicador
            }
        })
        
        //buscar INDICADORES y obtener el id del tablero
        let indicator_board = await indicadores.findAll({
            where: {
                ID_Indicador: id_indicador
            }
        })


        await indicadores.destroy({
            where: {
                ID_Indicador: id_indicador
            }
        })

        await evaluaciones.destroy({
            where: {
                indicadoreIDIndicador: id_indicador
            }
        })


        //guardar en un array los id de los ciclos
        //actualizar los porcentajes de felicidad de los ciclos
        for(let i=0; i<cycle_Indicator.length ;i++){
            let suma_evaluaciones_ciclo = await evaluaciones.sum('Evaluacion', {
                where: {
                    cicloIDCiclo: cycle_Indicator[i].cicloIDCiclo
                }
            })
            let cantidad_evaluaciones_ciclo = await evaluaciones.count({
                where: {
                    cicloIDCiclo: cycle_Indicator[i].cicloIDCiclo,
                    Evaluacion: {
                        [Op.ne]: null
                    }
                }
            })
            let promedio_ciclo = suma_evaluaciones_ciclo/cantidad_evaluaciones_ciclo;
            let happy_ciclo = ((promedio_ciclo+1)/2)*100;
            await ciclos.update({
                Felicidad_Ciclo: happy_ciclo
            }, {
                where: {
                    ID_Ciclo: cycle_Indicator[i].cicloIDCiclo
                }
            })
        }

        //actualizar el porcentaje de felicidad del tablero
        // sacar promedio y % de las evaluaciones Tablero
        const suma_felicidad_ciclo = await ciclos.sum('Felicidad_Ciclo', {
            where: {
                tableroIDTablero: indicator_board[0].tableroIDTablero
            }
        })
        const cantidad_felicidad_ciclo = await ciclos.count({
            where: {
                tableroIDTablero: indicator_board[0].tableroIDTablero
            }
        })
        let promedio_tablero = suma_felicidad_ciclo/cantidad_felicidad_ciclo;
        // actualizar porcentaje de Felicidad en la tabla Tablero
        await tableros.update({
            Felicidad_Tablero: promedio_tablero
        }, {
            where: {
                ID_Tablero: indicator_board[0].tableroIDTablero
            }
        })

        let board = await tableros.findOne({
            where: {
                ID_Tablero: indicator_board[0].tableroIDTablero
            }
        })
       

        return res.status(200).json({ok: "El indicador fue eliminado con exito", board});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

// eliminar evaluacion -socket
export const deleteEvaluation = async (req, res) => {
    let id_evaluacion = req.params.id
    let idindicador = req.params.idi;
    let idciclo = req.params.idc;
    let idtablero = req.params.idt;
    let iduid = req.uid;
    let bodyevaluacion = null;
    try {
        await evaluaciones.update({
            Evaluacion: null
        }, {
            where: {
                ID_Evaluacion: id_evaluacion,
            }
        })

        await actualizarEvaluaciones(bodyevaluacion, id_evaluacion, idindicador, idciclo, idtablero, iduid);


        let board = await tableros.findOne({
            where: {
                ID_Tablero: idtablero
            }
        })

        return res.status(200).json({ok: "Se elimino la evaluación", board})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
    

}

// solo actualizar evaluacion - socket  || NO % DE FELCIDAD ||
export const updateEvaluation = async (req, res) => {
    try {
        const  { evaluacion } = req.body;
        let id_evaluacion = req.params.id;
        let idindicador = req.params.idi;
        let idciclo = req.params.idc;
        let idtablero = req.params.idt;
        let iduid = req.uid;

        // actualizó evaluación
        await evaluaciones.update({
            Evaluacion: evaluacion
        }, {
            where: {
                ID_Evaluacion: id_evaluacion,
            }
        })

        //-------------------------------------------
        let evaluation = await actualizarEvaluaciones(evaluacion, id_evaluacion, idindicador, idciclo, idtablero, iduid);
        //--------------------------------------

        let board = await tableros.findOne({
            where: {
                ID_Tablero: idtablero
            }
        })

        return res.status(200).json({evaluation, board});

    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}