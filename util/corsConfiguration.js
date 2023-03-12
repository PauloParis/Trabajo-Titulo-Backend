import cors from 'cors'

const whiteList = [process.env.ORIGIN1]

export const corsConfiguration = cors({
    origin: function(origin, callback){
        if( !origin || whiteList.includes(origin) ){ //!origin, para probar con postman y usar el ORIGIN2 que es undefined
            return callback(null, origin);
        }
        return callback("Error de Cors: " + origin + " No autorizado!")
    },
    credentials: true
})