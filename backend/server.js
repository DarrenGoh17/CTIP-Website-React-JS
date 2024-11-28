import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import config from './config.js';

const app = express();
const saltRounds = 10;
const jwtSecret = 'your_jwt_secret'; // Store this securely, ideally in environment variables

app.use(cors());
app.use(bodyParser.json());

// Setup transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

// Create connection to MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
});


// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');

    // Create the database if it does not exist
    const createDatabaseSql = 'CREATE DATABASE IF NOT EXISTS semenggoh';
    db.query(createDatabaseSql, (err) => {
        if (err) throw err;
        console.log('Database created or already exists');

        // Use the created database
        db.query('USE semenggoh', (err) => {
            if (err) throw err;

            // Create tables if they do not exist
            createTables();
        });
    });
});

// Function to create tables
function createTables() {
    // Create the users table if it does not exist
    const createUsersTableSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone_number VARCHAR(15),
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user'
        )
    `;
    db.query(createUsersTableSql, (err) => {
        if (err) throw err;
        console.log('Users table created or already exists');

        // Create the user_details table if it does not exist
        createUserDetailsTable();
    });
}

// Function to create the user_details table
function createUserDetailsTable() {
    const createUserDetailsTableSql = `
        CREATE TABLE IF NOT EXISTS user_details (
            user_id INT PRIMARY KEY,
            date_of_birth DATE,
            gender ENUM('Male', 'Female', 'Rather not say'),
            avatar VARCHAR(255),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createUserDetailsTableSql, (err) => {
        if (err) throw err;
        console.log('User details table created or already exists');

        // Create the user_donation table if it does not exist
        createUserDonationTable();
    });
}

// Function to create the user_donation table
function createUserDonationTable() {
    const createUserDonationTableSql = `
        CREATE TABLE IF NOT EXISTS user_donation (
            user_id INT PRIMARY KEY,
            donation_amount DECIMAL(10, 2) DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createUserDonationTableSql, (err) => {
        if (err) throw err;
        console.log('User donation table created or already exists');

        // Create the user_voucher table if it does not exist
        createOtpTableSql();
    });
}

// Function to create otp table
function createOtpTableSql() {
    const createOtpTableSql = `
        CREATE TABLE IF NOT EXISTS otp_verification (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp_code VARCHAR(6) NOT NULL
        )
    `;
    db.query(createOtpTableSql, (err) => {
        if (err) throw err;
        console.log('OTP table created or already exists');

        // Create the otp table if it does not exist
        createUserVoucherTable();
    });
}

// Function to create the user_voucher table
function createUserVoucherTable() {
    const createUserVoucherTableSql = `
        CREATE TABLE IF NOT EXISTS user_voucher (
            user_id INT PRIMARY KEY,
            voucher_10 BOOLEAN DEFAULT FALSE,
            voucher_10_redeem BOOLEAN DEFAULT FALSE,
            voucher_20 BOOLEAN DEFAULT FALSE,
            voucher_20_redeem BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createUserVoucherTableSql, (err) => {
        if (err) throw err;
        console.log('User voucher table created or already exists');

        // Create the user_preference table if it does not exist
        createUserPreferenceTable();
    });
}

