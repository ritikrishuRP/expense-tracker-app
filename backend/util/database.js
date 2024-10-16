const Sequelize = require('sequelize');
// const sequelize = new Sequelize('expense', 'root', 'asunny@121',{
//     dialect: 'mysql',
//     host: 'localhost'
// });
// module.exports = sequelize;

const sequelize = new Sequelize(_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    host: process.env.DB_HOST
});

module.exports = sequelize;