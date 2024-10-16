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
    await renderLeaderboard();
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


// Existing renderLeaderboard function here...
async function renderLeaderboard() {
    const leaderBoardElem = document.getElementById('leaderboard');
    
    const token = localStorage.getItem('token');

    try {
        // Fetch leaderboard data
        const userLeaderBoardArray = await axios.get('http://34.239.2.148:3000/premium/showLeaderBoard', {
            headers: { "Authorization": token }
        });

        // Clear existing leaderboard content before adding new data
        leaderBoardElem.innerHTML = ''; // Clear the previous leaderboard content

        // Add the main leaderboard heading with a class for styling
        leaderBoardElem.innerHTML = '<h1 class="leaderboard-title">Leaderboard</h1>';

        // Add the new leaderboard data with styled list items
        userLeaderBoardArray.data.forEach((userDetails, index) => {
            let rankClass = ''; // Class for ranking (1st, 2nd, 3rd)
            let badge = ''; // Badge for top 5 users

            // Assign a class and badge based on the position
            if (index === 0) {
                rankClass = 'gold';   // First place
                badge = '🥇';         // Gold medal emoji
            } else if (index === 1) {
                rankClass = 'silver'; // Second place
                badge = '🥈';         // Silver medal emoji
            } else if (index === 2) {
                rankClass = 'bronze'; // Third place
                badge = '🥉';         // Bronze medal emoji
            } else if (index === 3) {
                rankClass = 'fourth'; // Fourth place (add a custom class if needed)
                badge = '🏅';         // Badge for fourth place
            } else {
                rankClass = 'fifth';  // Fifth place (add a custom class if needed)
                badge = '🎖';         // Badge for fifth place
            }

            // Add leaderboard items with dynamic ranking class and badge
            leaderBoardElem.innerHTML += `
                <li class="leaderboard-item ${rankClass}">
                    <div class="leaderboard-badge-name">
                        ${badge} <span class="user-name">${userDetails.name}</span>
                    </div>
                    <span class="user-expenses">Total Expense - ${userDetails.totalExpenses}</span>
                </li>`;
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
}

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Add an event listener to the hamburger icon
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show'); // Toggle the 'show' class to show/hide nav links
});