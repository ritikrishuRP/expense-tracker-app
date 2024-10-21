const axiosReportInstance = axios.create({
    baseURL: 'http://34.239.2.148/report',
});

document.addEventListener('DOMContentLoaded', () => {
    const reportTypeSelect = document.getElementById('reportType');
    const dateInput = document.getElementById('dateInput');
    const monthInput = document.getElementById('monthInput');
    const yearInput = document.getElementById('yearInput');
    const generateReportBtn = document.getElementById('generateReport');
    const reportTable = document.getElementById('reportTable');
    const reportBody = document.getElementById('reportBody');
    const totalAmountCell = document.getElementById('totalAmount');

    // Event Listener to handle report type change
    reportTypeSelect.addEventListener('change', (event) => {
        const reportType = event.target.value;

        // Show/Hide date, month, or year inputs based on selection
        dateInput.style.display = reportType === 'daily' || reportType === 'weekly' ? 'block' : 'none';
        monthInput.style.display = reportType === 'monthly' ? 'block' : 'none';
        yearInput.style.display = reportType === 'yearly' ? 'block' : 'none';
    });

    // Event Listener for Generate Report Button
    generateReportBtn.addEventListener('click', async () => {
        const reportType = reportTypeSelect.value;
        let reportData = null;

        // Prepare data to send to the backend
        let apiUrl = '';
        let payload = {};

        switch (reportType) {
            case 'daily':
                const selectedDate = document.getElementById('date').value;
                apiUrl = '/getdate';
                payload = { date: selectedDate };
                break;
            case 'weekly':
                const startDate = document.getElementById('date').value;
                apiUrl = '/getweekly';
                payload = { date: startDate };
                break;
            case 'monthly':
                const selectedMonth = document.getElementById('month').value;
                apiUrl = '/getMonthly';
                payload = { month: selectedMonth };
                break;
            case 'yearly':
                const selectedYear = document.getElementById('year').value;
                apiUrl = '/getYearly';
                payload = { year: selectedYear };
                break;
        }

        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication token not found. Please log in again.');
            return;
        }

        try {
            // Send request with Axios, explicitly passing the token
            const response = await axiosReportInstance.post(apiUrl, payload,{ headers: { "Authorization": token } });

            if (response.status === 200) {
                reportData = response.data;
                generateReportTable(reportData.data);
            } else {
                alert('Error generating report. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('Error generating report.');
        }
    });

    // Function to generate table from report data
    function generateReportTable(data) {
        reportBody.innerHTML = ''; // Clear previous data
        let totalAmount = 0;

        if (data && Array.isArray(data)) {
        data.forEach((expense) => {
            const row = document.createElement('tr');

            // Create cells for Date, Description, Category, and Amount
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(expense.createdAt).toLocaleDateString();
            row.appendChild(dateCell);

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = expense.description;
            row.appendChild(descriptionCell);

            const categoryCell = document.createElement('td');
            categoryCell.textContent = expense.category;
            row.appendChild(categoryCell);

            const amountCell = document.createElement('td');
            amountCell.textContent = `$${expense.expense}`;
            row.appendChild(amountCell);

            totalAmount += expense.expense;

            reportBody.appendChild(row);
        });
    } else {
        // Handle case where data is not as expected
        console.warn('No data found for the report.');
        reportBody.innerHTML = '<tr><td colspan="4">No data available for the selected report type.</td></tr>';
    }
        totalAmountCell.textContent = `$${totalAmount.toFixed(2)}`;
        reportTable.style.display = 'table';
    }
});


document.addEventListener('DOMContentLoaded', async function() {
    // Check if the user is premium
    const token = localStorage.getItem('token');

    // Parse the JWT to get the user's information
    const decodedToken = parseJwt(token); // Make sure this function is available here

    // Determine if the user is a premium member
    const isPremium = decodedToken.ispremiumUser; // Ensure this field exists in the JWT

    // Show correct message based on premium status
    const messageDiv = document.getElementById('message');
    if (isPremium) {
        messageDiv.innerHTML = "You are a Premium User 👑";
        document.getElementById('rzp-button1').style.display = "none"; 
    } else {
        messageDiv.innerHTML = "Buy Premium for exclusive features!";
    }

    // Render the leaderboard
    // await renderLeaderboard();
});




// Ensure the parseJwt function is defined if it's not imported from another module
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

document.getElementById('logoutBtn').addEventListener('click', function() {
    // Remove token from localStorage (or sessionStorage if you are using that)
    localStorage.removeItem('token');

    // Optionally, clear other user-related data if stored
    // localStorage.removeItem('userDetails');

    // Redirect to login page
    window.location.href = '/login'; // Adjust this path to your actual login page
});


const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');


hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});
