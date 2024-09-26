const User = require('../model/user.model');
const Expense = require('../model/expense.model');
const sequelize = require('../util/database');

const getUserLeaderBoard = async (req,res) => {
    try {
        const leaderboardofusers = await User.findAll({
            attributes:['id','name',[sequelize.fn('sum',sequelize.col('expenses.expense')), 'total_cost']],
            include: [
                {
                    model: Expense,
                    attributes: []
                }

            ],
            group:['user.id'],
            order:[['total_cost', 'DESC']]
        })
        // const userAggregatedExpenses = await Expense.findAll({
        //     attributes: ['userId',[sequelize.fn('sum',sequelize.col('expense')), 'total_cost']],
        //     group: ['userId']
        // });

        res.status(200).json(leaderboardofusers);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

module.exports = {
    getUserLeaderBoard
}
