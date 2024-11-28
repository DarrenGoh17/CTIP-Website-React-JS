# CTIP-Website-React-JS
## Software Used
1. React JS (Web development)
2. Node.js (Run on localhost): https://nodejs.org/en/download/prebuilt-installer/current

# Website
## Dependencies
1. All Dependencies are installed in node modules already.
2. This project requires the following dependencies:
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

3. Full dependencies installation
npm install express mysql body-parser cors bcrypt jsonwebtoken nodemailer crypto react react-dom react-bootstrap bootstrap axios react-router-dom sweetalert2 primereact primeicons jquery gsap
4. If there are any missing dependencies, type npm install "libary".


## How to Setup
1. Run Apache and MySQL in XAAMP.
2. Open VS Code and locate "Semenggoh Website" directory.
5. Change the email in server.js under "const insertAdminSql" to your respective email to enable OTP sent to your email when the admin login
6. Open 3 terminals in VSC
7. Type "cd backend" and "node server.js" to enable the creation of tables in "semenggoh" database (1st Terminal).
8. Type "cd backend" and "node backup.js" to allow real-time database backup in JSON file (2nd Terminal).
9. Type "npm run dev" and "Ctrl + Click" the link provided.
10. Admin Credentials:
    - Username: admin
    - Password: 1
11. Due to the IoT Kit has been dismantled, "sensor_readings.sql" can be used to create the table in the database.
12. Navigate to "http://localhost/phpmyadmin/index.php?route=/server/databases" and click "semenggoh". Import "sensor_readings.sql" into databse by clicking "Import" button on top and select "sensor_readings.sql".
13. Everything should run as expected.

# Chabot and Trained Model
## Dependencies
1. This project requires the following dependencies:
- `opencv-python-headless`
- `numpy`
- `torch`
- `flask`
- `ultralytics`
- `torchvision`
- `pillow`
- `google-generativeai`
- `numpy`
- `faiss`
- `sentence-transformers`
2. Full dependencies installation
pip install opencv-python-headless numpy torch flask ultralytics torchvision pillow google-generativeai faiss-cpu sentence-transformers


## How to Setup
1. Open 3 more VSC to run Admin and User Chatbot, Training Model for Image and Video Prediction.
2. For user_chatbot.py and admin_chatbot.py under "Chatbot (user)" & "Chatbot (admin)", change a new Google API Key using (https://aistudio.google.com/app/apikey).
3. Change the directory of index, faiss_ids and descriptions directory based on your local folder in "Chatbot (user)".
4. Change the directory of "yolo_model_path" and "resnet_model.load_state_dict(torch.load(PATH))" in "image_vd_prediction" folder.
5. In the first terminal, "cd Chatbot (admin)" and type "python admin_chatbot.py" to run the admin chatbot locally.
6. In the second terminal, "cd Chatbot (user)" and type "python user_chatbot.py" to run the user chatbot locally.
7. In the third terminal, "cd image_vd_prediction" and type "python model_prediction.py" to run the trained modal locally.
8. Everything should work as expected when you click on the Chatbot and Trained Modal button on the website.
