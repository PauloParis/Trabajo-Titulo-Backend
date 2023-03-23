
const users = [];

// unir usuarios al chat
export const userJoin = (id, idUser, room, infoUser) => {
    const user = { id, idUser, room, infoUser };
    const key = users.some((item) => item.idUser === idUser)
    if(!key) {
        users.push(user);
        return user
    }
}

// se obtienen los usuarios conectados
export const getCurrentUser = (id) => {
    return users.find(user => user.id === id);
}

// se filtra al usuario que se desconecta del chat
export const userLeave = (id) => {
    const index = users.findIndex(user => user.id === id);
    if(index !== -1) return users.splice(index, 1)
}

export const userLeaveRoom = (idUser, room) => {
    const index = users.findIndex(user => (user.idUser === idUser && user.room === room));
    if(index !== -1) { // sino encuentra nada devuelve -1
        users.splice(index, 1)
        return users;
    }
}

// se filtra a los usuarios conectados de acuerdo a la sala  
export const getRoomUsers = (room) => {
    return users.filter(user => user.room === room);
}

