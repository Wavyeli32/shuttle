const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Define a schema for the user model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    hasVoted: { type: Boolean, default: false }
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

// Define a schema for the vote model
const voteSchema = new mongoose.Schema({
    candidate: String,
    timestamp: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Vote = mongoose.model('Vote', voteSchema);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
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
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
