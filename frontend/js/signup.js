document.getElementById('signup').addEventListener('submit', function(event){
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const signupDetail = {
        name: name,
        email: email,
        password: password
    }
    
    axios.post('http://34.239.2.148:3000/api/signup', signupDetail)
    .then(response => {
        console.log('Signup Detail', response.data);

        // Clear the form fields
        document.getElementById('name').value= '';
        document.getElementById('email').value= '';
        document.getElementById('password').value = '';
        console.log('Redirecting to login.html');
        window.location.href = "../login.html";
    })
    .catch(function(error){
        console.log('Error in creating signup post', error);
    });
});
