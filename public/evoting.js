const backendEndpoint = '/vote';

function submitVote(selectedCandidate) {
    // Create an object with the vote data
    const formData = {
        vote: selectedCandidate
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