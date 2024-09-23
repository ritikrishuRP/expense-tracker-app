document.getElementById('login').addEventListener('submit', function(event){
    event.preventDefault();

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
    
    axios.post('http://localhost:3000/api/login', loginDetail)
    .then(response => {
        console.log('login Detail', response.data);

        document.getElementById('email').value= '';
        document.getElementById('password').value = '';
    })
    .catch(function(error){
        console.log('Error in creating blog post', error)
    })
})
