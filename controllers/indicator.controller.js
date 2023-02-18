import sequelize from "../database/connectdb.js";
import tableros from "../models/Board.js";
import ciclos from "../models/Cycle.js";
import indicadores from "../models/Indicator.js";
import usuario_indicador from "../models/User.Indicator.js";

export const createIndicator = async (req, res) => { ///SOCKET IO
    const {nombre_indicador} = req.body; 
    let id_ciclo = req.params.id;
    try {

        let maxIndicator = await indicadores.count({
            where: {
                cicloIDCiclo: id_ciclo
            }
        })

        if(maxIndicator>=10) throw { code: 400}

        let indicator = await indicadores.create({
            Nombre_Indicador: nombre_indicador,
            Felicidad_Indicador: 0,
            cicloIDCiclo: id_ciclo
        })

        return res.status(200).json({indicator})

    } catch (error) {
        if (error.code === 400) {
            return res.status(400).json({ error: "Ya no se puede agregar mas indicadores, máximo 10" });
        }
        return res.status(500).json({ error: "error de server" });
    }
}

export const getIndicator = async (req, res) => { ///SOCKET IO
    let id_ciclo = req.params.id 
    try {
        let indicator = await indicadores.findAll({
            where: {
                cicloIDCiclo: id_ciclo
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
        console.log("Se borro", id_indicador)
        return res.status(200).json({ok: "El indicador fue eliminado con exito"});
        
    } catch (error) {
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
    let id_indicador = req.params.id
    let id_usuario = req.uid
try {
    let indicador = await usuario_indicador.destroy({
        where: {
            usuarioIDUsuario: id_usuario,
            indicadoreIDIndicador: id_indicador
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