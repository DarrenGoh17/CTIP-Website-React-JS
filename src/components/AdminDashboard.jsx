import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import config from '../../backend/config';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);  // Toggle between Add/Edit

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            alert('Error fetching users');
        }
    };

    const handleAddUser = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/signup`, {
                username,
                email,
                phoneNumber,
                password,
            });
            alert(response.data.message);
            fetchUsers();
            clearForm();
        } catch (error) {
            alert('Error adding user');
        }
    };

    const handleEditUser = async () => {
        try {
            const response = await axios.put(`${config.API_BASE_URL}/user/${editingUserId}`, {
                username,
                email,
                phoneNumber,
                password,
            });
            alert(response.data.message);
            fetchUsers();
            clearForm();
            setEditingUserId(null);
            setIsEditingMode(false);
        } catch (error) {
            alert('Error updating user');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await axios.delete(`${config.API_BASE_URL}/user/${userId}`);
            alert(response.data.message);
            fetchUsers();
        } catch (error) {
            alert('Error deleting user');
        }
    };

    const clearForm = () => {
        setUsername('');
        setEmail('');
        setPhoneNumber('');
        setPassword('');
    };

    const handleEditButtonPress = (item) => {
        setUsername(item.username);
        setEmail(item.email);
        setPhoneNumber(item.phone_number);
        setPassword('');
        setEditingUserId(item.id);
        setIsEditingMode(true);
    };

    const toggleAddMode = () => {
        setIsEditingMode(false);
        clearForm();
        setEditingUserId(null);
    };

    return (
        <Container className="admin-dashboard-container">
            <h2 className="admin-dashboard-title">Admin Dashboard</h2>
            <Row>
                <Col md={12}>
                    <div className="admin-form-container">
                        <h4>{isEditingMode ? 'Edit User' : 'Add User'}</h4>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            isEditingMode ? handleEditUser() : handleAddUser();
                        }}>
                            <input
                                type="text"
                                className="admin-form-input"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                className="admin-form-input"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                className="admin-form-input"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                className="admin-form-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" className="admin-btn-submit">
                                {isEditingMode ? 'Update User' : 'Add User'}
                            </Button>
                            {isEditingMode && (
                                <Button onClick={toggleAddMode} className="admin-btn-cancel-edit">
                                    Cancel Edit
                                </Button>
                            )}
                        </form>
                    </div>
                </Col>
            </Row>

            <h4>User List</h4>
            <Table className="admin-table" striped bordered hover>
                <thead className="admin-table-head">
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.phone_number}</td>
                            <td>
                                <Button variant="primary" className="admin-btn-edit" onClick={() => handleEditButtonPress(user)}>Edit</Button>
                                <Button variant="danger" className="admin-btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminDashboard;
