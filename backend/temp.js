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

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

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
  service: 'gmail', // or use your preferred email service
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
    text: `Hello,\n\nYour account has been created successfully. Your password is: ${password}\n\nPlease change it after logging in.\n\nRegards,\nYour Company`, // Email body
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

// Register Employee (by admin)
app.post("/register-employee", async (req, res) => {
  const { name, email, date_of_joining } = req.body;
  const created_at = new Date();
  console.log(req.body)
  const employees_id = await generateNextId('employees_id', 'EMP', 'employees');
  const password = generatePassword();
  console.log(password)

  try {
    await db.query(
      "INSERT INTO employees (employees_id, name, date_of_joining, created_at) VALUES ($1, $2, $3, $4)",
      [employees_id, name, date_of_joining, created_at]
    );

    const credential_id = await generateNextId('credential_id', 'CRD', 'credentials');

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
      } else {
        await db.query(
          "INSERT INTO credentials (credential_id, employee_id, email, password, created_at) VALUES ($1, $2, $3, $4, $5)",
          [credential_id, employees_id, email, hash, created_at]
        );

        // Send email with the generated password
        await sendEmail(email, password);

        res.json({ message: "Employee registered", email, password });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Register Dean (by admin)
app.post("/register-dean", async (req, res) => {
  const { managed_entity_id, email } = req.body;
  const created_at = new Date();
  const password = generatePassword();

  try {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
      } else {

        const role_credential_id = await generateNextId('role_credential_id', 'RCID', 'roleCredentials');

        await db.query(
          `INSERT INTO "roleCredentials" (role_credentials_id, role_type, managed_entity_id, email, password, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [role_credential_id, "dean", managed_entity_id, email, hash, created_at]
        );

        // Send email with the generated password
      //  await sendEmail(email, password);

        res.json({ message: "Dean registered", email, password });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Register Program Director (by admin)
app.post("/register-program-director", async (req, res) => {
  const { managed_entity_id, email } = req.body;
  const created_at = new Date();
  const password = generatePassword();

  try {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
      } else {

        const role_credential_id = await generateNextId('role_credential_id', 'RCID', 'roleCredentials');

        await db.query(
          `INSERT INTO "roleCredentials" (role_credentials_id, role_type, managed_entity_id, email, password, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [role_credential_id, "program director", managed_entity_id, email, hash, created_at]
        );

        // Send email with the generated password
      //  await sendEmail(email, password);

        res.json({ message: "Program Director registered", email, password });
      }
    });
  } catch (err) {
    console.error(err);
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
          query = `SELECT * FROM "roleCredentials" WHERE email = $1 AND role_type = $2`;
          params = [email, type];
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
      "SELECT * FROM credentials WHERE email = $1 UNION SELECT * FROM admins WHERE email = $1 UNION SELECT * FROM roleCredentials WHERE email = $1",
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

app.post("/login", passport.authenticate("local", {
    successRedirect: "/homepage",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
