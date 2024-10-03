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

    console.log(expenseDetails);
    axios.post('http://localhost:3000/expense/addExpense', expenseDetails, { headers: { "Authorization": token } })
        .then((response) => {
            console.log('Expense created successfully:', response.data);
            fetchExpenses(); // Fetch updated expenses after adding
            renderLeaderboard(); // Update leaderboard if it's currently displayed
        })
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

let currentPage = 1;
let limit = 4;

function fetchExpenses() {
    console.log('Fetching expenses...');
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);

    console.log('Decoded token:', decodeToken);
    
    const ispremiumUser = decodeToken.ispremiumUser;
    console.log('Is Premium User:', ispremiumUser);

    if (ispremiumUser) {
        showPremiumUserMessage();
        showLeaderboard();
    }

    limit = parseInt(document.getElementById('page-size').value, 10);

    axios.get(`http://localhost:3000/expense/getExpense?page=${currentPage}&limit=${limit}`, {
        headers: { "Authorization": token }
    })
    .then(function (response) {
        console.log("Fetched expenses response:", response.data);
        const expenseList = document.getElementById('listOfExpense');
        expenseList.innerHTML = '';

        const expenses = response.data.expenses;
        console.log('Expenses:', expenses); 
        if (Array.isArray(expenses)) {
            expenses.forEach(expense => addNewExpensetoUI(expense));
        }

        // Update pagination controls
        updatePaginationControls(response.data);
    })
    .catch(function (error) {
        console.error("Error fetching expenses:", error);
    });
}

document.getElementById('page-size').addEventListener('change', function() {
    currentPage = 1; // Reset to the first page when page size changes
    fetchExpenses(); // Fetch expenses with the new page size
});

function updatePaginationControls(data) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    const totalPages = data.totalPages;
    currentPageSpan.innerText = `Page: ${currentPage}`;


    prevButton.disabled = currentPage === 1; 

    
    nextButton.disabled = currentPage === totalPages; 
    
    prevButton.onclick = function () {
        if (currentPage > 1) {
            currentPage--; 
            fetchExpenses(); 
        }
    };

    
    nextButton.onclick = function () {
        if (currentPage < totalPages) {
            currentPage++; 
            fetchExpenses(); 
        }
    };
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
                fetchExpenses(); // Refresh the expenses list after deletion
                renderLeaderboard(); // Update leaderboard if it's currently displayed
            })
            .catch(err => {
                console.error('Error deleting expense:', err);
            });
    });

    li.appendChild(deleteBtn);
    expenseList.appendChild(li);
}

function showLeaderboard() {
    // Check if the 'Show Leaderboard' button already exists
    if (!document.getElementById('showLeaderboardBtn')) {
        const inputElement = document.createElement('input');
        inputElement.type = 'button';
        inputElement.value = 'Show Leaderboard';
        inputElement.id = 'showLeaderboardBtn';
        inputElement.onclick = async () => {
            await renderLeaderboard();
            document.getElementById('leaderboard').setAttribute('data-leaderboard-shown', 'true');
        };

        document.getElementById('message').appendChild(inputElement);
    }
}

async function renderLeaderboard() {
    const leaderBoardElem = document.getElementById('leaderboard');

    // Check if the leaderboard is currently displayed
    if (leaderBoardElem.getAttribute('data-leaderboard-shown') !== 'true') {
        // Leaderboard is not shown, do not fetch
        return;
    }

    const token = localStorage.getItem('token');

    try {
        // Fetch leaderboard data
        const userLeaderBoardArray = await axios.get('http://localhost:3000/premium/showLeaderBoard', {
            headers: { "Authorization": token }
        });

        console.log(userLeaderBoardArray);

        // Clear existing leaderboard content before adding new data
        leaderBoardElem.innerHTML = ''; // Clear the previous leaderboard content

        leaderBoardElem.innerHTML = '<h1> Leaderboard</h1>';
        
        // Add the new leaderboard data
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderBoardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses}</li>`;
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
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
                    localStorage.setItem('token', updateResponse.data.token);
                    fetchExpenses(); // Fetch expenses again to update premium status
                    renderLeaderboard(); // Update leaderboard if it's currently displayed
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

document.getElementById('report-button').addEventListener('click', () => {
    window.location.href = 'report.html';
});


function download(){
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/api/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 200){
            var a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        console.error("Error in download controller",err);
    });
}

// frontend/index.js

/**
 * Fetches and displays the list of previous download URLs.
 */
function fetchDownloadUrls() {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

    // Fetch the download URLs from the backend
    axios.get('http://localhost:3000/expense/urls', {
        headers: { "Authorization": token }
    })
    .then((response) => {
        if (response.status === 200 && response.data.success) {
            const downloadUrls = response.data.downloadUrls;

            // Get the UL element where download links will be added
            const urlList = document.querySelector('#download-urls ul');

            // Clear any previous content in the list
            urlList.innerHTML = '';

            // Iterate through each download URL and add it to the list
            downloadUrls.forEach(download => {
                const listItem = document.createElement('li');
                
                const link = document.createElement('a');
                link.href = download.url;
                link.textContent = `Download file (${new Date(download.createdAt).toLocaleDateString()})`;
                link.target = '_blank'; // Open in new tab

                listItem.appendChild(link);
                urlList.appendChild(listItem);
            });

            // Make the download section visible
            document.getElementById('download-urls').classList.remove('hide');
        } else {
            console.error('Failed to fetch download URLs:', response.data.message);
        }
    })
    .catch((error) => {
        console.error('Error fetching download URLs:', error);
    });
}

// Call fetchDownloadUrls when the page loads
window.addEventListener('DOMContentLoaded', fetchDownloadUrls);
