document.addEventListener('DOMContentLoaded', function() {
    fetchExpenses();
});

document.getElementById('addExpense').addEventListener('submit', function(event){
    event.preventDefault();

    const expense = document.getElementById('expense').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const expenseDetails = {
        expense: expense,
        description: description,
        category: category
    }

    console.log(expenseDetails)
    axios.post('http://localhost:3000/expense/addExpense', expenseDetails)
    .then((response => {

        console.log('Expense created successfully:', response.data);

        fetchExpenses();

    }))
    .catch(err => console.log(err));
})

function fetchExpenses() {
    axios.get('http://localhost:3000/expense/getExpense')
    .then(function(response) {
        const expenseList = document.getElementById('listOfExpense');
        expenseList.innerHTML = ''; 

        const expenses = response.data;
        if (Array.isArray(expenses)) {
            for (let i = 0; i < expenses.length; i++) {
                addNewExpensetoUI(expenses[i]);
            }
        } else {
            console.error('Response data is not an array:', expenses);
        }
    })
    .catch(function(error) {
        console.error("Error fetching expenses:", error);
    });
}

function addNewExpensetoUI(expense) {
    // Get the list of expenses
    const expenseList = document.getElementById('listOfExpense');

    // Create a new list item for the expense
    const li = document.createElement('li');
    li.textContent = `Expense: ${expense.expense}, Description: ${expense.description}, Category: ${expense.category}`;

    // Create the delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';

    // Add a click event listener to the delete button
    deleteBtn.addEventListener('click', function() {
        axios.delete(`http://localhost:3000/expense/deleteExpense/${expense.id}`)
        .then(response => {
            console.log('Expense deleted successfully:', response.data);

            // Remove the expense from the UI after successful deletion
            li.remove();
        })
        .catch(err => {
            console.error('Error deleting expense:', err);
        });
    });

    // Append the delete button to the list item
    li.appendChild(deleteBtn);

    // Append the list item to the expense list
    expenseList.appendChild(li);
}



