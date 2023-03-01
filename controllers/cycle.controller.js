import sequelize from "../database/connectdb.js";
import ciclo_indicador from "../models/Cycle.Indicator.js";
import ciclos from "../models/Cycle.js";
import evaluaciones from "../models/Evaluation.js";
import indicadores from "../models/Indicator.js";
import usuario_tablero from "../models/User.Board.js";
import usuario_indicador from "../models/User.Indicator.js";

export const createCycle = async (req, res) => { ///SOCKET IO
    const {nombre_ciclo} = req.body
    let id_tablero = req.params.id;
    try {
        // solo se pueden crear 10 ciclos
        let maxCycle = await ciclos.count({
            where: {
                tableroIDTablero: id_tablero
            }
        })
        if(maxCycle>=10) throw { code: 400} // si excede los 10 throw error

        // creo el ciclo
        let cycle = await ciclos.create({
            Nombre_Ciclo: nombre_ciclo,
            tableroIDTablero: id_tablero,
            Felicidad_Ciclo: 0
        })

        // busco indicadores relaciones al tablero
        let indicadores_del_tablero = await indicadores.findAll({
            attributes: [
                'ID_Indicador'
            ],
            where: {
                tableroIDTablero: id_tablero
            }
        })

        /* Creo la tabla ciclo_indicador por cada indicador perteneciente al tablero,
        en relacion al ciclo creado */
        if(indicadores_del_tablero.length != 0) { // compruebo que hayan indicadores creados
            for(let i=0 ; i<indicadores_del_tablero.length ; i++){
                await ciclo_indicador.create({
                    Felicidad_Indicador: null,
                    cicloIDCiclo: cycle.ID_Ciclo,
                    indicadoreIDIndicador: indicadores_del_tablero[i].ID_Indicador
                })
            }
        }

        // busco usuarios relacionados al tablero
        let usuarios_del_tablero = await usuario_tablero.findAll({
            attributes: [
                'usuarioIDUsuario'
            ],
            where: {
                tableroIDTablero: id_tablero
            }
        })
        

        // for usuarios
        for (let usu=0 ; usu<usuarios_del_tablero.length ; usu++) {
            // for indicadores
            for(let ind=0 ; ind<indicadores_del_tablero.length ; ind++ ){
                // crear tabla Evaluaciones
                let evaluation = await evaluaciones.create({
                    Evaluacion: null,
                    cicloIDCiclo: cycle.ID_Ciclo,
                    indicadoreIDIndicador: indicadores_del_tablero[ind].ID_Indicador,
                    usuarioIDUsuario: usuarios_del_tablero[usu].usuarioIDUsuario
                })
            }
        }
        


        return res.status(200).json({cycle})
    } catch (error) {
        if (error.code === 400) {
            return res.status(400).json({ error: "Ya no se puede agregar mas ciclos, máximo 10" });
        }
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const getCycles = async (req, res) => { ///SOCKET IO
    let id_tablero = req.params.id
    try {
        let cycle = await ciclos.findAll({
            where: {
                tableroIDTablero: id_tablero
            }
        })

        return res.json({cycle});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}

export const updateCycle = async (req, res) => { ///SOCKET IO
    let id_ciclo = req.params.id
    const {nombre_ciclo} = req.body;
    try {
        await ciclos.update({
            Nombre_Ciclo: nombre_ciclo
        }, {
            where: {
                ID_Ciclo: id_ciclo
            }
        })

        let cycle = await ciclos.findOne({
            where: {
                ID_Ciclo: id_ciclo
            }
        })

        return res.status(200).json({cycle})
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const deleteCycle = async (req, res) => { ///SOCKET IO
    let id_ciclo = req.params.id;
    try {
        let cycle = await ciclos.destroy({
            where: {
                ID_Ciclo: id_ciclo
            }
        })   
        
        return res.status(200).json({ok: "El ciclo fue eliminado con exito"});
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

export const saveHappyCycle = async (req, res) => { ///SOCKET IO
    let id_ciclo = req.params.id;
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
                        where: {
                            ID_Ciclo: id_ciclo
                        }
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
                            where: {
                                ID_Ciclo: id_ciclo
                            }
                        }
                    ]
                }
            ],
        })

        const prom = suma/count
        const HappyCycle = ((prom+1)/2)*100

        //funcion update
        let happy = await ciclos.update({
            Felicidad_Ciclo: HappyCycle
        }, {
            where: {
                ID_Ciclo: id_ciclo
            }
        })

        let traerCiclo = await ciclos.findOne({
            where: 
                {   
                    ID_Ciclo: id_ciclo
                }
        })

        return res.status(200).json({traerCiclo})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "error de server" });
    }
}