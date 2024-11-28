const Footer = () => {
    return (
        <footer className="footer" style={{ boxShadow: "0 1px 8px rgba(0, 0, 0, 0.4)"}}>
            <div className="footer-section">
                <h3>Daily Opening Hours</h3>
                <p>8:00am - 4:00pm</p>
            </div>
            <div className="footer-section">
                <h3>Address</h3>
                <p>Jalan Puncak Borneo, Km 20,</p>
                <p>93250 Kuching,</p>
                <p>Sarawak, Malaysia</p>
            </div>
            <div className="footer-section">
                <h3>About Us</h3>
                <ul className="footer-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/discover">Discover</a></li>
                    <li><a href="/wildlife">Wildlife</a></li>
                    <li><a href="/events">Events</a></li>
                    <li><a href="/donationPage">Donation Platform</a></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
