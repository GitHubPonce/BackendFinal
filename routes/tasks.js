import express from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET todas las tareas del usuario logueado
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).populate('user', 'username');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST nueva tarea
router.post('/', auth, async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  // Verificación de que los datos requeridos estén presentes
  if (!title || !description || !dueDate) {
    return res.status(400).json({ message: 'Faltan campos requeridos: title, description, dueDate' });
  }

  console.log('userId:', req.userId);
  console.log('Tarea:', { title, description, status, dueDate });

  try {
    // Crea la nueva tarea asignándole el userId extraído del token
    const newTask = await Task.create({
      title,
      description,
      status: status || 'pendiente',
      dueDate,
      user: req.userId,
    });
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error al crear la tarea:', err);
    res.status(400).json({ message: err.message });
  }
});

// PUT actualizar tarea
router.put('/:id', async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  // Asegúrate de que los campos requeridos estén presentes
  if (!title || !description || !dueDate) {
    return res.status(400).json({ message: 'Faltan campos requeridos: title, description, dueDate' });
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, dueDate },
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE eliminar tarea
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
