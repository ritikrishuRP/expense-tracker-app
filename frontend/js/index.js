document.addEventListener('DOMContentLoaded', function () {
    fetchExpenses();
});

document.getElementById('addExpense').addEventListener('submit', function (event) {
    event.preventDefault();

    const expense = document.getElementById('expense').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const expenseDetails = {
        expense: expense,
        description: description,
        category: category
    };

    const token = localStorage.getItem('token');

    console.log(expenseDetails)
    axios.post('http://localhost:3000/expense/addExpense', expenseDetails, { headers: { "Authorization": token } })
        .then((response => {
            console.log('Expense created successfully:', response.data);
            fetchExpenses();
        }))
        .catch(err => console.log(err));
});

function showPremiumUserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden";
    document.getElementById('message').innerHTML = "You are a Premium User";
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function fetchExpenses() {
    console.log('hii');
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);

    console.log('Decoded token:', decodeToken); // Log the decoded token
    
    const ispremiumUser = decodeToken.ispremiumUser;
    console.log('Is Premium User:', ispremiumUser); // Log to check if the flag is set correctly

    if (ispremiumUser) {
        showPremiumUserMessage();
        showLeaderboard();
    }

    axios.get('http://localhost:3000/expense/getExpense', { headers: { "Authorization": token } })
        .then(function (response) {
            const expenseList = document.getElementById('listOfExpense');
            expenseList.innerHTML = '';

            const expenses = response.data;
            if (Array.isArray(expenses)) {
                expenses.forEach(expense => addNewExpensetoUI(expense));
            } else {
                console.error('Response data is not an array:', expenses);
            }
        })
        .catch(function (error) {
            console.error("Error fetching expenses:", error);
        });
}

function addNewExpensetoUI(expense) {
    const expenseList = document.getElementById('listOfExpense');

    const li = document.createElement('li');
    li.textContent = `Expense: ${expense.expense}, Description: ${expense.description}, Category: ${expense.category}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';

    deleteBtn.addEventListener('click', function () {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:3000/expense/deleteExpense/${expense.id}`, { headers: { "Authorization": token } })
            .then(response => {
                console.log('Expense deleted successfully:', response.data);
                li.remove();
            })
            .catch(err => {
                console.error('Error deleting expense:', err);
            });
    });

    li.appendChild(deleteBtn);
    expenseList.appendChild(li);
}

function showLeaderboard(){
    const inputElement = document.createElement('input');
    inputElement.type = 'button'
    inputElement.value = 'Show Leaderboard'
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token')
        const userLeaderBoardArray = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: { "Authorization": token } })
        console.log(userLeaderBoardArray);

        var leaderBoardElem = document.getElementById('leaderboard')
        leaderBoardElem.innerHTML += '<h1> Leader Board</h1>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderBoardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.total_cost}`
        })
    }
    document.getElementById('message').appendChild(inputElement);
}

document.getElementById('rzp-button1').onclick = async function (e) {
    e.preventDefault(); 
    const token = localStorage.getItem('token');

    try {
        console.log("Fetching Razorpay order details...");
        const response = await axios.get('http://localhost:3000/purchase/premiummembership', {
            headers: { "Authorization": token }
        });

        console.log("Server response for order details:", response);

        var options = {
            "key": response.data.key_id, 
            "order_id": response.data.order.id,
            "handler": async function (paymentResponse) {
                console.log("Payment successful, response:", paymentResponse);

                try {
                    console.log("Updating transaction status...");

                    const updateResponse = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                        order_id: options.order_id,
                        payment_id: paymentResponse.razorpay_payment_id,
                    }, { headers: { "Authorization": token } });

                    console.log("Transaction status updated:", updateResponse.data);
                    alert('You are a premium user now');
                    localStorage.setItem('token', updateResponse.data.token)
                } catch (updateError) {
                    console.error("Error updating transaction status:", updateError);
                }
            }
        };

        console.log("Opening Razorpay with options:", options);
        const rzpl = new Razorpay(options);
        rzpl.open();

        rzpl.on('payment.failed', function (response) {
            console.log("Payment failed, response:", response);
            alert('Something went wrong with the payment.');
        });

    } catch (error) {
        console.error("Error fetching Razorpay order details:", error);
    }
};
