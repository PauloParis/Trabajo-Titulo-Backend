import jwt from "jsonwebtoken"

//----GENERA EL TOKEN----//
export const generateToken = (uid) => {
    const expiresIn = 60 * 15 //15 minutos
    try {
        const token = jwt.sign({uid}, process.env.JWT_SECRET, {expiresIn})
        return {token, expiresIn}
    } catch (error) {
        console.log(error)  
    }
}

//-----GENERA EL REFRESH TOKEN-----//
export const generateRefreshToken = (uid, res) => {
    const expiresIn = 60 * 60 * 24 //un dia
    try {
        const refreshToken = jwt.sign({uid}, process.env.JWT_REFRESH, {expiresIn})
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: !(process.env.MODO === 'developer'),
            expires: new Date(Date.now() + expiresIn * 1000), //*1000, porq está en milisegundos
            sameSite: 'none'
        })

    } catch (error) {
        console.log(error)
    }
}

//----MENSAJES DE ERROR DEL TOKEN-----//
export const tokenVerificationErrors = {
    'invalid signature': 'Firma del jwt no valida',
    'jwt expired': 'Token expirado',
    'invalid token': 'Token no valido',
    'No Bearer': 'Utiliza el formato Bearer',
    'jwt malformed': 'jwt formato no válido',
}