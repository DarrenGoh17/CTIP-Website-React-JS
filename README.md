# CTIP-Website-React-JS
## Software Used
1. React JS (Web developement)
2. Node.js (Run on localhost): https://nodejs.org/en/download/prebuilt-installer/current
## Dependencies
1. All Dependencies are installed in node modules already.
3. This project requires the following dependencies:
- `express`
- `mysql`
- `body-parser`
- `cors`
- `bcrypt`
- `jsonwebtoken`
- `nodemailer`
- `crypto`
- `react`
- `react-dom`
- `react-bootstrap`
- `bootstrap`
- `axios`
- `react-router-dom`
- `sweetalert2`
- `primereact`
- `primeicons`
- `jquery`
- `gsap`

4. Full dependencies installation
npm install express mysql body-parser cors bcrypt jsonwebtoken nodemailer crypto react react-dom react-bootstrap bootstrap axios react-router-dom sweetalert2 primereact primeicons jquery gsap
5. If there's any missing dependencies, type npm install "libary".


## How to Setup
1. Run Apache and MySQL in XAAMP.
2. Open VS Code and locate "Semenggoh Website" directory.
5. Change the email in server.js under "const insertAdminSql" to your respective email to enable OTP sent to your email when admin login
6. Open 3 terminals in VSC
7. Type "cd backend" and "node server.js" to enable the creation of tables in "semenggoh" database (1st Terminal).
8. Type "cd backend" and "node backup.js" to allow real-time database backup in JSON file (2nd Terminal).
9. Type "npm run dev" and "Ctrl + Click" the link provided.
10. Admin Credentials:
    - Username: admin
    - Password: 1
11. Due to the IoT Kit has been dismantle, "sensor_readings.sql" can be use to create the table in database.
12. Navigate to "http://localhost/phpmyadmin/index.php?route=/server/databases" and click "semenggoh". Import "sensor_readings.sql" into databse by clicking "Import" button on top and select "sensor_readings.sql".
13. Everything should run as expected.
14. Open 3 more VSC to run Admin and User Chatbot, Training Model for Image and Video Prediction.
15. For user_chatbot.py and admin_chatbot.py under "Chatbot (user)" & "Chatbot (admin)", change a new Google API Key using (https://aistudio.google.com/app/apikey).
16. Change the directory of index, faiss_ids and descriptions directory based on your local folder in "Chatbot (user)".
17. In the first terminal, "cd Chatbot (admin)" and type "python admin_chatbot.py" to run admin chatbot locally.
18. In the second terminal, "cd Chatbot (user)" and type "python user_chatbot.py" to run user chatbot locally.
19. In the third terminal, "cd image_vd_prediction" and type "python model_prediction.py" to run trained modal locally.
