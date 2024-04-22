// dashboard.js
const chatBox = document.getElementById('chatBox');

// Function to fetch notifications from the server
async function fetchNotifications() {
    try {
        const response = await fetch('/notifications');
        if (response.ok) {
            const notifications = await response.json();
            notifications.forEach(notification => {
                addMessage(notification.message, notification.timestamp);
            });
        } else {
            console.error('Failed to fetch notifications');
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

// Function to add a message to the chat box
function addMessage(message, timestamp) {
    const listItem = document.createElement('li');
    const timeAgo = getTimeAgo(timestamp);
    listItem.textContent = `${message} - ${timeAgo}`;
    chatBox.appendChild(listItem);
}

// Function to calculate the time ago from the timestamp
function getTimeAgo(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const difference = now.getTime() - messageTime.getTime();
    const seconds = Math.floor(difference / 1000);

    if (seconds < 60) {
        return 'just now';
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(seconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Fetch notifications when the page loads
document.addEventListener('DOMContentLoaded', fetchNotifications);
