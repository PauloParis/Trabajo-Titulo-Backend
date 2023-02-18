import sequelize from "../database/connectdb.js";
import ciclos from "../models/Cycle.js";
import indicadores from "../models/Indicator.js";
import usuario_indicador from "../models/User.Indicator.js";

export const createCycle = async (req, res) => { ///SOCKET IO
    const {nombre_ciclo} = req.body
    let id_tablero = req.params.id;
    try {
        let maxCycle = await ciclos.count({
            where: {
                tableroIDTablero: id_tablero
            }
        })

        if(maxCycle>=10) throw { code: 400}

        let cycle = await ciclos.create({
            Nombre_Ciclo: nombre_ciclo,
            tableroIDTablero: id_tablero,
            Felicidad_Ciclo: 0
        })

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
        return res.status(500).json({ error: "error de server" });
    }
}

export const updateCycle = async (req, res) => { ///SOCKET IO
    let id_ciclo = req.params.id
    const {nombre_ciclo} = req.body;
    try {
        let cycle = await ciclos.update({
            Nombre_Ciclo: nombre_ciclo
        }, {
            where: {
                ID_Ciclo: id_ciclo
            }
        })

        let cycles = await ciclos.findOne({
            where: {
                ID_Ciclo: id_ciclo
            }
        })

        return res.status(200).json({cycles})
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