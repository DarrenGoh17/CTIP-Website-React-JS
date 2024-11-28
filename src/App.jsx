import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import MainSlider from './components/MainSlider';
import SessionSlider from './components/SessionSlider';
import AnimalSlider from './components/AnimalSlider';
import Program from './components/Program';
import Donation from './components/Donation';
import Registration from './components/Registration';
import Footer from './components/Footer';
import Entry from './components/Entry';
import Discover from './components/Discover'; 
import Wildlife from './components/Wildlife'; 
import Events from './components/Events'; 
import DonationPage from './components/DonationPage'; 
import AdminDashboard from './components/AdminDashboard';
import TableauDashboard from './components/TableauDashboard';
import Voucher from './components/Voucher';
import Profile from './components/Profile';
import IoTDashboard from './components/IoTDashboard';
import ChatButton from './components/ChatButton'; 

import './App.css'; 

import { AuthProvider } from '../backend/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <>
                <MainSlider />
                <SessionSlider />
                <AnimalSlider />
                <Program />
                <Donation />
                <Registration />
              </>
            } />
            <Route path="/entry" element={<Entry />} />
            <Route path="/discover" element={<Discover />} /> 
            <Route path="/wildlife" element={<Wildlife />} /> 
            <Route path="/events" element={<Events />} /> 
            <Route path="/donationPage" element={<DonationPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/tableau-dashboard" element={<TableauDashboard />} />
            <Route path="/voucher" element={<Voucher />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/iot-dashboard" element={<IoTDashboard />} />
          </Routes>
          <Footer />
          <ChatButton />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
