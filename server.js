const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb+srv://elijaheverett3271:warzone@project54.mg9cvke.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database');
});

// Define a schema for the user model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    hasVoted: { type: Boolean, default: false } // Add a field to track if the user has voted
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

// Define a schema for the vote model
const voteSchema = new mongoose.Schema({
    candidate: String, // Assuming you want to store the candidate name
    timestamp: { type: Date, default: Date.now } // Optionally, you can store the timestamp of the vote
});

// Create a model based on the schema
const Vote = mongoose.model('Vote', voteSchema);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if username or email already exists in the database
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });

        // Save the new user to the database
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
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database by username
        const user = await User.findOne({ username });

        // If user not found or password does not match, return error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // If username and password are correct, login successful
        console.log('User logged in:', user.username);
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});