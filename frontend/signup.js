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
    
    axios.post('http://localhost:3000/api/signup', signupDetail)
    .then(response => {
        console.log('Signup Detail', response.data);

        document.getElementById('name').value= '';
        document.getElementById('email').value= '';
        document.getElementById('password').value = '';

    })
    .catch(function(error){
        console.log('Error in creating blog post', error)
    })
})
