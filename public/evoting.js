const backendEndpoint = '/vote';

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const selectedCandidateName = document.getElementById('candidate').value; // Get the selected candidate's name

    // Submit the vote with the selected candidate's name
    submitVote(selectedCandidateName);
}

// Function to submit the vote to the backend
function submitVote(selectedCandidateName) {
    // Create an object with the vote data
    const formData = {
        candidateName: selectedCandidateName // Include the candidate's name in the formData object
    };

    // Send the vote data to the backend server
    fetch(backendEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // Vote submitted successfully
            alert("Vote recorded successfully!");
        } else if (response.status === 400) {
            // User has already voted
            alert("You have already voted.");
        } else if (response.status === 404) {
            // User not found
            alert("User not found.");
        } else {
            // Other errors
            throw new Error('Failed to submit vote.');
        }
    })
    .catch(error => {
        console.error('Vote submission error:', error);
        alert('Failed to submit vote. Please try again.');
    });
}

// Add event listener to the form for submission
const voteForm = document.getElementById('voteForm');
voteForm.addEventListener('submit', handleFormSubmit);
