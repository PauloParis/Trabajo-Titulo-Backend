

//join user to chat
/* export const userJoin = async(id, idUser, idRoom, room) => {
    try {
        //buscar al usuario
        let infoUsuario = await usuario_tablero.findAll({
            include: [
                {
                    model: usuarios,
                    required: true,
                    attributes: ["ID_Usuario", "Nombre_Usuario", "Apellido", "Email", "Pais", "Tipo_Usuario", "Descripcion"],
                    where: {
                        ID_Usuario: idUser,
                    }  
                },/* {
                    model: tableros,
                    required: true,
                    attributes: ['Nombre_Tablero'],
                } 
            ],
            attributes:  ["Categoria"],
            /* where: {
                tableroIDTablero: idRoom,
            }    
        })

        //console.log(id, idUser, idRoom, room);
        const user = {id, idUser, room, infoUsuario }
        let comprobar = users.some((item) => item[0].idUser == idUser)
        console.log(comprobar)
        //console.log(user.room)
        users.push(user)
        console.log(users)
        return (user)
        //retornar info
    } catch (error) {
        console.log(error)
    }
} */

/* export const userjoin = function(id, idUser, room) {
    const user = {id, idUser, room}
    users.push(user)
    return user
}

export const getCurrentUser = function(id) {
    return users.find(user => user.id == id)
}



export const getRoomUsers = function (room) {
    return users.filter(user => user.room === room)
}
 */


const users = [];

// unir usuarios al chat
export const userJoin = (id, username, room, infoUser) => {
    const user = { id, username, room, infoUser };
    /* const sala = users.some((item) => item.room === room)
    const key = users.some((item) => item.username === username)
    console.log(sala, key) */
    /* if(!(key) || !(sala) ) {
        users.push(user);
        //console.log('usuarios array: ', users)
        return user
    } */
    const key = users.some((item) => item.username === username)
    if(!key) {
        users.push(user);
        return user
    }
    
    //return false   
}

// se obtienen los usuarios conectados
export const getCurrentUser = (id) => {
    return users.find(user => user.id === id);
}

// se filtra al usuario que se desconecta del chat
export const userLeave = (id) => {
    const index = users.findIndex(user => user.id === id);
    if(index !== -1) return users.splice(index, 1)[0];
}

export const userLeaveRoom = (idUser, room) => {
    /* const user = users.filter((item) => item.username != idUser)
    console.log("USUARIOS FILTRADOS: ", user)
    return user */
    const index = users.findIndex(user => (user.username === idUser && user.room === room));
    if(index !== -1) {
        users.splice(index, 1)[0]
        return users;
    }
}

// se filtra a los usuarios conectados de acuerdo a la sala  
export const getRoomUsers = (room) => {
    return users.filter(user => user.room === room);
}

