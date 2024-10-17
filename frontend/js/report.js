// const axiosReportInstance = axios.create({
//     baseURL : 'http://3.27.133.80/report',
//     headers : {
//         'auth-token' : localStorage.getItem('token')
//     }
// })

window.addEventListener('load' , ()=>{
    document.getElementById('date').value = new Date().toISOString().split('T')[0]
})





document.getElementById('expense-display').addEventListener('change', (e)=>{
    console.log(e.target.value)
    if(e.target.value == "daily"){
        document.getElementById('daily-form').classList.remove('hide')
        document.getElementById('monthly-form').classList.add('hide')
        document.getElementById('yearly-form').classList.add('hide')
    }
    else if(e.target.value == "monthly"){
        document.getElementById('monthly-form').classList.remove('hide')
        document.getElementById('daily-form').classList.add('hide')
        document.getElementById('yearly-form').classList.add('hide')
    }
    else if(e.target.value == "yearly"){
        document.getElementById('monthly-form').classList.add('hide')
        document.getElementById('daily-form').classList.add('hide')
        document.getElementById('yearly-form').classList.remove('hide')
    }else{
        
        document.getElementById('monthly-form').classList.add('hide')
        document.getElementById('daily-form').classList.add('hide')
        document.getElementById('yearly-form').classList.add('hide')
        displayWeekly()
    }
})

document.getElementById('daily-form').addEventListener('submit' , async(e)=>{
    e.preventDefault()
    const token = localStorage.getItem('token');
    console.log(e.target.date.value)
    const date = e.target.date.value
    try{

        const res = await axios.post('http://34.239.2.148:3000/report/getdate' 
            ,{date}
            ,{headers: { "Authorization": token }}
        )
        console.log(res)
        document.getElementById('daily').classList.remove('hide')
        document.getElementById('monthly').classList.add('hide')
        document.getElementById('yearly').classList.add('hide')
        document.getElementById('weekly').classList.add('hide')


        const tbody = document.querySelector('#daily table tbody')
        console.log(tbody)
        let total =0
        tbody.innerHTML = ``
        document.querySelector('#daily h3 span').textContent = date
        if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            res.data.data.forEach(elem => {
                console.log(elem);
                const tr = document.createElement('tr');
                const td1 = document.createElement('td');
                const td2 = document.createElement('td');
    
                td1.textContent = elem.description;
                td2.textContent = elem.expense;
    
                total = total + +elem.expense;
                tr.appendChild(td1);
                tr.appendChild(td2);
    
                tbody.appendChild(tr);
            });
        } else {
            console.error('Expected array but got:', res.data);
            alert("No data available for the selected date.");
        }
        document.getElementById('daily-total').textContent = total
    }catch(e){
        console.log(e)
    }
})



document.getElementById('yearly-form').addEventListener('submit' , async(e)=>{
    e.preventDefault()
    const token = localStorage.getItem('token');
    console.log(e.target['year-picker'].value)
    const year = e.target['year-picker'].value
    try{

        const res = await axios.post('http://34.239.2.148:3000/report/getYearly' , {year}, { headers: { "Authorization": token } } )
        console.log(res)
        document.getElementById('daily').classList.add('hide')
        document.getElementById('monthly').classList.add('hide')
        document.getElementById('yearly').classList.remove('hide')
        document.getElementById('weekly').classList.add('hide')


        const tbody = document.querySelector('#yearly table tbody')
        console.log(tbody)
        let total =0
        tbody.innerHTML = ``
        document.querySelector('#yearly h3 span').textContent = year
        res.data.forEach(elem => {
            console.log(elem)
            const tr = document.createElement('tr')
            const td1 = document.createElement('td')
            const td2 = document.createElement('td')

            td1.textContent = elem.month
            td2.textContent = elem.totalAmount

            total = total + +elem.totalAmount
            tr.appendChild(td1)
            tr.appendChild(td2)

            tbody.appendChild(tr)

        })

        document.getElementById('yearly-total').textContent = total
    }catch(e){
        console.log(e)
    }
})

document.getElementById('monthly-form').addEventListener('submit' , async(e)=>{
    e.preventDefault()
    console.log(e.target['year-picker'].value)
    const token = localStorage.getItem('token');
    // const year = e.target['year-picker'].value
    // const month = e.target['month-picker'].value
    const month = e.target['year-picker'].value + "-" + e.target['month-picker'].value
    console.log(month)
    try{

        const res = await axios.post('http://34.239.2.148:3000/report/getMonthly' , {month}, { headers: { "Authorization": token } } )
        console.log(res)
        document.getElementById('daily').classList.add('hide')
        document.getElementById('monthly').classList.remove('hide')
        document.getElementById('yearly').classList.add('hide')
        document.getElementById('weekly').classList.add('hide')


        const tbody = document.querySelector('#monthly table tbody')
        console.log(tbody)
        let total =0
        tbody.innerHTML = ``
        document.querySelector('#monthly h3 span').textContent = e.target['month-picker'].options[e.target['month-picker'].selectedIndex].text
        res.data.forEach(elem => {
            console.log(elem)
            const tr = document.createElement('tr')
            const td1 = document.createElement('td')
            const td2 = document.createElement('td')

            td1.textContent = elem.date
            td2.textContent = elem.totalAmount

            total = total + +elem.totalAmount
            tr.appendChild(td1)
            tr.appendChild(td2)

            tbody.appendChild(tr)

        })

        document.getElementById('monthly-total').textContent = total
    }catch(e){
        console.log(e)
    }
})


async function displayWeekly(){
    const token = localStorage.getItem('token');
    try{

        const res = await axios.post('http://34.239.2.148:3000/report/getweekly', { headers: { "Authorization": token } })
        console.log(res)
        document.getElementById('daily').classList.add('hide')
        document.getElementById('monthly').classList.add('hide')
        document.getElementById('yearly').classList.add('hide')
        document.getElementById('weekly').classList.remove('hide')


        const tbody = document.querySelector('#weekly table tbody')
        console.log(tbody)
        let total =0
        tbody.innerHTML = ``
        // document.querySelector('#weekly h3 span').textContent = year
        res.data.forEach(elem => {
            console.log(elem)
            const tr = document.createElement('tr')
            const td1 = document.createElement('td')
            const td2 = document.createElement('td')

            td1.textContent = elem.week
            td2.textContent = elem.totalAmount

            total = total + +elem.totalAmount
            tr.appendChild(td1)
            tr.appendChild(td2)

            tbody.appendChild(tr)

        })

        document.getElementById('weekly-total').textContent = total
    }catch(e){
        console.log(e)
    }
}

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
