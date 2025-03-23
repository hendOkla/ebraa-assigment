// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wallet', { useNewUrlParser: true, useUnifiedTopology: true });

// Create Account 
app.post('/api/account', async (req, res) => {
    const { username, amount } = req.body; // Expecting amount in the request body
    try {
        // Parse the amount and check if it's a valid number
        const initialAmount = parseFloat(amount);

        // Validate that the initial amount is a valid number
        if (isNaN(initialAmount) || initialAmount <0 ) {
            return res.status(400).json({ error: 'The amount must be a valid number.' });
        }

        // Create a new user object
        const newUser = new User({ username });
        newUser.balance = initialAmount.toFixed(2); // Set the initial balance (keep two decimal places)

        // Add the first payment transaction
        newUser.transactions.push({ type: 'first-pay', amount: initialAmount });

        // Save the new user to the database
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ error: 'Username already exists.' });
        }
        res.status(400).json({ error: error.message });
    }
});


// Endpoint to handle top-up requests for a user's account
app.post('/api/topup', async (req, res) => {
    const { username, amount } = req.body;
    try {
        // Find the user by username in the database
        const user = await User.findOne({ username });

        // If user is not found, return a 404 error
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check for duplicate transactions for the same top-up amount
        const duplicate = user.transactions.find(tx => tx.type === 'top-up' && tx.amount === amount);
        // If a duplicate transaction is found, return a 400 error
        if (duplicate) return res.status(400).json({ error: 'Duplicate transaction' });

        // Ensure the amount is greater than 0
        if (amount<=0) return res.status(401).json({ error: 'Wrong transaction, must be grater than 0' });

        // Update the user's balance by adding the top-up amount
        user.balance = parseFloat((user.balance + amount).toFixed(2));

        // Record the top-up transaction in the user's transaction history
        user.transactions.push({ type: 'top-up', amount });

        // Save the updated user information back to the database
        await user.save();

        // Respond with the updated user object
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to handle charge requests for a user's account
app.post('/api/charge', async (req, res) => {
    const { username, amount } = req.body;
    try {
        // Find the user by username in the database
        const user = await User.findOne({ username });

        // If user is not found, return a 404 error
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if the user's balance is sufficient for the charge
        if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

        // Check for duplicate charge transactions with the same amount
        const duplicate = user.transactions.find(tx => tx.type === 'charge' && tx.amount === amount);

        // If a duplicate transaction is found, return a 400 error
        if (duplicate) return res.status(400).json({ error: 'Duplicate transaction' });

        // Ensure the amount is greater than 0
        if (amount<=0) return res.status(401).json({ error: 'Wrong transaction, must be grater than 0' });

         // Update the user's balance by subtracting the charge amount
        user.balance = parseFloat((user.balance - amount).toFixed(2));

        // Record the charge transaction in the user's transaction history
        user.transactions.push({ type: 'charge', amount });

        // Save the updated user information back to the database
        await user.save();

        // Respond with the updated user object
        res.json(user);
    } catch (error) {
         // Handle any errors that occur during the process
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to retrieve and display all users
app.get('/api/users', async (req, res) => {
    try {
         // Fetch all users from the database
        const users = await User.find();

        // Respond with the list of users
        res.json(users);
    } catch (error) {
         // Handle  errors
        res.status(400).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});