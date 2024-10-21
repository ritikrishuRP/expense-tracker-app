document.addEventListener('DOMContentLoaded', function () {
    fetchExpenses();  
    fetchDownloadUrls();
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
    axios.post('http://34.239.2.148/expense/addExpense', expenseDetails, { headers: { "Authorization": token } })
        .then((response) => {
            console.log('Expense created successfully:', response.data);
            fetchExpenses();
            renderLeaderboard(); 
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

    axios.get(`http://34.239.2.148/expense/getExpense?page=${currentPage}&limit=${limit}`, {
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

        
        updatePaginationControls(response.data);
    })
    .catch(function (error) {
        console.error("Error fetching expenses:", error);
    });
}

document.getElementById('page-size').addEventListener('change', function() {
    currentPage = 1; 
    fetchExpenses(); 
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

    // Check if the header is already present
    if (!document.querySelector('.expense-list-header')) {
        const header = document.createElement('li');
        header.className = 'expense-list-header'; 

        // Create the new Date header
        const dateHeader = document.createElement('div');
        dateHeader.textContent = 'Date'; // New Date Header

        const amountHeader = document.createElement('div');
        amountHeader.textContent = 'Amount';
        const descriptionHeader = document.createElement('div');
        descriptionHeader.textContent = 'Description';
        const categoryHeader = document.createElement('div');
        categoryHeader.textContent = 'Category';
        const actionHeader = document.createElement('div');
        actionHeader.textContent = 'Actions';

        // Append headers in the correct order
        header.appendChild(dateHeader); // Append the Date header first
        header.appendChild(amountHeader);
        header.appendChild(descriptionHeader);
        header.appendChild(categoryHeader);
        header.appendChild(actionHeader);

        // Insert the header at the beginning of the expense list
        expenseList.insertBefore(header, expenseList.firstChild);
    }
}


function addNewExpensetoUI(expense) {
    addExpenseListHeader(); 
    const expenseList = document.getElementById('listOfExpense');

    const li = document.createElement('li');
    li.className = 'expense-list-item'; 

    // Create and format the date
    const expenseDate = document.createElement('div');
    const createdAtDate = new Date(expense.createdAt); // Assuming expense has createdAt property
    expenseDate.textContent = createdAtDate.toLocaleDateString(); // Format the date

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
        axios.delete(`http://34.239.2.148/expense/deleteExpense/${expense.id}`, { headers: { "Authorization": token } })
            .then(response => {
                console.log('Expense deleted successfully:', response.data);
                li.remove();
                fetchExpenses(); 
                renderLeaderboard();
            })
            .catch(err => {
                console.error('Error deleting expense:', err);
            });
    });

    // Append the new date element before amount
    li.appendChild(expenseDate);
    li.appendChild(expenseAmount);
    li.appendChild(expenseDescription);
    li.appendChild(expenseCategory);
    li.appendChild(deleteBtn);

    expenseList.appendChild(li);
}


document.getElementById('rzp-button1').onclick = async function (e) {
    e.preventDefault(); 
    const token = localStorage.getItem('token');

    try {
        console.log("Fetching Razorpay order details...");
        const response = await axios.get('http://34.239.2.148/purchase/premiummembership', {
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

                    const updateResponse = await axios.post('http://34.239.2.148/purchase/updatetransactionstatus', {
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


function toggleDownloadUrls() {
    const downloadSection = document.getElementById('download-urls');
    const table = downloadSection.querySelector('table');
    
    if (table.classList.contains('hide')) {
        table.classList.remove('hide');
    } else {
        table.classList.add('hide');
    }
}

function download(){
    const token = localStorage.getItem('token');
    axios.get('http://34.239.2.148/api/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 200){
            var a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            document.body.appendChild(a); 
            a.click();
            document.body.removeChild(a); 
            window.location.reload(); 
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        console.error("Error in download controller",err);
        alert("Failed to download the file. Please try again.");
    });
}


function fetchDownloadUrls() {
    const token = localStorage.getItem('token'); 

    if (!token) {
        console.error("No token found in localStorage.");
        return;
    }

    
    axios.get('http://34.239.2.148/expense/urls', {
        headers: { "Authorization": token }
    })
    .then((response) => {
        if (response.status === 200 && response.data.success) {
            const downloadUrls = response.data.downloadUrls;

            
            const tableBody = document.querySelector('#download-urls table tbody');

            if (!tableBody) {
                console.error("Table body inside '#download-urls' not found.");
                return;
            }

            
            tableBody.innerHTML = '';

            
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
                link.target = '_blank';
                link.rel = 'noopener noreferrer'; 
                urlCell.appendChild(link);

                row.appendChild(dateCell);
                row.appendChild(urlCell);

               
                tableBody.appendChild(row);
            });

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

// window.addEventListener('DOMContentLoaded', fetchDownloadUrls);



document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
});


document.getElementById('report-button').addEventListener('click', function () {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in. Please log in to continue.');
        window.location.href = '/login'; // Redirect to login if no token is present
        return;
    }

    const decodeToken = parseJwt(token); // Decode the JWT token
    const isPremiumUser = decodeToken.ispremiumUser; // Check premium status

    if (isPremiumUser) {
        window.location.href = 'report.html'; // Allow access to report page
    } else {
        alert('You must be a premium user to access the report page.');
        return; 
    }
});

document.getElementById('showLeaderboardBtn').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default anchor behavior

    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in. Please log in to continue.');
        window.location.href = '/login'; // Redirect to login if no token is present
        return;
    }

    const decodeToken = parseJwt(token); // Decode the JWT token
    const isPremiumUser = decodeToken.ispremiumUser; // Check premium status

    if (isPremiumUser) {
        window.location.href = 'leaderboard.html'; // Allow access to leaderboard page
    } else {
        alert('You must be a premium user to view the leaderboard.');
        return; // Prevent further execution to stop redirection
    }
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

