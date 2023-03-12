
import bcryptjs from "bcryptjs";
import usuarios from "../models/User.js";
import usuario_indicador from "../models/User.Indicator.js"
import { generateToken, generateRefreshToken } from "../util/tokenManager.js";
import indicadores from "../models/Indicator.js";
import ciclos from "../models/Cycle.js";
import tableros from "../models/Board.js";
import usuario_tablero from "../models/User.Board.js"



// Registro de Usuario
export const register = async (req, res) => {
    const {nombre_usuario, apellido, pais, email, password} = req.body;
    let tipo_usuario = 'Estandar'
    try {

        // busco si existe el usuario
        let user = await usuarios.findOne({
            where: {
                Email: email
            }
        });
        if (user) throw { code: 11000 }; // throw error si existe

        if (email == 'vescobar@utem.cl') {
            tipo_usuario = 'Administrador'
        }

        // se hashea la contrasela
        const passwordEncriptada = await bcryptjs.hash(password, 12)

        // creo al usuario
        user = await usuarios.create({
            Nombre_Usuario: nombre_usuario, 
            Apellido: apellido, 
            Pais: pais, 
            Email: email, 
            Password: passwordEncriptada, 
            Tipo_Usuario: tipo_usuario
        });

        return res.status(201).json({ok: "Registro Exitoso"})

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya existe este usuario" });
        }
        return res.status(500).json({ error: "Error de servidor" });
    }
}
// Login de Usuario
export const login = async (req, res) => {
    const {email, password} = req.body;
    try {

        // busco al usuario
        let user = await usuarios.findOne({
            where: {
                Email: email
            }
        });
        if (!user) throw { code: 11000 }; // throw error si no existe

        // comparo las contraseñas
        let passwordUser = user.Password;
        const respuestaPassword = await user.comparePassword(password, passwordUser);
        if (!respuestaPassword)
            return res.status(403).json({ error: "Contraseña incorrecta" });

        // Generar el token JWT
        const typeuser = user.Tipo_Usuario
        const { token, expiresIn } = generateToken(user.ID_Usuario);
        generateRefreshToken(user.ID_Usuario, res);

        return res.status(200).json({ token, expiresIn, typeuser});

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "No existe el usuario" });
        }
        return res.status(500).json({ error: "Error de servidor" });
    }
}
// Traer Información del Usuario Logueado
export const infoUser = async (req, res) => {
    try {
        // traigo la información del usuario y si ha sido agregado a un tablero
        let user = await usuarios.findAll({
            include: [
                {
                    model: usuario_tablero,
                    required: false,
                    attributes: ["Notificacion"],
                    where: {
                        usuarioIDUsuario: req.uid,
                        Notificacion: 1
                    },
                    include: [
                        {
                            model: tableros,
                            required: true,
                            attributes: ['Nombre_Tablero', 'ID_Tablero']
                        }
                    ]
                }
            ],
            where: {
                ID_Usuario: req.uid 
            }
        });

        return res.status(200).json({user})

    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}
// Editar la información del usuario logueado
export const SaveUpdateUser = async (req, res) => {
    const {nombre_usuario, apellido, pais, descripcion} = req.body;
    try {

        await usuarios.update({
             Nombre_Usuario: nombre_usuario,
             Apellido: apellido,
             Pais: pais,
             Descripcion: descripcion
        }, {
            where: {
                ID_Usuario: req.uid
            }
        });

        let user = await usuarios.findOne({
            where: {
                ID_Usuario: req.uid
            }
        })

        return res.json({ok: "Los datos del perfil, fueron actualizados correctamente"})

    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}
// actualizar contraseña
export const updatePassword = async (req, res) => {
    const {password_actual, password_nueva} = req.body;
    try {
        let user = await usuarios.findOne({
            where: {
                ID_Usuario: req.uid
            }
        });
        if (!user) throw { code: 11000 };

        let passwordUser = user.Password;

        const respuestaPassword = await user.comparePassword(password_actual, passwordUser);
        if (!respuestaPassword)
            return res.status(403).json({ error: "La Contraseña Actual no Coincide" });

        const passwordEncriptadaEditada = await bcryptjs.hash(password_nueva, 12)
        console.log("esta es la encriptada"+passwordEncriptadaEditada)


        user = await usuarios.update({
            Password: passwordEncriptadaEditada,
       }, {
           where: {
               ID_Usuario: req.uid
           }
       });

       return res.send({ok: "La Contraseña fue actualizada correctamente"}) 

    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}
// eliminar cuenta de usuario
export const deleteUser = async (req, res) => {
    let id = req.uid
    try {
        let userboard = await usuario_tablero.findAll({
            attributes: [
                'tableroIDTablero'
            ],
            where: {
                usuarioIDUsuario: id
            }
        })
        const idboard = []

        for (var board of userboard){
            idboard.push(board.tableroIDTablero)
          }
        
        await tableros.destroy({
            where: {
                ID_Tablero: idboard
            }
        })

        await usuarios.destroy({
            include: [{
                model: usuario_tablero,
                required: true,
            },
            {
                model: usuario_indicador,
                required: true
            }],
            where: {
                ID_Usuario: id
              }
        })
        
        return res.json({ok: "Su Cuenta fue Eliminada con Exito"})
    } catch (error) {
        return res.status(500).json({error: "error de server"})
    }
}
//listo
export const refreshToken = async (req, res) => {
    try {
        const { token, expiresIn } = generateToken(req.uid);
        const typeUser = await usuarios.findOne({
            attributes: ['Tipo_Usuario'],
            where: {
                ID_Usuario: req.uid
            }
        })
        return res.json({ token, expiresIn, typeUser });
    } catch (error) {
        return res.status(500).json({ error: "error de server" });
    }
};
//listo
export const logout = (req, res) => {
    res.clearCookie("refreshToken", {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ok: 'logout'})
}