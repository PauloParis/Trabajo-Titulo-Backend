
const users = [];

// unir usuarios al chat
export const userJoin = (id, username, room, infoUser) => {
    const user = { id, username, room, infoUser };
    const key = users.some((item) => item.username === username)
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
    if(index !== -1) return users.splice(index, 1)[0];
}

export const userLeaveRoom = (idUser, room) => {
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

