const mysql = require('mysql');
const fs = require('fs');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'semenggoh' // Replace with your database name
});

// Function to back up the database
function backupDatabase() {
    connection.query('SHOW TABLES', (error, tables) => {
        if (error) throw error;

        const backupData = {};
        let tableCount = 0;

        tables.forEach((table) => {
            const tableName = table[`Tables_in_${connection.config.database}`];
            connection.query(`SELECT * FROM ${tableName}`, (error, results) => {
                if (error) throw error;

                backupData[tableName] = results;

                tableCount++;
                if (tableCount === tables.length) {
                    // Overwrite the previous backup file
                    fs.writeFileSync('backup.json', JSON.stringify(backupData, null, 2)); 
                    console.log('MySQL Backup successful! Overwritten backup.json');
                }
            });
        });
    });
}

// Connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');

    // Set the interval for the backup (e.g., every 30 seconds)
    setInterval(backupDatabase, 30000);
});
