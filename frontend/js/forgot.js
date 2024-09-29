// Forgot password form submission handler
document.getElementById('forgot-password-form').addEventListener('submit', function(event){
    event.preventDefault();

    const forgotEmail = document.getElementById('forgotEmail').value;
    const forgotErrorMessage = document.getElementById('forgotErrorMessage');

    forgotErrorMessage.textContent = '';

    if (!forgotEmail) {
        forgotErrorMessage.textContent = 'Email is required';
        return;
    }

    // Log the data being sent
    console.log('Sending forgot password request for email:', forgotEmail);

    axios.post('http://localhost:3000/password/forgotpassword', { email: forgotEmail })
    .then(response => {
        console.log('Forgot password response received:', response.data);
        document.getElementById('forgotEmail').value = '';
        forgotErrorMessage.textContent = 'Reset link sent to your email';
    })
    .catch(function(error){
        console.log('Error in forgot password post:', error.response ? error.response.data : error.message);
        forgotErrorMessage.textContent = 'Error sending reset email. Please try again.';
    });
});
