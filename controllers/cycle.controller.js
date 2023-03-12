import tableros from "../models/Board.js";
import ciclo_indicador from "../models/Cycle.Indicator.js";
import ciclos from "../models/Cycle.js";
import evaluaciones from "../models/Evaluation.js";
import indicadores from "../models/Indicator.js";
import usuario_tablero from "../models/User.Board.js";


// crear ciclo - socket
export const createCycle = async (req, res) => {
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
        return res.status(500).json({ error: "error de server" });
    }
}

// obtener ciclos
export const getCycles = async (req, res) => {
    let id_tablero = req.params.id
    try {
        let cycle = await ciclos.findAll({
            where: {
                tableroIDTablero: id_tablero
            }
        })

        // para obtener la felicidad del tablero
        let board = await tableros.findOne({
            where: {
                ID_Tablero: id_tablero
            }
        })

        return res.json({cycle, board});
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}

// editar ciclo - socket
export const updateCycle = async (req, res) => {
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

// eliminar ciclo - socket
export const deleteCycle = async (req, res) => {
    let id_ciclo = req.params.id;
    let id_tablero = req.params.idt;    
    try {
        
        // elimino el ciclo
        let cycle = await ciclos.destroy({
            where: {
                ID_Ciclo: id_ciclo
            }
        })  
        

        //actualizar el porcentaje de felicidad del tablero
        // sacar promedio y % de las evaluaciones Tablero
        const suma_felicidad_ciclo = await ciclos.sum('Felicidad_Ciclo', {
            where: {
                tableroIDTablero: id_tablero
            }
        })
        const cantidad_felicidad_ciclo = await ciclos.count({
            where: {
                tableroIDTablero: id_tablero
            }
        })
        const promedio_tablero = suma_felicidad_ciclo/cantidad_felicidad_ciclo;
        // actualizar porcentaje de Felicidad en la tabla Tablero
        await tableros.update({
            Felicidad_Tablero: promedio_tablero
        }, {
            where: {
                ID_Tablero: id_tablero
            }
        })

        let board = await tableros.findOne({
            where: {
                ID_Tablero: id_tablero
            }
        })
        
        return res.status(200).json({cycle, board});
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
}
