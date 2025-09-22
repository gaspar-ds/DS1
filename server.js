// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: '127.0.0.1',
  user:   'root',
  password: 'admin', // pon la contraseña correcta aquí
  database: 'ds1_login',
  port: 3306    // o el puerto correcto
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
const mailUpload = multer({ dest: 'uploads/' });

// Mejoras de seguridad:
// - Validación de usuario y contraseña (longitud mínima, caracteres válidos)
// - Prevención de SQL Injection (ya se usa ? en queries, pero se refuerza)
// - Limitar intentos de login (básico en memoria)
// - No revelar detalles en mensajes de error
// - Sanitización básica

const rateLimit = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 10 * 60 * 1000; // 10 minutos

function sanitize(input) {
  return String(input).replace(/[<>'"]/g, '');
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{4,20}$/.test(username);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 64;
}

// Login seguro
app.post('/login', (req, res) => {
  const ip = req.ip;
  rateLimit[ip] = rateLimit[ip] || { count: 0, last: Date.now(), blockedUntil: 0 };

  if (rateLimit[ip].blockedUntil > Date.now()) {
    return res.status(429).send('Demasiados intentos. Intenta más tarde.');
  }

  const { username, password } = req.body;
  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send('Datos inválidos');
  }

  db.query('SELECT * FROM users WHERE username = ?', [sanitize(username)], (err, results) => {
    if (err) return res.status(500).send('Error interno');
    if (results.length === 0) {
      rateLimit[ip].count++;
      if (rateLimit[ip].count >= MAX_ATTEMPTS) {
        rateLimit[ip].blockedUntil = Date.now() + BLOCK_TIME;
        rateLimit[ip].count = 0;
      }
      return res.status(401).send('Usuario o contraseña incorrectos');
    }
    const user = results[0];
    if (bcrypt.compareSync(password, user.password)) {
      rateLimit[ip].count = 0;
      res.send('Login exitoso');
    } else {
      rateLimit[ip].count++;
      if (rateLimit[ip].count >= MAX_ATTEMPTS) {
        rateLimit[ip].blockedUntil = Date.now() + BLOCK_TIME;
        rateLimit[ip].count = 0;
      }
      res.status(401).send('Usuario o contraseña incorrectos');
    }
  });
});

// Registro seguro
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Faltan datos');
  const hash = bcrypt.hashSync(password, 12);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('El usuario ya existe');
      return res.status(500).send('Error en el servidor');
    }
    res.send('Cuenta creada exitosamente');
  });
});

// Cambiar nombre de usuario
app.post('/change-username', (req, res) => {
  const { username, newUsername } = req.body;
  db.query('UPDATE users SET username = ? WHERE username = ?', [newUsername, username], (err, result) => {
    if (err) return res.status(500).send('Error');
    res.send('OK');
  });
});

// Subir imagen de perfil
app.post('/upload-profile-pic', upload.single('profilePic'), (req, res) => {
  const username = req.body.username;
  if (!req.file) return res.status(400).send('No se subió ninguna imagen');
  const imgUrl = `/uploads/${req.file.filename}`;
  db.query('UPDATE users SET profile_pic = ? WHERE username = ?', [imgUrl, username], (err, result) => {
    if (err) return res.status(500).send('Error al actualizar imagen');
    res.json({ url: imgUrl });
  });
});

app.post('/send-mail', mailUpload.array('attachments'), async (req, res) => {
  const { from, subject, body } = req.body;
  const files = req.files || [];
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fackyhd14@gmail.com',
      pass: 'TU_CONTRASEÑA_DE_APP' // Usa una contraseña de aplicación de Gmail
    }
  });
  let mailOptions = {
    from,
    to: 'fackyhd14@gmail.com',
    subject,
    text: body,
    attachments: files.map(f => ({
      filename: f.originalname,
      path: f.path
    }))
  };
  try {
    await transporter.sendMail(mailOptions);
    res.send('Email enviado correctamente');
  } catch (err) {
    res.status(500).send('Error al enviar email');
  }
});

app.get('/', (req, res) => {
  res.send('Servidor backend DS1 funcionando');
});

app.listen(3001, () => console.log('Servidor corriendo en puerto 3001'));

// Base de datos y tabla (ejecutar una vez)
// CREATE DATABASE IF NOT EXISTS ds1_login;
// USE ds1_login;

// CREATE TABLE IF NOT EXISTS users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   username VARCHAR(50) NOT NULL UNIQUE,
//   password VARCHAR(255) NOT NULL
// );

// Ejecuta esto en una terminal Node.js
// const bcrypt = require('bcryptjs');
// bcrypt.hashSync('1234', 12);