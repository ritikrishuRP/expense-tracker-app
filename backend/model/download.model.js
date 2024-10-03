const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Download = sequelize.define('download',{
    id:{
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    url : {
        type : Sequelize.STRING,
        allowNull : false
    }
})

module.exports = Download;