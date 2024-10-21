document.getElementById('login').addEventListener('submit', function(event){
    event.preventDefault();

    console.log('Form submitted'); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = '';

    if (!email) {
        errorMessage.textContent = 'Email is required';
        return;
    }
    if (!password) {
        errorMessage.textContent = 'Password is required';
        return;
    }

    const loginDetail = {
        email: email,
        password: password
    }

   
    console.log('Sending login details:', loginDetail);

    axios.post('http://34.239.2.148/api/login', loginDetail)
    .then(response => {
        console.log('Login response received:', response.data); 
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        
        if (response.data && response.data.token) {
            console.log('Token received:', response.data.token);
            localStorage.setItem('token', response.data.token);
            console.log('Token saved to localStorage:', localStorage.getItem('token'));

            console.log('Redirecting to index.html');
            window.location.href = "../index.html";
        } else {
            console.error('Token not received in the response');
        }
    })
    .catch(function(error){
        console.log('Error in creating login post:', error.response ? error.response.data : error.message);
    });
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
    alert('Password successfully updated!'); // Simple alert message
}


