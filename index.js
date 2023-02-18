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
import evaluationRouter from "./routes/evaluation.router.js"
import adminRouter from "./routes/admin.router.js"

//Importar util de socket
import {userjoin} from "./util/users.socket.js"

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


const whiteList = [process.env.ORIGIN1] 
app.use(cors({ 
    origin: function(origin, callback){ 
        if(whiteList.includes(origin)){
            return callback(null, origin)
        }
        return callback("Error de CORS origin: " + origin + " No autorizado!")
    },
    credentials: true
}))


app.use(express.json())
app.use(cookieParser())


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/evaluation', evaluationRouter);
app.use('/api/v1/board', boardRouter);
app.use('/api/v1/cycle', cycleRouter);
app.use('/api/v1/indicator', indicatorRouter);
app.use('/api/v1/admin', adminRouter);



io.on("connection", (socket) => {
    socket.on('joinRoom', ({idUser, room}) => {
        const user = userjoin(socket.id, idUser, room);
        socket.join(user.room);
        
        socket.on("message", (msg) => { 

            io.in(user.room).emit("ciclo", (msg))  
        })

        socket.on("editarCiclo", (edit) => {
            io.in(user.room).emit("editarCiclo", (edit))  
        })

        socket.on("eliminarCiclo", (remove) => {
            io.in(user.room).emit("eliminarCiclo", (remove))
        })

        socket.on("indicadores", (msg) => {
            io.in(user.room).emit("indicadores", (msg))
        })

        socket.on("eliminarIndicador", (remove) => {
            io.in(user.room).emit("eliminarIndicador", (remove))
        })

        socket.on("felicidadCiclo", (happyciclo) => {
            io.in(user.room).emit("felicidadCiclo", (happyciclo))
        })

        socket.on("felicidadTablero", (happytablero) => {
            io.in(user.room).emit("felicidadTablero", happytablero)
        })

        socket.on("usuarios", (msg) => {
            io.in(user.room).emit("usuarios", msg)
        })
    })    
    
})

export {io};

const PORT = process.env.PORT || 3000
server.listen(3000, ()=> console.log('servidor andando')); 