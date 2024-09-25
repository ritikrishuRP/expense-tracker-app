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
    
    const token = localStorage.getItem('token');

    console.log(expenseDetails)
    axios.post('http://localhost:3000/expense/addExpense',expenseDetails, { headers: {"Authorization" : token} })
    .then((response => {

        console.log('Expense created successfully:', response.data);

        fetchExpenses();

    }))
    .catch(err => console.log(err));
})

function fetchExpenses() {
    const token = localStorage.getItem('token')
    axios.get('http://localhost:3000/expense/getExpense', { headers: {"Authorization" : token}})
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
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:3000/expense/deleteExpense/${expense.id}`, { headers: {"Authorization" : token}})
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

// document.getElementById('rzp-button1').onclick = async function (e) {
//     const token = localStorage.getItem('token')
//     const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: {"Authorization" : token}});
//     console.log(response);
//     var options = 
//     {
//         "key": response.data.key_id,
//         "order_id": response.data.order.id,
//         "handler": async function (response) {
//             await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
//                 order_id: options.order_id,
//                 payment_id: response.razorpay_payment_id,   
//             }, {headers: {"Authorization": token}})

//             alert('You are premium user now')
//         }
//     };
//     const rzpl = new Razorpay(options);
// }

document.getElementById('rzp-button1').onclick = async function (e) {
    e.preventDefault(); // Prevent default button behavior
    const token = localStorage.getItem('token');

    try {
        // Log before sending the request to get Razorpay order details
        console.log("Fetching Razorpay order details...");
        const response = await axios.get('http://localhost:3000/purchase/premiummembership', {
            headers: {"Authorization": token}
        });

        // Log the full response for debugging
        console.log("Server response for order details:", response);

        var options = {
            "key": response.data.key_id, // Razorpay key_id from server
            "order_id": response.data.order.id, // Razorpay order_id from server
            "handler": async function (paymentResponse) {
                // Log for debugging
                console.log("Payment successful, response:", paymentResponse);

                try {
                    // Log before updating transaction status
                    console.log("Updating transaction status...");

                    const updateResponse = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                        order_id: options.order_id,
                        payment_id: paymentResponse.razorpay_payment_id,   
                    }, { headers: { "Authorization": token } });

                    // Log successful transaction status update
                    console.log("Transaction status updated:", updateResponse.data);

                    // Show success alert
                    alert('You are a premium user now');
                } catch (updateError) {
                    console.error("Error updating transaction status:", updateError);
                }
            }
        };

        // Log the options before opening the Razorpay checkout
        console.log("Opening Razorpay with options:", options);

        // Create the Razorpay instance with the options
        const rzpl = new Razorpay(options);

        // Open the Razorpay checkout modal
        rzpl.open();

        // Handle payment failure
        rzpl.on('payment.failed', function (response) {
            console.log("Payment failed, response:", response);
            alert('Something went wrong with the payment.');
        });

    } catch (error) {
        // Log the error if anything goes wrong
        console.error("Error fetching Razorpay order details:", error);
    }
};






