import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB database');
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    role: { type: String, default: 'user' } // Add 'role' field with default value 'user'
});

const User = mongoose.model('User', userSchema);

const notificationSchema = new mongoose.Schema({
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });

        const savedUser = await newUser.save();
        console.log('Received registration data:');
        console.log('Username:', username);
        console.log('Email:', email);

        res.status(200).json({ message: 'Registration successful', user: savedUser });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        console.log('User logged in:', user.username);

        if (user.role === 'admin') {
            console.log('Admin user logged in');
            res.json({ message: 'Login successful', redirect: '/admin.html', user });
        } else {
            res.json({ message: 'Login successful', redirect: '/nsu.html', user });
        }
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Backend route to receive the notification from the frontend
app.post('/send-notification', async (req, res) => {
    try {
        const { message } = req.body;

        // Save the received notification message to the database
        const newNotification = new Notification({
            message: message,
            timestamp: new Date() // Add a timestamp for the notification
        });

        // Save the notification to the database
        await newNotification.save();

        // Send the notification to the student dashboard
        // You can implement this part based on your specific setup
        // For example, you can use WebSocket or server-sent events to push notifications to the client
        // Here, we'll just log the notification
        console.log('Notification sent:', message);

        // Send a response indicating successful receipt of the notification
        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (err) {
        console.error('Error receiving notification:', err);
        res.status(500).json({ message: 'Error receiving notification' });
    }
});


app.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find({}).lean();

        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
