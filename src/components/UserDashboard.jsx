// src/components/UserDashboard.js
import React from 'react';
import { Container } from 'react-bootstrap';

const UserDashboard = () => {
  return (
    <Container style={{ marginTop: '20px' }}>
      <h2>User Dashboard</h2>
      {/* Add your user functionalities here */}
      <p>This is the user dashboard. Only accessible by regular users.</p>
    </Container>
  );
};

export default UserDashboard;
