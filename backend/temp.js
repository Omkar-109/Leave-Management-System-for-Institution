import express from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import cors from "cors";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24-hour expiration
  })
);
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/register", async (req, res) => {
  const { employee_type, email, password, employee_id, name } = req.body;

  try {
    let tableName;
    switch (employee_type) {
      case "dean":
      case "program director":
        tableName = "roleCredentials";
        break;
      case "faculty":
        tableName = "credentials";
        break;
      case "office admin":
        tableName = "admins";
        break;
      default:
        return res.status(400).json({ message: "Invalid employee type" });
    }

    const checkResult = await db.query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ message: "Error hashing password" });
      }
      
      let query, values;
      if (tableName === "roleCredentials") {
        query = `INSERT INTO ${tableName} (role_credentials_id, role_type, managed_entity_id, email, password, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *`;
        values = [employee_id, employee_type, employee_id, email, hash];
      } else if (tableName === "credentials") {
        query = `INSERT INTO ${tableName} (credential_id, employee_id, email, password, created_at) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`;
        values = [employee_id, employee_id, email, hash];
      } else if (tableName === "admins") {
        query = `INSERT INTO ${tableName} (admin_id, name, email, password, created_at) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`;
        values = [employee_id, name, email, hash];
      }

      const result = await db.query(query, values);
      res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Login successful", user: req.user });
});

passport.use(
  new Strategy({ usernameField: "email" }, async function verify(email, password, cb) {
    try {
      let user = null;
      const tables = ["admins", "credentials", "roleCredentials"];
      
      for (let table of tables) {
        const result = await db.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
        if (result.rows.length > 0) {
          user = result.rows[0];
          break;
        }
      }

      if (!user) return cb(null, false);

      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) return cb(err);
        if (valid) return cb(null, user);
        return cb(null, false);
      });
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
