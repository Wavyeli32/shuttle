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
    hasVoted: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

const voteSchema = new mongoose.Schema({
    candidate: String,
    timestamp: { type: Date, default: Date.now }
});

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

// Update the /vote endpoint to handle storing votes
app.post('/vote', async (req, res) => {
    const { vote } = req.body;

    try {
        // Create a new vote instance
        const newVote = new Vote({ candidate: vote });

        // Save the new vote to the database
        await newVote.save();

        console.log(`Vote recorded for ${vote}`);
        
        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/get-vote-data', async (req, res) => {
    try {
        // Retrieve vote data from MongoDB or any other data source
        // For this example, let's assume you have a Vote model in MongoDB
        const votes = await Vote.find();

        // Constructing data to send back to the client
        const voteData = {
            votes: votes
        };

        // Sending the vote data to the client
        res.status(200).json(voteData);
    } catch (error) {
        console.error('Error fetching vote data:', error);
        res.status(500).json({ message: 'Failed to fetch vote data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
