document.getElementById('login').addEventListener('submit', function(event){
    event.preventDefault();

    console.log('Form submitted'); // Check if this event fires

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = '';

    // Validate input fields
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

    // Log the data being sent
    console.log('Sending login details:', loginDetail);

    axios.post('http://localhost:3000/api/login', loginDetail)
    .then(response => {
        console.log('Login response received:', response.data); // Log the full response
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        // Check if the token exists in the response
        if (response.data && response.data.token) {
            console.log('Token received:', response.data.token);
            localStorage.setItem('token', response.data.token);
            console.log('Token saved to localStorage:', localStorage.getItem('token'));

            // Log before redirecting
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
