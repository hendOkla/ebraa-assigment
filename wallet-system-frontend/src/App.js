import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Table } from 'react-bootstrap';

function App() {
    const [username, setUsername] = useState('');
    const [amount, setAmount] = useState(0.00); // Set initial state to 0
    const [action, setAction] = useState('create');// State to determine the current action (create, top-up, charge) 
    const [users, setUsers] = useState([]);// State to hold the list of users fetched from the server

    useEffect(() => {
        fetchUsers();// Call fetchUsers to retrieve the user list from the server
    }, []);

    // Function to fetch users from the serve
    const fetchUsers = async () => {
         //request to retrieve all users
        const response = await axios.get('http://localhost:5000/api/users');

        // Update the users state with the data received from the server
        setUsers(response.data);
    };


    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Check the current action
            if (action === 'create') {// Create a new account
                await axios.post('http://localhost:5000/api/account', { username, amount: parseFloat(amount) });
            } else if (action === 'topup') {// Top-up an existing account
                await axios.post('http://localhost:5000/api/topup', { username, amount: parseFloat(amount) });
            } else if (action === 'charge') {  // Charge an account
                await axios.post('http://localhost:5000/api/charge', { username, amount: parseFloat(amount) });
            }
            // Clear the input fields only on success
            setUsername('');
            setAmount(0.00); // Reset amount to 0 on success
            fetchUsers();// Refresh the list of users
            alert('Success!');
        } catch (error) {
            alert(`Error: ${error.response.data.error}`);
            // Do not clear the input fields on error
        }
    };

    return (
        <Container>
            <h1 className="mt-4">Wallet System</h1>
            <Form onSubmit={handleSubmit} className="mb-4">
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={amount} // Ensure it reflects the state
                        onChange={(e) => setAmount(e.target.value)} // Update state correctly
                        required={action !== 'create'}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Action</Form.Label>
                    <Form.Control as="select" onChange={(e) => setAction(e.target.value)} value={action}>
                        <option value="create">Create Account</option>
                        <option value="topup">Top-Up</option>
                        <option value="charge">Charge</option>
                    </Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit" className='my-3'>Submit</Button>
            </Form>

            <h2>All Users</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Balance</th>
                        <th>Transactions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>${user.balance.toFixed(2)}</td>
                            <td>
                                <ul>
                                    {user.transactions.map((tx, index) => (
                                        <li key={index}>{tx.type} ${tx.amount.toFixed(2)}</li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default App;