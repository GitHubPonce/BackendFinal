import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Verificar si el usuario o el email ya existen
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: 'El usuario o el email ya están registrados' });
  }

  try {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error });
  }
});

// Login de usuario (modificado para manejar email)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Si todo es correcto, generar el token
    const token = jwt.sign({ userId: user._id }, 'mi_secreto', { expiresIn: '1h' });
    
    // Enviar el token como respuesta
    res.json({ token });

  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ message: 'Error en el proceso de login', error });
  }
});

export default router;
