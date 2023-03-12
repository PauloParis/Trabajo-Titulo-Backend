import evaluaciones from "../models/Evaluation.js"
import { Op } from "sequelize";
import usuario_indicador from "../models/User.Indicator.js";
import ciclo_indicador from "../models/Cycle.Indicator.js";
import ciclos from "../models/Cycle.js";
import tableros from "../models/Board.js";



export const actualizarEvaluaciones = async (evaluacion, idEvaluacion, idIndicador, idCiclo, idTablero, idUser) => {
    try {


        
        // busco la evaluación actualizada
        let evaluation = await evaluaciones.findOne({
            where: {
                ID_Evaluacion: idEvaluacion,
            }
        })

        // sacar promedio y % de las evaluaciones indicador-usuario
        let suma_evaluaciones_indicador_usuario = await evaluaciones.sum('Evaluacion', {
            where: {
                indicadoreIDIndicador: idIndicador,
                usuarioIDUsuario: idUser
            }
        })
        let cantidad_evaluaciones_indicador_usuario = await evaluaciones.count({
            where: {
                indicadoreIDIndicador: idIndicador,
                usuarioIDUsuario: idUser,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_indicador_usuario = suma_evaluaciones_indicador_usuario/cantidad_evaluaciones_indicador_usuario
        let happy_indicador_usuario = ((promedio_indicador_usuario+1)/2)*100 
  
        // solo si evaluacion = null
        if(suma_evaluaciones_indicador_usuario == null && cantidad_evaluaciones_indicador_usuario == 0 && evaluacion == null){
            happy_indicador_usuario = null
        }

        // actualizar porcentaje de Felicidad (FELICIDAD_USUARIO) en la tabla usuario_indicador
        await usuario_indicador.update({
            Felicidad_Usuario: happy_indicador_usuario
        }, {
            where: {
                indicadoreIDIndicador: idIndicador,
                usuarioIDUsuario: idUser
            }
        })

        // sacar promedio y % de las evaluaciones ciclo-indicador
        let suma_evaluaciones_ciclo_indicador = await evaluaciones.sum('Evaluacion', {
            where: {
                cicloIDCiclo: idCiclo,
                indicadoreIDIndicador: idIndicador
            }
        })
        let cantidad_evaluaciones_ciclo_indicador = await evaluaciones.count({
            where: {
                cicloIDCiclo: idCiclo,
                indicadoreIDIndicador: idIndicador,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_ciclo_indicador = suma_evaluaciones_ciclo_indicador/cantidad_evaluaciones_ciclo_indicador;
        let happy_ciclo_indicador = ((promedio_ciclo_indicador+1)/2)*100
        if(suma_evaluaciones_ciclo_indicador == null && cantidad_evaluaciones_indicador_usuario == 0 && evaluacion == null){
            happy_ciclo_indicador = null
        }

        // actualizar porcentaje de Felicidad (FELICIDAD_INDICADOR) en la tabla ciclo_indicador
        await ciclo_indicador.update({
            Felicidad_Indicador: happy_ciclo_indicador
        }, {
            where: {
                cicloIDCiclo: idCiclo,
                indicadoreIDIndicador: idIndicador
            }
        })

        // sacar promedio y % de las evaluaciones ciclos
        const suma_evaluaciones_ciclo = await evaluaciones.sum('Evaluacion', {
            where: {
                cicloIDCiclo: idCiclo
            }
        })
        const cantidad_evaluaciones_ciclo = await evaluaciones.count({
            where: {
                cicloIDCiclo: idCiclo,
                Evaluacion: {
                    [Op.ne]: null
                }
            }
        })
        const promedio_ciclo = suma_evaluaciones_ciclo/cantidad_evaluaciones_ciclo;
        const happy_ciclo = ((promedio_ciclo+1)/2)*100;

        //actualizar porcentaje de Felicidad en la tabla Ciclos
        await ciclos.update({
            Felicidad_Ciclo: happy_ciclo
        }, {
            where: {
                ID_Ciclo: idCiclo
            }
        })

        // sacar promedio y % de las evaluaciones Tablero
        const suma_felicidad_ciclo = await ciclos.sum('Felicidad_Ciclo', {
            where: {
                tableroIDTablero: idTablero
            }
        })
        const cantidad_felicidad_ciclo = await ciclos.count({
            where: {
                tableroIDTablero: idTablero
            }
        })
        const promedio_tablero = suma_felicidad_ciclo/cantidad_felicidad_ciclo;

        // actualizar porcentaje de Felicidad en la tabla Tablero
        await tableros.update({
            Felicidad_Tablero: promedio_tablero
        }, {
            where: {
                ID_Tablero: idTablero
            }
        })

        return evaluation;

    } catch (error) {
        console.log(error)
        return ({error: 'Error en la función'})
    }
}