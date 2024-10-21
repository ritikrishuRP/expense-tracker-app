document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');

    const decodedToken = parseJwt(token); 

    const isPremium = decodedToken.ispremiumUser; 

    const messageDiv = document.getElementById('message');
    if (isPremium) {
        messageDiv.innerHTML = "You are a Premium User 👑";
        document.getElementById('rzp-button1').style.display = "none"; 
    } else {
        messageDiv.innerHTML = "Buy Premium for exclusive features!";
    }

    await renderLeaderboard();
});

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

async function renderLeaderboard() {
    const leaderBoardElem = document.getElementById('leaderboard');
    
    const token = localStorage.getItem('token');

    try {
        const userLeaderBoardArray = await axios.get('http://34.239.2.148/premium/showLeaderBoard', {
            headers: { "Authorization": token }
        });

        
        leaderBoardElem.innerHTML = ''; 

        
        leaderBoardElem.innerHTML = '<h1 class="leaderboard-title">Leaderboard</h1>';

       
        userLeaderBoardArray.data.forEach((userDetails, index) => {
            let rankClass = ''; 
            let badge = ''; 

            
            if (index === 0) {
                rankClass = 'gold';   
                badge = '🥇';         
            } else if (index === 1) {
                rankClass = 'silver'; 
                badge = '🥈';         
            } else if (index === 2) {
                rankClass = 'bronze'; 
                badge = '🥉';         
            } else if (index === 3) {
                rankClass = 'fourth'; 
                badge = '🏅';         
            } else {
                rankClass = 'fifth';  
                badge = '🎖';         
            }

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


document.getElementById('logoutBtn').addEventListener('click', function() { 
    localStorage.removeItem('token');
    window.location.href = '/login'; 
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});