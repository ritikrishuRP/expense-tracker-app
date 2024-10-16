const Sequelize = require('sequelize');
// const sequelize = new Sequelize('expense', 'root', 'asunny@121',{
//     dialect: 'mysql',
//     host: 'localhost'
// });
// module.exports = sequelize;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307
});

module.exports = sequelize;