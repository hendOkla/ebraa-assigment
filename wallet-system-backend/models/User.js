// models/User.js
const mongoose = require('mongoose');

// Transaction Schema
const transactionSchema = new mongoose.Schema({

    /* first-pay => if insert amount when create new user / top-up=>  to add amount / charge  to deduct the amount */
    type: { type: String, enum: ['first-pay', 'top-up', 'charge'], required: true },
    amount: {
        type: Number,
        required: true,
        min: [0.00, 'Amount must be greater than 0'], // Ensure amount is greater than 0
        validate: {
            validator: function(v) {
                return v >= 0; // Ensure amount is a positive number
            },
            message: props => `${props.value} is not a valid amount! Amount must be equal or greater than 0.`,
        },
    },
    date: { type: Date, default: Date.now },
});

// User Schema 
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    balance: {
        type: Number,
        default: 0.0,
        min: [0.00, 'Balance must be greater than 0'], // Ensure balance is greater than 0
        validate: {
            validator: function(v) {
                return v >= 0; // Ensure balance is a positive number
            },
            message: props => `${props.value} is not a valid balance! Balance must be equal or greater than 0..`,
        },
    },
    transactions: [transactionSchema],
});

// Export the User model
module.exports = mongoose.model('User', userSchema);