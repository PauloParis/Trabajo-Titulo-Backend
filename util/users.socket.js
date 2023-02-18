const users = []

//join user to chat
export const userjoin = function(id, idUser, room) {
    const user = {id, idUser, room}
    users.push(user)
    return user
}

export const getCurrentUser = function(id) {
    return users.find(user => user.id == id)
}

export const getRoomUsers = function(room) {
    return users.filter(user => user.room === room)
}
