import express from 'express';
import db from './db.js';
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";


const app = express()

const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// Function to Generate Next ID
const generateNextId = async (column, prefix, table) => {
    try {
        const result = await db.query(`SELECT ${column} FROM ${table} ORDER BY ${column} DESC LIMIT 1`);

        if (result.rows.length === 0) {
            return `${prefix}0001`;
        }

        const lastId = result.rows[0][column]; // Get last ID
        const num = parseInt(lastId.substring(1)) + 1; // Extract number and increment
        return `${prefix}${num.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error(`Error generating ID for ${table}:`, error.message);
        throw new Error('ID generation failed');
    }
};

// Generate Employee (Use Default Values)
// take all fields of employee details from form input
app.post('/generate-employee', async (req, res) => {
    const { email , password } = req.body;
    const defaultPassword = "Welcome@123"; // Default password
    const defaultName = "Pending Registration"; // Placeholder name
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    try {
        const employee_id = await generateNextId('employees_id', 'E', 'employees');
        const credential_id = await generateNextId('credential_id', 'C', 'credentials');

        // Check if email already exists
        const checkEmail = await db.query(`SELECT * FROM employees WHERE email = $1`, [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Insert into employees table (Provide default values)
        const empResult = await db.query(
            `INSERT INTO employees (employees_id, name, email, password, date_of_joining, created_at)
            VALUES ($1, $2, $3, $4, $5, $5) RETURNING *`,
            [employee_id, defaultName, email, defaultPassword, currentDate]
        );

        // Insert into credentials table
        await db.query(
            `INSERT INTO credentials (credential_id, employee_id, email, password, created_at)
            VALUES ($1, $2, $3, $4, NOW())`,
            [credential_id, employee_id, email, defaultPassword]
        );

        res.status(201).json({
            message: 'Employee created successfully. Use provided email and default password to register.',
            employee: empResult.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate employee', details: error.message });
    }
});

// 🔹 Register Employee (Update Name + Date of Joining)
app.post('/register', async (req, res) => {
    const { email, password, name, date_of_joining } = req.body;  

    try {
        // Check if employee exists
        const empResult = await db.query(`SELECT * FROM employees WHERE email = $1`, [email]);
        if (empResult.rows.length === 0) {
            return res.status(400).json({ error: 'Employee with this email does not exist' });
        }

        const employee = empResult.rows[0];

        // Check if entered password matches the one stored in the credentials table
        const credResult = await db.query(`SELECT * FROM credentials WHERE email = $1`, [email]);
        if (credResult.rows.length === 0 || credResult.rows[0].password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update name & date_of_joining in employees table
        await db.query(
            `UPDATE employees SET name = $1, date_of_joining = $2 WHERE email = $3`,
            [name, date_of_joining, email]
        );

        res.status(201).json({ message: 'Registration successful. Name and Date of Joining updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 🔹 Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists in credentials table
        const result = await db.query(`SELECT * FROM credentials WHERE email = $1`, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare passwords
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});


app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})