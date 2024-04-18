const backendEndpoint = '/login'; // Change the endpoint to login

function login(event) {
    event.preventDefault();

    // Retrieve entered username and password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Create an object with login credentials
    const credentials = {
        username: username,
        password: password
    };

    const url = backendEndpoint;

    // Send login credentials to the backend server
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Login failed. Server responded with status ' + response.status);
    })
    .then(data => {
        // Check if user data is received from the server
        if (data && data.user) {
            // Login successful, redirect to Home.html
            alert('Login successful!');
            window.location.href = 'Home.html';
        } else {
            // Server response indicates login failure, handle error
            throw new Error('Invalid credentials.');
        }
    })
    .catch(error => {
        // Login failed
        console.error('Login error:', error);
        alert('Invalid credentials. Please try again.');
    });
}

function redirectToRegistration() {
    window.location.href = "reg.html";
}