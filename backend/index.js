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
        const num = parseInt(lastId.substring(prefix.length)) + 1; // Extract number and increment
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


// routes to add programs 

app.post('/programs', async (req, res) => {
    const { program_name } = req.body;
  
    try {
      const program_id = await generateNextId("program_id", "PRG", "programs");
      const created_at = new Date().toISOString().split("T")[0]; // Get current date (YYYY-MM-DD)
  
      const query = `INSERT INTO programs (program_id, program_name, created_at) VALUES ($1, $2, $3) RETURNING *`;
      const result = await db.query(query, [program_id, program_name, created_at]);
  
      res.status(201).json({ message: "Program added successfully", program: result.rows[0] });
    } catch (error) {
      console.error("Error adding program:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
});

//test with
//{"program_name": "SE"}



// get program
app.get('/programs', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM programs ORDER BY created_at DESC');
        res.status(200).json({ programs: result.rows });
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
});

//post leavetypes
app.post('/leave-types', async (req, res) => {
    const { faculty_type, leave_type, number_of_leaves, reset_frequency, reset_date } = req.body;

    // Validate required fields
    if (!faculty_type || !leave_type || !number_of_leaves) {
        return res.status(400).json({ error: "faculty_type, leave_type, and number_of_leaves are required." });
    }

    try {
        const leave_type_id = await generateNextId("leave_type_id", "LVT", "leavetypes");
        const created_at = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // Ensure reset_date is either NULL or in the correct format
        const formattedResetDate = reset_date ? new Date(reset_date).toISOString().split("T")[0] : null;

        const query = `
            INSERT INTO leavetypes (leave_type_id, faculty_type, leave_type, number_of_leaves, reset_frequency, reset_date, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

        const values = [leave_type_id, faculty_type, leave_type, number_of_leaves, reset_frequency, formattedResetDate, created_at];

        const result = await db.query(query, values);

        res.status(201).json({ message: "Leave type added successfully", leaveType: result.rows[0] });
    } catch (error) {
        console.error("Error adding leave type:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//test wit
// { 
//     "faculty_type": "Non teaching",
//     "leave_type": "Duty Leave",
//     "number_of_leaves": 10,
//     "reset_frequency": 1,
//     "reset_date": "2025-01-01"
// }






//get leave type
// 🔹 Get All Leave Types
app.get('/leave-types', async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM "leavetypes" ORDER BY created_at DESC`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch leave types' });
    }
});


// to get all employee detqils
app.get('/employees', async (req, res) => {
    try {
        // Fetch all employees with email and date of joining
        const employeesQuery = `
            SELECT e.employees_id, e.name, c.email, e.date_of_joining
            FROM employees e
            JOIN credentials c ON e.employees_id = c.employee_id
        `;
        const employeesResult = await db.query(employeesQuery);

        if (employeesResult.rows.length === 0) {
            return res.status(404).json({ error: "No employees found." });
        }

        const employees = [];

        // Fetch all addresses and phones in one query to optimize performance
        const [addressesResult, phonesResult] = await Promise.all([
            db.query(`SELECT employee_id, address FROM "employeeaddresses"`),
            db.query(`SELECT employee_id, phone FROM employee_phones`)
        ]);

        // Create a map for quick lookup
        const addressMap = addressesResult.rows.reduce((acc, row) => {
            acc[row.employee_id] = acc[row.employee_id] || [];
            acc[row.employee_id].push(row.address);
            return acc;
        }, {});

        const phoneMap = phonesResult.rows.reduce((acc, row) => {
            acc[row.employee_id] = acc[row.employee_id] || [];
            acc[row.employee_id].push(row.phone);
            return acc;
        }, {});

        // Construct the response
        employeesResult.rows.forEach(employee => {
            employees.push({
                employees_id: employee.employees_id,
                name: employee.name,
                email: employee.email,
                date_of_joining: employee.date_of_joining,
                addresses: addressMap[employee.employees_id] || [],
                phones: phoneMap[employee.employees_id] || []
            });
        });

        res.status(200).json({ employees });

    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// get http://localhost:3000/employees


// to get an employee details
app.get('/employee/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    try {
        // Fetch employee details including date of joining
        const employeeQuery = `
            SELECT e.employees_id, e.name, c.email, e.date_of_joining
            FROM employees e
            JOIN credentials c ON e.employees_id = c.employee_id
            WHERE e.employees_id = $1
        `;
        const employeeResult = await db.query(employeeQuery, [employee_id]);

        if (employeeResult.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found." });
        }

        // Execute multiple queries concurrently
        const [addressResult, phoneResult] = await Promise.all([
            db.query(`SELECT address FROM "employeeaddresses" WHERE employee_id = $1`, [employee_id]),
            db.query(`SELECT phone FROM employee_phones WHERE employee_id = $1`, [employee_id])
        ]);

        // Construct response
        const employee = {
            employees_id: employeeResult.rows[0].employees_id,
            name: employeeResult.rows[0].name,
            email: employeeResult.rows[0].email,
            date_of_joining: employeeResult.rows[0].date_of_joining,
            addresses: addressResult.rows.length > 0 ? addressResult.rows.map(row => row.address) : [],
            phones: phoneResult.rows.length > 0 ? phoneResult.rows.map(row => row.phone) : []
        };

        res.status(200).json({ employee });

    } catch (error) {
        console.error("Error fetching employee details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//http://localhost:3000/employee/EMP0001


// update name
app.post('/employee/update-name', async (req, res) => {
    const { employee_id, name } = req.body;

    if (!employee_id || !name) {
        return res.status(400).json({ error: "Employee ID and Name are required." });
    }

    try {
        await db.query(`UPDATE employees SET name = $1 WHERE employees_id = $2`, [name, employee_id]);

        res.status(200).json({ message: "Name updated successfully." });

    } catch (error) {
        console.error("Error updating name:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//{ "employee_id": "EMP0001", "name": "Nishita Updated" }




// add address
app.post('/employee/add-address', async (req, res) => {
    const { employee_id, address } = req.body;

    if (!employee_id || !address) {
        return res.status(400).json({ error: "Employee ID and Address are required." });
    }

    try {
        const addressId = await generateNextId("address_id", "ADDR", '"employeeaddresses"');

        await db.query(
            `INSERT INTO "employeeaddresses" (address_id, employee_id, address, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [addressId, employee_id, address]
        );

        res.status(200).json({ message: "Address added successfully." });

    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//{ "employee_id": "EMP0001", "address": "123 New Street, NY" }


//add phone number
app.post('/employee/add-phone', async (req, res) => {
    const { employee_id, phone } = req.body;

    if (!employee_id || !phone) {
        return res.status(400).json({ error: "Employee ID and Phone are required." });
    }

    try {
        const phoneId = await generateNextId("phone_id", "PHN", "employee_phones");

        await db.query(
            `INSERT INTO employee_phones (phone_id, employee_id, phone, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [phoneId, employee_id, phone]
        );

        res.status(200).json({ message: "Phone added successfully." });

    } catch (error) {
        console.error("Error adding phone:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//{ "employee_id": "EMP0001", "phone": "9876543210" }


//apply leave
app.post('/apply-leave', async (req, res) => {
    const { employee_id, start_date, end_date, leave_type, reason } = req.body;

    // Validate required fields
    if (!employee_id || !start_date || !end_date || !leave_type || !reason) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if the employee exists
        const employeeCheckQuery = `SELECT employees_id FROM employees WHERE employees_id = $1`;
        const employeeCheck = await db.query(employeeCheckQuery, [employee_id]);

        if (employeeCheck.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found." });
        }

        // Generate new Leave ID using your function
        const leaveID = await generateNextId('leave_id', 'LID', 'public.leave');

        // Insert leave request
        const insertLeaveQuery = `
            INSERT INTO public.leave (
                leave_id, employee_id, start_date, end_date, leave_type, 
                status, reason, program_director_status, dean_status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, 'pending', 'pending', CURRENT_DATE, CURRENT_DATE)
            RETURNING leave_id
        `;
        const leaveResult = await db.query(insertLeaveQuery, [leaveID, employee_id, start_date, end_date, leave_type, reason]);

        res.status(201).json({
            message: "Leave request submitted successfully.",
            leave_id: leaveResult.rows[0].leave_id,
            status: "Pending"
        });

    } catch (error) {
        console.error("Error applying for leave:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// test
// {
//     "employee_id": "EMP0001",
//     "start_date": "2025-03-20",
//     "end_date": "2025-03-22",
//     "leave_type": "Sick Leave",
//     "reason": "Medical emergency"
//   }


// to get a single leave id details
app.get('/leave/:leave_id', async (req, res) => {
    const { leave_id } = req.params;

    try {
        // Fetch leave details along with employee name and email
        const leaveQuery = `
            SELECT l.leave_id, l.employee_id, e.name, c.email, 
                   l.start_date, l.end_date, l.leave_type, l.status, 
                   l.reason, l.program_director_status, l.dean_status, 
                   l.created_at, l.updated_at
            FROM public.leave l
            JOIN employees e ON l.employee_id = e.employees_id
            JOIN credentials c ON e.employees_id = c.employee_id
            WHERE l.leave_id = $1
        `;

        const leaveResult = await db.query(leaveQuery, [leave_id]);

        if (leaveResult.rows.length === 0) {
            return res.status(404).json({ error: "Leave request not found." });
        }

        res.status(200).json({ leave: leaveResult.rows[0] });

    } catch (error) {
        console.error("Error fetching leave details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//to get all leaves record of a perucular employee
app.get('/employee/:employee_id/leave', async (req, res) => {
    try {
        const { employee_id } = req.params;
        const result = await db.query("SELECT * FROM public.leave WHERE employee_id = $1", [employee_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No leave records found for this employee." });
        }

        res.json(result.rows);  // ✅ Return JSON data
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//to get all leave request
app.get('/leaves', async (req, res) => {
    try {
        const leaveQuery = `
            SELECT l.*, e.name, e.employees_id 
            FROM public.leave l
            JOIN employees e ON l.employee_id = e.employees_id
            ORDER BY l.created_at DESC
        `;

        const leaveResult = await db.query(leaveQuery);

        if (leaveResult.rows.length === 0) {
            return res.status(404).json({ message: "No leave requests found." });
        }

        res.status(200).json({ leaves: leaveResult.rows });
    } catch (error) {
        console.error("Error fetching all leave requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})