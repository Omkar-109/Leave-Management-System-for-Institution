import express from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from 'multer';

const upload = multer(); // memory storage by default


const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend's port
  credentials: true
}));


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24-hour expiration
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

// Function to Generate Next ID
const generateNextId = async (column, prefix, table) => {
  try {
      // Query to get the latest ID from the specified column of the specified table
      const result = await db.query(`SELECT ${column} FROM ${table} ORDER BY ${column} DESC LIMIT 1`);
    
      if (result.rows.length === 0) {
          // If no records exist, return the first ID with the specified prefix and padding
          return `${prefix}0001`;
      }

      // Extract the last ID from the result and increment the number part
      const lastId = result.rows[0][column];
      const num = parseInt(lastId.substring(prefix.length)) + 1; // Extract number and increment
      return `${prefix}${num.toString().padStart(4, '0')}`; // Format the ID with leading zeros
  } catch (error) {
      console.error(`Error generating ID for ${table}:`, error.message);
      throw new Error('ID generation failed');
  }
};

// Configure the email transport using your email service (like Gmail or an SMTP server)
const transporter = nodemailer.createTransport({
  service: 'gmail', // email service
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USERNAME, // Your email username
    pass: process.env.EMAIL_PASSWORD, // Your email password (or App Password if 2FA is enabled)
  },
});

// Function to send email
const sendEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // Sender email
    to: email, // Recipient email
    subject: "Your Account Details", // Subject of the email
    text: `Hello,\n\nYour account for leave management system has been created successfully. Your password is: ${password}\n\nPlease change it after logging in.\n\nRegards,\nYour Company`, // Email body
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Generate a random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// // Register Employee (by admin)
// app.post('/register-employee', async (req, res) => {
//   const { name, email, date_of_joining } = req.body;
//   const created_at = new Date();
//   console.log(req.body)
//   const employees_id = await generateNextId('employees_id', 'EMP', 'employees');
//   const password = generatePassword();
//   console.log(password)

//   try {
//     await db.query(
//       "INSERT INTO employees (employees_id, name, date_of_joining, created_at) VALUES ($1, $2, $3, $4)",
//       [employees_id, name, date_of_joining, created_at]
//     );

//     const credential_id = await generateNextId('credential_id', 'CRD', 'credentials');

//     bcrypt.hash(password, saltRounds, async (err, hash) => {
//       if (err) {
//         console.error("Error hashing password:", err);
//       } else {
//         await db.query(
//           "INSERT INTO credentials (credential_id, employee_id, email, password, created_at) VALUES ($1, $2, $3, $4, $5)",
//           [credential_id, employees_id, email, hash, created_at]
//         );

//         // Send email with the generated password
//         //await sendEmail(email, password);

//         res.json({ message: "Employee registered", email, password });
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });


