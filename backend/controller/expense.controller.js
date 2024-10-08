const Expense = require('../model/expense.model');
const User = require('../model/user.model');
const sequelize = require('../util/database');
const S3Service = require('../services/S3services');
const Download = require('../model/download.model')




const downloadExpense = async (req,res) => {
    try {
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses);
    
        //It should depend upon the userid
        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileUrl = await S3Service.uploadToS3(stringifiedExpenses, filename);
        let url = fileUrl
        await req.user.createDownload({url: url})
        res.status(200).json({fileUrl, success: true})
    } catch (error) {
        console.error('Error in downloadExpense:', error); 
        res.status(500).json({fileURL: '', success: false, message: error.message});
    }

}

const expenseDetail = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { expense, description, category } = req.body;
        const userId = req.user.id;

        // Validate the input fields
        if (!expense || !description || !category) {
            await t.rollback();
            return res.status(400).json({ error: 'All fields are required.' });
        }

        console.log('User from token:', req.user.id);

        // Create the expense entry in the database
        const expenseDetails = await Expense.create({ expense, description, category, userId }, { transaction: t });

        // Calculate the new total expenses
        const totalExpense = Number(req.user.totalExpenses) + Number(expenseDetails.expense);

        console.log('New Total Expense:', totalExpense);

        // Update the user's total expenses
        await User.update({
            totalExpenses: totalExpense
        }, {
            where: { id: req.user.id },
            transaction: t
        });

        // Commit the transaction
        await t.commit();
        res.status(201).json(expenseDetails);

    } catch (error) {
        await t.rollback();
        console.error('Error in expense detail creation:', error);
        res.status(500).json({ error: 'Failed to create expense detail' });
    }
};

const fetchExpense = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;
    try {
        const { count, rows } = await Expense.findAndCountAll({  
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
        });
        const totalPages = Math.ceil(count / limit);
        //console.log(allExpenses);
        res.status(200).json({
            expenses: rows,
            totalPages: totalPages,
            currentPage: page,
            totalExpenses: count
        });
    } catch (error) {
        console.log('Error in fetching expenses');
        console.error('Error fetching expenses:', error.toString());
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Failed to fetch expenses.' });
    }
};

// Modify deleteExpense to use a transaction and update the leaderboard
const deleteExpense = async (req, res) => {
    const t = await sequelize.transaction(); // Start a transaction
    try {
        const expenseId = req.params.expenseId;

        // Fetch the expense to be deleted and ensure it belongs to the user
        const expense = await Expense.findByPk(expenseId, { transaction: t });

        if (!expense || expense.userId !== req.user.id) {
            await t.rollback(); // Rollback the transaction if not found or not authorized
            return res.status(404).json({ error: 'Expense not found or not authorized.' });
        }

        // Fetch the user to update total expenses after deletion
        const user = await User.findByPk(req.user.id, { transaction: t });

        if (!user) {
            await t.rollback();
            return res.status(404).json({ error: 'User not found.' });
        }

        // Calculate the new total expenses after the deletion of the expense
        const updatedTotalExpenses = Number(user.totalExpenses) - Number(expense.expense);
        
        // Delete the expense
        await expense.destroy({ transaction: t });

        // Update the user's total expenses in the leaderboard
        await User.update({
            totalExpenses: updatedTotalExpenses
        }, {
            where: { id: req.user.id },
            transaction: t
        });

        // Commit the transaction
        await t.commit();
        res.status(200).json({ message: 'Expense deleted successfully.' });
        
    } catch (error) {
        // Rollback the transaction in case of any error
        await t.rollback();
        console.error('Error in deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense.' });
    }
};



const getDownloadUrls = async (req, res) => {
    try {
        const downloadRecords = await req.user.getDownloads(); 

        const downloadUrls = downloadRecords.map(record => ({
            id: record.id,   
            url: record.url, 
            createdAt: record.createdAt 
        }));

        res.status(200).json({ success: true, downloadUrls });
    } catch (error) {
        console.error('Error fetching download URLs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch download URLs.' });
    }
};




module.exports = {
    expenseDetail,
    fetchExpense,
    deleteExpense,
    downloadExpense,
    getDownloadUrls
};


// const deleteExpense = async (req, res) => {
//     try {
//         const expenseId = req.params.expenseId;
//         //const userId = req.user.id;

       
//         const expense = await Expense.findByPk(expenseId);

//         if (!expense || expense.userId !== req.user.id) {  // Ensure the expense belongs to the logged-in user
//             return res.status(404).json({ error: 'Expense not found or not authorized.' });
//         }

       
//         await expense.destroy();
//         res.status(200).json({ message: 'expense deleted successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: 'expense to delete comment.' });
//     }
// };


// module.exports = {
//     expenseDetail,
//     fetchExpense,
//     deleteExpense
// }
