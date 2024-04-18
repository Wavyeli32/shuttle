function forgotPassword(event) {
    event.preventDefault();

    // Retrieve user information from local storage
    const storedUsername = localStorage.getItem('username');

    // Get entered username
    const username = document.getElementById('username').value;

    // Check if entered username matches stored username
    if (username === storedUsername) {
        alert('Password reset instructions sent to your email.');
        // Redirect to Login Page after sending password reset instructions
        window.location.href = 'index.html';
    } else {
        alert('Username not found. Please try again.');
    }
}

// Function to redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}