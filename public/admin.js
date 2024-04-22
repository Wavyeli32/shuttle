// admin.js
const notificationForm = document.getElementById('notificationForm');

notificationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const message = document.getElementById('message').value;
    
    try {
        const response = await fetch('/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (response.ok) {
            console.log('Notification sent successfully');
        } else {
            console.error('Failed to send notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});
