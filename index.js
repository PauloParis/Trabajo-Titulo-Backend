import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import { Server } from "socket.io";
import http from "http"
import { Router } from "express";

//importar Base de datos
import "./database/connectdb.js"

//Importar Rutas
import authRouter from "./routes/auth.router.js"
import boardRouter from "./routes/board.router.js"
import cycleRouter from "./routes/cycle.router.js"
import indicatorRouter from "./routes/indicator.router.js"
import adminRouter from "./routes/admin.router.js"
import { corsConfiguration } from "./util/corsConfiguration.js";

//Importar util de socket
import {getCurrentUser, getRoomUsers, userJoin, userLeave, userLeaveRoom} from "./util/users.socket.js"
import { formatMessage } from "./util/messages.js";

const app  = express()
const router = Router();
const server = http.createServer(app)

//configuración socket para cors
const io = new Server(server, {
    //transports: ['polling'],
    cors: {
        origin: "http://localhost:9000",
        methods: ["GET", "POST"]
    },
})



app.use(corsConfiguration);


app.use(express.json())
app.use(cookieParser())


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/board', boardRouter);
app.use('/api/v1/cycle', cycleRouter);
app.use('/api/v1/indicator', indicatorRouter);
app.use('/api/v1/admin', adminRouter);

const botName = 'Room Chat BOT'

io.on("connection", (socket) => {

    socket.on('joinRoom', ({idUser, room, infoUser}) => { // Se crea la sala
        const user = userJoin(socket.id, idUser, room, infoUser) //pujo al usuario al array de usuarios de la sala especifica

            socket.join(user.room); //uno al usuario a la sala
            socket.emit('message', formatMessage(botName, 'Bienvenido(a) a Room Chat'));

            socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} se ha unido al chat`)) // to(user.room), envia el mensaje en la sala correcta

            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })

        //salirse del room
    socket.on('leaveRoom', ({idUser, room}) => {
        const user = userLeaveRoom(idUser, room);
        
        if(user) {
            // send users and room info
            io.to(room).emit('roomUsers', {
                room: room,
                users: getRoomUsers(room)
            })
        }
        
    })

    })


    

    // listen fot charMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })


    socket.on('crearCiclo', (ciclo) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('crearCiclo', ciclo);
    })

    socket.on('editarCiclo', (ciclo) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('editarCiclo', ciclo);
    })

    socket.on('eliminarCiclo', (ciclo) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('eliminarCiclo', ciclo);
    })

    socket.on('crearIndicador', (indicador) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('crearIndicador', indicador);
    })

    socket.on('editarIndicador', (indicador) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('editarIndicador', indicador);
    })

    socket.on('eliminarIndicador', (indicador) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('eliminarIndicador', indicador);
    })

    socket.on('felicidadTablero', (felicidadTablero) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('felicidadTablero', felicidadTablero);
    })

    socket.on('felicidadCiclo', () => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('felicidadCiclo');
    })



    // Run when client disconnets
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} a dejado el chat`))

            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })

        }
    })
    
})

export {io};

const PORT = process.env.PORT || 3000
server.listen(PORT, ()=> console.log('servidor andando', PORT)); 