// Function to create the user_preference table
function createUserPreferenceTable() {
    const createUserPreferenceTableSql = `
        CREATE TABLE IF NOT EXISTS user_preference (
            user_id INT PRIMARY KEY,
            feeding_count INT DEFAULT 0,
            nature_walk_count INT DEFAULT 0,
            photography_count INT DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    db.query(createUserPreferenceTableSql, (err) => {
        if (err) throw err;
        console.log('User preference table created or already exists');

        // Create an admin user if it doesn't exist
        createAdminUser();
    });
}

// Function to create an admin user if it doesn't exist
function createAdminUser() {
    const checkAdminSql = `SELECT username FROM users WHERE username = 'admin'`;
    db.query(checkAdminSql, (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            bcrypt.hash('1', saltRounds, (err, hash) => {
                if (err) throw err;
                const insertAdminSql = `
                    INSERT INTO users (username, email, phone_number, password, role)
                    VALUES ('admin', 'darrengoh040317@gmail.com', '1234567890', ?, 'admin')
                `;
                db.query(insertAdminSql, [hash], (err, result) => {
                    if (err) throw err;

                    // Insert default admin details
                    const insertAdminDetailsSql = `
                        INSERT INTO user_details (user_id, gender, avatar)
                        VALUES (?, 'Male', 'monkey')
                    `;
                    db.query(insertAdminDetailsSql, [result.insertId], (err) => {
                        if (err) throw err;
                        console.log('Default admin user and details created');

                        // Create default user preference for admin
                        const insertUserPreferenceSql = `
                            INSERT INTO user_preference (user_id, feeding_count, nature_walk_count, photography_count)
                            VALUES (?, 1, 0, 0)
                        `;
                        db.query(insertUserPreferenceSql, [result.insertId], (err) => {
                            if (err) throw err;
                            console.log('Default user preferences for admin created');
                        });
                    });
                });
            });
        } else {
            console.log('Default admin user already exists');
        }
    });
}


// Middleware to check role using JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const checkRole = (requiredRole) => (req, res, next) => {
    if (req.user.role !== requiredRole) {
        return res.status(403).send({ error: 'Access forbidden: insufficient role' });
    }
    next();
};

// Route to register a new user
app.post('/api/signup', (req, res) => {
    const { username, email, phoneNumber, password } = req.body;

    if (!username || !email || !phoneNumber || !password) {
        return res.status(400).send({ error: 'All fields are required' });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).send({ error: 'Server error' });
        }

        const checkSql = `SELECT * FROM users WHERE username = ? OR email = ?`;
        db.query(checkSql, [username, email], (err, results) => {
            if (err) {
                return res.status(500).send({ error: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(400).send({ error: 'Username or email already exists' });
            }

            const insertSql = `INSERT INTO users (username, email, phone_number, password) VALUES (?, ?, ?, ?)`;
            db.query(insertSql, [username, email, phoneNumber, hash], (err, result) => {
                if (err) {
                    return res.status(500).send({ error: 'Database error' });
                }

                const userId = result.insertId;

                // Insert default user details
                const insertDetailsSql = `
                    INSERT INTO user_details (user_id, gender, avatar)
                    VALUES (?, 'Rather not say', 'monkey')
                `;
                db.query(insertDetailsSql, [userId], (err) => {
                    if (err) {
                        return res.status(500).send({ error: 'Error inserting user details' });
                    }

                    // Assign default voucher_20 without voucher code
                    const insertVoucherSql = `
                        INSERT INTO user_voucher (user_id, voucher_20, voucher_20_redeem)
                        VALUES (?, TRUE, FALSE)
                    `;
                    db.query(insertVoucherSql, [userId], (err) => {
                        if (err) {
                            return res.status(500).send({ error: 'Error assigning default voucher' });
                        }

                        // Insert default user preferences
                        const insertPreferenceSql = `
                            INSERT INTO user_preference (user_id, feeding_count, nature_walk_count, photography_count)
                            VALUES (?, 1, 0, 0)
                        `;
                        db.query(insertPreferenceSql, [userId], (err) => {
                            if (err) {
                                return res.status(500).send({ error: 'Error inserting default user preferences' });
                            }

                            res.status(200).send({ message: 'User registered successfully' });
                        });
                    });
                });
            });
        });
    });
});

// Route to handle login
app.post('/api/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).send({ error: 'All fields are required' });
    }

    const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;
    db.query(sql, [usernameOrEmail, usernameOrEmail], (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        bcrypt.compare(password, results[0].password, (err, isMatch) => {
            if (err) return res.status(500).send({ error: 'Server error' });
            if (!isMatch) return res.status(400).send({ error: 'Invalid credentials' });

            const user = { username: results[0].username, role: results[0].role, id: results[0].id, email: results[0].email };
            const accessToken = jwt.sign(user, jwtSecret, { expiresIn: '1h' });

            res.status(200).send({ success: true, message: 'Login successful', token: accessToken, role: user.role, username: user.username, id: user.id, email: user.email });
        });
    });
});

// Protected admin route
app.post('/api/admin/create', authenticateToken, checkRole('admin'), (req, res) => {
    res.send({ message: 'Admin route accessed' });
});

// Route to get all users
app.get('/api/users', (req, res) => {
    const selectSql = 'SELECT * FROM users';
    db.query(selectSql, (err, results) => {
        if (err) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.status(200).send(results);
        }
    });
});

// Route to update a user
app.put('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, phoneNumber, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).send({ error: 'Server error during password hashing' });
        }

        const updateSql = `
            UPDATE users SET username = ?, email = ?, phone_number = ?, password = ?
            WHERE id = ?
        `;
        db.query(updateSql, [username, email, phoneNumber, hash, id], (err, result) => {
            if (err) {
                return res.status(500).send({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: 'User not found' });
            }
            res.status(200).send({ message: 'User updated successfully' });
        });
    });
});

// Route to delete a user
app.delete('/api/user/:id', (req, res) => {
    const { id } = req.params;

    const deleteSql = 'DELETE FROM users WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    });
});

// Route to get user details
app.get('/api/user-details/:userId', (req, res) => {
    const { userId } = req.params;

    const sql = `SELECT * FROM user_details WHERE user_id = ?`;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).send({ error: 'User details not found' });
        }

        res.status(200).send(results[0]);
    });
});

// Route to update user details
app.put('/api/user-details/:userId', (req, res) => {
    const { userId } = req.params;
    const { dateOfBirth, gender, avatar } = req.body;

    const updateSql = `
        UPDATE user_details SET date_of_birth = ?, gender = ?, avatar = ?
        WHERE user_id = ?
    `;
    db.query(updateSql, [dateOfBirth, gender, avatar, userId], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }
        console.log("Database update affected rows:", result.affectedRows);
        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'User details not found' });
        }
        res.status(200).send({ message: 'User details updated successfully' });
    });
});

// Route to add a donation amount for a user
app.post('/api/user/:userId/donate', (req, res) => {
    const { userId } = req.params;
    const { donationAmount } = req.body;

    if (!donationAmount || donationAmount <= 0) {
        return res.status(400).send({ error: 'Donation amount must be a positive number' });
    }

    const updateDonationSql = `
        INSERT INTO user_donation (user_id, donation_amount)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE donation_amount = donation_amount + VALUES(donation_amount)
    `;

    db.query(updateDonationSql, [userId, donationAmount], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }
        res.status(200).send({ message: 'Donation amount updated successfully' });
    });
});

// Route to get the total donation amount from all users
app.get('/api/donations/total', (req, res) => {
    const totalDonationSql = 'SELECT SUM(donation_amount) AS totalDonation FROM user_donation';

    db.query(totalDonationSql, (err, result) => {
        if (err) {
            console.error('Error fetching total donations:', err);
            return res.status(500).json({ error: 'Failed to fetch total donations' });
        }
        
        // Set totalDonation to 0 if there are no donations (null result)
        const totalDonation = result[0].totalDonation || 0;

        res.status(200).json({ totalDonation });
    });
});

// Route to assign a voucher to a user
app.post('/api/user/:userId/assign-voucher', (req, res) => {
    const { userId } = req.params;
    const { voucherType } = req.body;

    let sql = '';
    let params = [];

    if (voucherType === '10') {
        sql = `
            INSERT INTO user_voucher (user_id, voucher_10, voucher_10_redeem)
            VALUES (?, TRUE, FALSE)
            ON DUPLICATE KEY UPDATE voucher_10 = TRUE, voucher_10_redeem = FALSE
        `;
        params = [userId];
    } else if (voucherType === '20') {
        sql = `
            INSERT INTO user_voucher (user_id, voucher_20, voucher_20_redeem)
            VALUES (?, TRUE, FALSE)
            ON DUPLICATE KEY UPDATE voucher_20 = TRUE, voucher_20_redeem = FALSE
        `;
        params = [userId];
    } else {
        return res.status(400).send({ error: 'Invalid voucher type' });
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.status(200).send({ message: `Voucher ${voucherType} assigned successfully` });
    });
});

// Route to redeem a voucher for a user
app.post('/api/user/:userId/redeem-voucher', (req, res) => {
    const { userId } = req.params;
    const { voucherType } = req.body;

    let sql = '';
    let params = [];

    if (voucherType === '10') {
        sql = `
            UPDATE user_voucher
            SET voucher_10_redeem = TRUE
            WHERE user_id = ? AND voucher_10 = TRUE AND voucher_10_redeem = FALSE
        `;
        params = [userId];
    } else if (voucherType === '20') {
        sql = `
            UPDATE user_voucher
            SET voucher_20_redeem = TRUE
            WHERE user_id = ? AND voucher_20 = TRUE AND voucher_20_redeem = FALSE
        `;
        params = [userId];
    } else {
        return res.status(400).send({ error: 'Invalid voucher type' });
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'Voucher not found or already redeemed' });
        }
        res.status(200).send({ message: `Voucher ${voucherType} redeemed successfully` });
    });
});

// Route to get voucher status for a user
app.get('/api/user/:userId/voucher-status', (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT voucher_10, voucher_10_redeem, voucher_20, voucher_20_redeem 
        FROM user_voucher 
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).send({ error: 'No voucher data found for the user' });
        }

        res.status(200).send(results[0]);
    });
});

// Route to fetch user preference data
app.get('/api/user-preference/:userId', (req, res) => {
    const { userId } = req.params;

    const sql = `SELECT * FROM user_preference WHERE user_id = ?`;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).send({ error: 'User preference not found' });
        }

        res.status(200).send(results[0]);
    });
});

// Route to update user preference data
app.post('/api/user-preference/:userId', (req, res) => {
    const { userId } = req.params;
    const { type } = req.body;  // Type of the activity (e.g., 'feeding', 'nature_walk', 'photography')

    if (!type) {
        return res.status(400).send({ error: 'Type of activity is required' });
    }

    // SQL query to update the count based on the type
    const sql = `
        UPDATE user_preference
        SET ${type}_count = ${type}_count + 1
        WHERE user_id = ?;
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'User preference not found' });
        }

        res.status(200).send({ success: true });
    });
});

