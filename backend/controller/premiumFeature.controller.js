const User = require('../model/user.model');
const Expense = require('../model/expense.model');
const sequelize = require('../util/database');

const getUserLeaderBoard = async (req,res) => {
    try {
        const users = await User.findAll()
        const expenses = await Expense.findAll();
        const userAggregatedExpenses = {}
        expenses.forEach((expense) => {

            if(userAggregatedExpenses[expense.userId]){
                userAggregatedExpenses[expense.userId] = userAggregatedExpenses[expense.userId] + expense.expense
            } else {
                userAggregatedExpenses[expense.userId] = expense.expense;
            }  
        })
        var userLeaderBoardDetails = [];
        users.forEach((user) => {
            userLeaderBoardDetails.push({name: user.name, total_cost: userAggregatedExpenses[user.id] || 0 })
        })
        console.log(userLeaderBoardDetails);
        res.status(200).json(userLeaderBoardDetails)
    } catch (error) {
        console.log(error)
        res.status(500).json(err)
    }
}

module.exports = {
    getUserLeaderBoard
}
