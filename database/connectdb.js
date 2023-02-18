import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE,process.env.USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false
});

sequelize.authenticate()
    .then(()=>{
        console.log('Se conecto a la base de datos correctamente');
    })
    .catch (error => {
        console.error('No se pudo conectar a la base de datos:', error);
    }) 

export default sequelize;