// Route to generate and send OTP
app.post('/api/request-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    // Generate a random 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    const insertOtpSql = `
        INSERT INTO otp_verification (email, otp_code)
        VALUES (?, ?)
    `;
    db.query(insertOtpSql, [email, otpCode], (err) => {
        if (err) return res.status(500).send({ error: 'Database error' });

        // Send OTP to user's email
        const mailOptions = {
            from: config.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otpCode}`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) return res.status(500).send({ error: 'Failed to send OTP。。' });
            res.status(200).send({ message: 'OTP sent to email' });
        });
    });
});

// Route to verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
        return res.status(400).send({ error: 'Email and OTP are required' });
    }

    // Query to check if OTP exists for the given email
    const checkOtpSql = `
        SELECT * FROM otp_verification WHERE email = ? AND otp_code = ?
    `;
    db.query(checkOtpSql, [email, otpCode], (err, results) => {
        if (err) return res.status(500).send({ error: 'Database error' });

        if (results.length === 0) {
            // OTP doesn't match
            return res.status(400).send({ error: 'Invalid OTP or email' });
        }

        // OTP is valid, delete it after verification to prevent reuse
        const deleteOtpSql = `
            DELETE FROM otp_verification WHERE email = ? AND otp_code = ?
        `;
        db.query(deleteOtpSql, [email, otpCode], (err) => {
            if (err) return res.status(500).send({ error: 'Database error' });

            res.status(200).send({ message: 'OTP verified successfully' });
        });
    });
});

// Route to get all sensor readings
app.get('/api/sensor-readings', (req, res) => {
    const selectSql = 'SELECT * FROM sensor_readings';
    db.query(selectSql, (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Database error' });
        }
        res.status(200).send(results);
    });
});

// Start the server
app.listen(3001, () => {
    console.log('Server running on port 3001');
});
