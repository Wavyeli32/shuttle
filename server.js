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
    candidateName: String, // Change 'candidate' to 'candidateName'
    votes: { type: Number, default: 0 }, // Add 'votes' field to track the number of votes
    timestamp: { type: Date, default: Date.now }
});


const Vote = mongoose.model('Vote', voteSchema);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if the username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // If neither username nor email exists, proceed with registration
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

app.post('/vote', async (req, res) => {
    const selectedCandidateName = req.body.selectedCandidateName; 

    try {
        // Check if the candidate already exists in the database
        let candidate = await Vote.findOne({ candidateName: selectedCandidateName });

        if (!candidate) {
            // If the candidate does not exist, create a new entry
            candidate = new Vote({ candidateName: selectedCandidateName });
        }

        // Increment the vote count for the selected candidate
        candidate.votes += 1;

        // Save the updated candidate information to the database
        await candidate.save();
        
        // Send a success response
        res.status(200).json({ message: 'Vote recorded successfully!', candidate: selectedCandidateName });
    } catch (error) {
        console.error('Error recording vote:', error);
        // Send an error response
        res.status(500).json({ message: 'Failed to record vote.' });
    }
});


app.get('/get-vote-data', async (req, res) => {
    try {
        // Retrieve voting data from the database
        const voteData = await Vote.aggregate([
            { $group: { _id: '$candidateName', votes: { $sum: 1 } } } // Updated field name to 'candidateName'
        ]);

        // Format the voting data as an array of objects with candidate names and votes
        const formattedVoteData = voteData.map(vote => ({
            name: vote._id, // Set the 'name' field to the candidate name
            votes: vote.votes
        }));

        // Send the voting data as JSON response
        res.status(200).json({ candidates: formattedVoteData });
    } catch (error) {
        console.error('Error fetching vote data:', error);
        // Send an error response
        res.status(500).json({ message: 'Failed to fetch vote data.' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});