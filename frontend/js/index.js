// document.addEventListener('DOMContentLoaded', function () {
//     fetchExpenses();
// });

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
    axios.post('http://34.239.2.148:3000/expense/addExpense', expenseDetails, { headers: { "Authorization": token } })
        .then((response) => {
            console.log('Expense created successfully:', response.data);
            fetchExpenses(); // Fetch updated expenses after adding
            renderLeaderboard(); // Update leaderboard if it's currently displayed
        })
        .catch(err => console.log(err));
});

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

    const messageDiv = document.getElementById('message');
    if (ispremiumUser) {
        messageDiv.innerHTML = "You are a Premium User 👑";
        document.getElementById('rzp-button1').style.display = "none"; 
    } 
    limit = parseInt(document.getElementById('page-size').value, 10);

    axios.get(`http://34.239.2.148:3000/expense/getExpense?page=${currentPage}&limit=${limit}`, {
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



function addExpenseListHeader() {
    const expenseList = document.getElementById('listOfExpense');
    
    // Check if the header already exists
    if (!document.querySelector('.expense-list-header')) {
        const header = document.createElement('li');
        header.className = 'expense-list-header'; // Add the header class

        // Create header columns
        const amountHeader = document.createElement('div');
        amountHeader.textContent = 'Amount';
        const descriptionHeader = document.createElement('div');
        descriptionHeader.textContent = 'Description';
        const categoryHeader = document.createElement('div');
        categoryHeader.textContent = 'Category';
        const actionHeader = document.createElement('div');
        actionHeader.textContent = 'Actions';

        // Append header columns to header row
        header.appendChild(amountHeader);
        header.appendChild(descriptionHeader);
        header.appendChild(categoryHeader);
        header.appendChild(actionHeader);

        // Add header row to the expense list
        expenseList.insertBefore(header, expenseList.firstChild);
    }
}

function addNewExpensetoUI(expense) {
    addExpenseListHeader(); // Ensure the header is added before new expenses

    const expenseList = document.getElementById('listOfExpense');

    const li = document.createElement('li');
    li.className = 'expense-list-item'; // Add the class to match the CSS

    // Create grid items for each field
    const expenseAmount = document.createElement('div');
    expenseAmount.textContent = expense.expense;

    const expenseDescription = document.createElement('div');
    expenseDescription.textContent = expense.description;

    const expenseCategory = document.createElement('div');
    expenseCategory.textContent = expense.category;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
        const token = localStorage.getItem('token');
        axios.delete(`http://34.239.2.148:3000/expense/deleteExpense/${expense.id}`, { headers: { "Authorization": token } })
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

    // Append all elements to the list item
    li.appendChild(expenseAmount);
    li.appendChild(expenseDescription);
    li.appendChild(expenseCategory);
    li.appendChild(deleteBtn);

    // Append the list item to the expense list
    expenseList.appendChild(li);
}




document.getElementById('showLeaderboardBtn').onclick = function() {
    window.location.href = 'leaderboard.html'; // Redirect to leaderboard page
};



document.getElementById('rzp-button1').onclick = async function (e) {
    e.preventDefault(); 
    const token = localStorage.getItem('token');

    try {
        console.log("Fetching Razorpay order details...");
        const response = await axios.get('http://34.239.2.148:3000/purchase/premiummembership', {
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

                    const updateResponse = await axios.post('http://34.239.2.148:3000/purchase/updatetransactionstatus', {
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


// Function to toggle the visibility of the download URLs table
function toggleDownloadUrls() {
    const downloadSection = document.getElementById('download-urls');
    const table = downloadSection.querySelector('table');
    
    if (table.classList.contains('hide')) {
        table.classList.remove('hide');
    } else {
        table.classList.add('hide');
    }
}

// Function to download the latest expense as a CSV file
function download(){
    const token = localStorage.getItem('token');
    axios.get('http://34.239.2.148:3000/api/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 200){
            var a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            document.body.appendChild(a); // Append to the DOM
            a.click();
            document.body.removeChild(a); // Remove after download
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        console.error("Error in download controller",err);
        alert("Failed to download the file. Please try again.");
    });
}

/**
 * Fetches and displays the list of previous download URLs in a table.
 */
function fetchDownloadUrls() {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

    if (!token) {
        console.error("No token found in localStorage.");
        return;
    }

    // Fetch the download URLs from the backend
    axios.get('http://34.239.2.148:3000/expense/urls', {
        headers: { "Authorization": token }
    })
    .then((response) => {
        if (response.status === 200 && response.data.success) {
            const downloadUrls = response.data.downloadUrls;

            // Get the tbody element where download links will be added
            const tableBody = document.querySelector('#download-urls table tbody');

            if (!tableBody) {
                console.error("Table body inside '#download-urls' not found.");
                return;
            }

            // Clear any previous content in the table
            tableBody.innerHTML = '';

            // Iterate through each download URL and add a table row
            downloadUrls.forEach(download => {
                const row = document.createElement('tr');

                // Date Cell
                const dateCell = document.createElement('td');
                const formattedDate = new Date(download.createdAt).toLocaleDateString();
                dateCell.textContent = formattedDate;

                // Download URL Cell
                const urlCell = document.createElement('td');
                const link = document.createElement('a');
                link.href = download.url;
                link.textContent = 'Download';
                link.target = '_blank'; // Open in new tab
                link.rel = 'noopener noreferrer'; // Security best practices
                urlCell.appendChild(link);

                // Append cells to the row
                row.appendChild(dateCell);
                row.appendChild(urlCell);

                // Append the row to the table body
                tableBody.appendChild(row);
            });

            // Make the download section visible
            document.getElementById('download-urls').classList.remove('hide');
        } else {
            console.error('Failed to fetch download URLs:', response.data.message);
            alert('Failed to load download URLs. Please try again later.');
        }
    })
    .catch((error) => {
        console.error('Error fetching download URLs:', error);
        alert('An error occurred while fetching download URLs.');
    });
}

// Call fetchDownloadUrls when the page loads
window.addEventListener('DOMContentLoaded', fetchDownloadUrls);

// Call checkPremiumStatus when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    fetchExpenses();  // This function will already check and update premium status in the UI
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    // Remove token from localStorage (or sessionStorage if you are using that)
    localStorage.removeItem('token');

    // Optionally, clear other user-related data if stored
    // localStorage.removeItem('userDetails');

    // Redirect to login page
    window.location.href = '/login'; // Adjust this path to your actual login page
});