app.post('/register-employee', async (req, res) => {
  const { name, email, date_of_joining, program_id } = req.body;
  const created_at = new Date();
  const employees_id = await generateNextId('employees_id', 'EMP', 'employees');
  const password = generatePassword();
  const credential_id = await generateNextId('credential_id', 'CRD', 'credentials');

  try {
    await db.query(
      "INSERT INTO employees (employees_id, name, date_of_joining, created_at) VALUES ($1, $2, $3, $4)",
      [employees_id, name, date_of_joining, created_at]
    );

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) return res.status(500).json({ error: 'Error hashing password' });

      await db.query(
        "INSERT INTO credentials (credential_id, employee_id, email, password, created_at) VALUES ($1, $2, $3, $4, $5)",
        [credential_id, employees_id, email, hash, created_at]
      );

      // 🔹 Insert into employee_program
      await db.query(
        "INSERT INTO employee_program (employees_id, program_id, created_at) VALUES ($1, $2, $3)",
        [employees_id, program_id, created_at]
      );

      // 🔹 Fetch leave types and create leave records
      const leaveTypes = await db.query('SELECT * FROM "leavetypes"');
      for (const type of leaveTypes.rows) {
        const record_id = await generateNextId('record_id', 'LVR', 'leaverecords');
        await db.query(
          `INSERT INTO "leaverecords" 
          (record_id, employee_id, leave_type, leaves_taken, leaves_added, balance_adjustment, leaves_remaining, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            record_id,
            employees_id,
            type.leave_type,
            0, // taken
            type.number_of_leaves, // added
            0, // balance adjustment
            type.number_of_leaves, // remaining
            created_at
          ]
        );
      }

      // Success
      res.json({ message: "Employee registered", email, password });
    });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: "Registration failed" });
  }
});







// Register Dean (by admin)
app.post("/register-dean", async (req, res) => {
  const { managed_entity_id, email } = req.body;
  const created_at = new Date();
  const password = generatePassword();

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const role_credential_id = await generateNextId('role_credentials_id', 'RCID', 'rolecredentials');


    await db.query(
      `INSERT INTO "rolecredentials" (role_credentials_id, role_type, managed_entity_id, email, password, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [role_credential_id, "dean", managed_entity_id, email, hash, created_at]
    );

    // Send email with the generated password
    // await sendEmail(email, password);

    res.json({ message: "Dean registered", email, password });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});


// Register Program Director (by admin)
app.post("/register-program-director", async (req, res) => {
  const { managed_entity_id, email } = req.body;
  const created_at = new Date();
  const password = generatePassword();

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const role_credential_id = await generateNextId('role_credentials_id', 'RCID', 'rolecredentials');

    await db.query(
      `INSERT INTO "rolecredentials" (role_credentials_id, role_type, managed_entity_id, email, password, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [role_credential_id, "program director", managed_entity_id, email, hash, created_at]
    );

    // Send email with the generated password
    // await sendEmail(email, password);

    res.json({ message: "Program Director registered", email, password });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});


// First-time employee registration
app.post("/register", async (req, res) => {
  const { email, password, newpassword } = req.body;
  try {
    // Step 1: Retrieve the user from the database by email
    const result = await db.query(
      "SELECT * FROM credentials WHERE email = $1",
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Step 2: Check if the current password matches the one in the database
      bcrypt.compare(password, user.password, async (err, valid) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).json({ error: "Error comparing passwords" });
        }

        if (valid) {
          console.log(newpassword)
          // Step 3: If passwords match, hash the new password
          bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
            if (err) {
              console.error("Error hashing new password:", err);
              return res.status(500).json({ error: "Error hashing new password" });
            }

            // Step 4: Update the password in the database
            await db.query(
              "UPDATE credentials SET password = $1 WHERE email = $2",
              [hash, email]
            );
            
            // Step 5: Respond with success message
            res.json({ message: "Password updated successfully" });
          });
        } else {
          // If the current password is incorrect
          res.status(400).json({ error: "Incorrect current password" });
        }
      });
    } else {
      // If the user does not exist
      res.status(400).json({ error: "Employee not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Password update failed" });
  }
});


// Login - Handles different user types
passport.use(
  new Strategy({ usernameField: "email", passReqToCallback: true }, async function (req, email, password, cb) {
    const { type } = req.body;

    try {
      let query, params;
      switch (type) {
        case "Dean":
        case "Program Director":
          query = `SELECT * FROM rolecredentials WHERE email = $1 AND role_type = $2`;
          params = [email, type.toLowerCase()];
          break;
        case "Office Admin":
          query = `SELECT * FROM admins WHERE email = $1`;
          params = [email];
          break;
        default:
          query = "SELECT * FROM credentials WHERE email = $1";
          params = [email];
      }

      const result = await db.query(query, params);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        bcrypt.compare(password, user.password, (err, valid) => {
          if (err) return cb(err);
          return valid ? cb(null, user) : cb(null, false);
        });
      } else {
        return cb(null, false);
      }
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.email);
});

passport.deserializeUser(async (email, cb) => {
  try {
    const result = await db.query(
      "SELECT email, password, 'employee' AS role_type FROM credentials WHERE email = $1 UNION SELECT email, password, 'office admin' AS role_type FROM admins WHERE email = $1 UNION SELECT email, password, role_type FROM rolecredentials WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0) {
      cb(null, result.rows[0]);
    } else {
      cb(null, false);
    }
  } catch (err) {
    cb(err);
  }
});


app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});



app.post("/login", (req, res, next) => {
    console.log(req.body)
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Login successful", user });
    });
  })(req, res, next);
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
//test
//{"program_name": "MCA"}



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

// DELETE /programs/:id
app.delete("/programs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM programs WHERE program_id = $1`, [id]);
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /programs/:id
app.put("/programs/:id", async (req, res) => {
  const { id } = req.params;
  const { program_name } = req.body;

  try {
    const updated = await db.query(
      `UPDATE programs SET program_name = $1 WHERE program_id = $2 RETURNING *`,
      [program_name, id]
    );
    res.json({ message: "Program updated", program: updated.rows[0] });
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: "Internal Server Error" });
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


// to get all employee details
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
console.log(req.params);
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


// apply leave with optional file
app.post('/apply-leave', upload.single('pdf'), async (req, res) => {
  const { employee_id, start_date, end_date, leave_type, reason } = req.body;
  const file = req.file;

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

    // Generate new Leave ID
    const leaveID = await generateNextId('leave_id', 'LID', 'public.leave');

    // Insert leave request with optional file
    const insertLeaveQuery = `
      INSERT INTO public.leave (
        leave_id, employee_id, start_date, end_date, leave_type, 
        status, reason, program_director_status, dean_status, 
        supporting_document, document_name, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, 'pending', 'pending', $7, $8, CURRENT_DATE, CURRENT_DATE)
      RETURNING leave_id
    `;

    const supporting_document = file ? file.buffer : null;
    const document_name = file ? file.originalname : null;

    const leaveResult = await db.query(insertLeaveQuery, [
      leaveID,
      employee_id,
      start_date,
      end_date,
      leave_type,
      reason,
      supporting_document,
      document_name
    ]);

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

//to get all leaves record of a perticular employee
app.get('/employee/:employee_id/leave', async (req, res) => {
  try {
      const { employee_id } = req.params;
      const result = await db.query("SELECT * FROM public.leave WHERE employee_id = $1", [employee_id]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: "No leave records found for this employee." });
      }

      res.json(result.rows);  
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


// GET all leave applications approved by PD but pending for Dean
app.get('/leave/pending/dean', async (req, res) => {
  try {
      const query = `
          SELECT * FROM leave 
          WHERE program_director_status = 'approved' 
            AND dean_status = 'pending'
      `;
      const result = await db.query(query);
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error fetching pending leave applications for Dean:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT: Update leave status by Dean or PD
app.put('/leave/update-status', async (req, res) => {
  const { leave_id, role, status } = req.body;

  if (!leave_id || !role || !status) {
    return res.status(400).json({ message: 'leave_id, role, and status are required.' });
  }

  try {
    let columnToUpdate = null;
    let query = '';
    let values = [];

    if (role === 'dean') {
      columnToUpdate = 'dean_status';

      // Update dean_status and main status column if status is 'approved'
      if (status.toLowerCase() === 'approved') {
        query = `
          UPDATE public.leave
          SET ${columnToUpdate} = $1,
              status = $2,
              updated_at = CURRENT_DATE
          WHERE leave_id = $3
        `;
        values = [status, 'approved', leave_id];
      } else if (status.toLowerCase() === 'rejected') {
        query = `
          UPDATE public.leave
          SET ${columnToUpdate} = $1,
              status = 'rejected',
              updated_at = CURRENT_DATE
          WHERE leave_id = $2
        `;
        values = [status, leave_id];
       } else {
        // Just update dean_status
        query = `
          UPDATE public.leave
          SET ${columnToUpdate} = $1,
              updated_at = CURRENT_DATE
          WHERE leave_id = $2
        `;
        values = [status, leave_id];
      }

    } else if (role === 'program director') {
      columnToUpdate = 'program_director_status';

      if (status.toLowerCase() === 'rejected') {
        query = `
          UPDATE public.leave
          SET ${columnToUpdate} = $1,
              status = 'rejected',
              updated_at = CURRENT_DATE
          WHERE leave_id = $2
        `;
        values = [status, leave_id];
      } else {
      query = `
        UPDATE public.leave
        SET ${columnToUpdate} = $1,
            updated_at = CURRENT_DATE
        WHERE leave_id = $2
      `;
      values = [status, leave_id];}

    } else {
      return res.status(400).json({ message: 'Invalid role. Use "dean" or "program director".' });
    }

    await db.query(query, values);

    return res.status(200).json({ message: `${role}'s status updated to ${status}` });

  } catch (error) {
    console.error('Error updating leave status:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.get('/leave/pending', async (req, res) => {
  try {
      const result = await db.query(`
          SELECT *
          FROM public.leave
          WHERE program_director_status ILIKE 'pending'
             OR dean_status ILIKE 'pending'
             OR status ILIKE 'pending'
          ORDER BY created_at DESC
      `);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'No pending leave applications found.' });
      }

      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error fetching pending leave applications:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/admin/stats', async (req, res) => {
  try {
    const [employees, deans, pd, programs, leaves] = await Promise.all([
      db.query("SELECT COUNT(*) FROM employees"),
      db.query("SELECT COUNT(*) FROM rolecredentials WHERE role_type IN ('dean')"),
      db.query("SELECT COUNT(*) FROM rolecredentials WHERE role_type IN ('program director')"),
      db.query("SELECT COUNT(*) FROM programs"),
      db.query("SELECT COUNT(*) FROM leave"),
    ]);

    res.json({
      employees: employees.rows[0].count,
      deans: deans.rows[0].count,
      pd: pd.rows[0].count,
      programs: programs.rows[0].count,
      leaves: leaves.rows[0].count,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//manual register of admins
app.post("/register-admin", async (req, res) => {
  const { name, email, password } = req.body;
  const created_at = new Date()

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Generate new admin ID
    const admin_id = await generateNextId("admin_id", "ADM", "admins");

    // 3. Insert into database
    await db.query(
      `INSERT INTO admins (admin_id, name, email, password, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [admin_id, name, email, hashedPassword, created_at]
    );

    res.json({ message: "Admin registered successfully", admin_id });
  } catch (err) {
    console.error("Error registering admin:", err);
    res.status(500).json({ error: "Admin registration failed" });
  }
});

//test with
/*
{
  "name": "admin1",
  "email": "admin1@gmail.com",
  "password": "admin1"
}
*/

// to get the pdf file uploaded based on leave id
app.get('/leave/:leave_id/document', async (req, res) => {
  const { leave_id } = req.params;

  try {
    const result = await db.query(
      `SELECT supporting_document, document_name FROM public.leave WHERE leave_id = $1`,
      [leave_id]
    );

    if (result.rows.length === 0 || !result.rows[0].supporting_document) {
      return res.status(404).json({ error: "Document not found." });
    }

    const { supporting_document, document_name } = result.rows[0];

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${document_name}"`,
    });

    res.send(supporting_document);
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/leave/update-main-status', async (req, res) => {
  const { leave_id, status } = req.body;

  if (!leave_id || !status) {
    return res.status(400).json({ message: 'leave_id and status are required.' });
  }

  try {
    const query = `
      UPDATE public.leave
      SET status = $1,
          updated_at = CURRENT_DATE
      WHERE leave_id = $2
    `;

    await db.query(query, [status.toLowerCase(), leave_id]);

    return res.status(200).json({
      message: `Leave status updated to '${status}'`,
      leave_id
    });
  } catch (error) {
    console.error('Error updating main leave status:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



///
app.post('/leave-approval', async (req, res) => {
  const {
    leave_id,
    approver_id,
    role,
    action,
    reason,
    note,
    action_date
  } = req.body;

  if (!leave_id || !approver_id || !role) {
    return res.status(400).json({
      message: 'leave_id, approver_id, and role are required.'
    });
  }

  try {
    // Generate workflow_id automatically
    const workflow_id = await generateNextId('workflow_id', 'WF', '"leaveApprovalWorkflow"');

    const insertQuery = `
      INSERT INTO public."leaveApprovalWorkflow" (
        workflow_id,
        leave_id,
        approver_id,
        role,
        action,
        reason,
        note,
        action_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      workflow_id,
      leave_id,
      approver_id,
      role,
      action || null,
      reason || null,
      note || null,
      action_date || new Date().toISOString().split('T')[0]
    ];

    await db.query(insertQuery, values);

    return res.status(201).json({ message: 'Leave approval record added successfully.', workflow_id });
  } catch (error) {
    console.error('Error inserting leave approval record:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
