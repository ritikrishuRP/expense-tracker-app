const Expense = require('../model/expense.model');


const expenseDetail = async (req, res) => {
    try {
        const {expense, description, category} = req.body;
        const userId = req.user.id;

        if (!expense || !description || !category) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        console.log('User from token:', req.user.id);

        
        const expenseDetails = await Expense.create({expense, description, category, userId: userId});
        res.status(201).json(expenseDetails);
    } catch (error) {
        console.error('Error in expense Detail uploading', error); 
        res.status(500).json({ error: 'Failed to create expense detail' });
    }
    
}

const fetchExpense = async (req, res) => {
    try {
        const allExpenses = await Expense.findAll({
            where: {userId: req.user.id},
            order: [['createdAt', 'DESC']],
        });
        console.log(allExpenses)
        res.status(200).json(allExpenses);
    } catch (error) {
        console.log('Error in fetching expenses');
        console.error('Error fetching expenses:', error.toString()); 
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Failed to fetch expenses.' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expenseId = req.params.expenseId;
        //const userId = req.user.id;

       
        const expense = await Expense.findByPk(expenseId);

        if (!expense || expense.userId !== req.user.id) {  // Ensure the expense belongs to the logged-in user
            return res.status(404).json({ error: 'Expense not found or not authorized.' });
        }

       
        await expense.destroy();
        res.status(200).json({ message: 'expense deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'expense to delete comment.' });
    }
};


module.exports = {
    expenseDetail,
    fetchExpense,
    deleteExpense
}
