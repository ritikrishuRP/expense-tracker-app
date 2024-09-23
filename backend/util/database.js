const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense', 'root', 'asunny@121',{
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;