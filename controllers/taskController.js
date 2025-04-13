const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = new Task({ title, description, dueDate, user: req.user.id });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Error al crear tarea" });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, search, from, to } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };
    if (from || to) {
      query.dueDate = {};
      if (from) query.dueDate.$gte = new Date(from);
      if (to) query.dueDate.$lte = new Date(to);
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener tareas" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ msg: "Tarea no encontrada" });

    const { title, description, status, dueDate } = req.body;

    if (task.status === "completada") {
      return res.status(400).json({ msg: "No se puede modificar una tarea completada" });
    }

    if (status) {
      if (status === "en progreso" && task.status !== "pendiente") {
        return res.status(400).json({ msg: "Solo se puede pasar a 'en progreso' desde 'pendiente'" });
      }
      if (status === "pendiente") {
        return res.status(400).json({ msg: "No se puede volver a 'pendiente'" });
      }
      if (status === "completada" && task.status !== "en progreso") {
        return res.status(400).json({ msg: "Solo se puede completar desde 'en progreso'" });
      }
      task.status = status;
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Error al actualizar tarea" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ msg: "Tarea no encontrada" });
    if (task.status !== "completada") {
      return res.status(400).json({ msg: "Solo se pueden eliminar tareas completadas" });
    }
    await task.remove();
    res.json({ msg: "Tarea eliminada" });
  } catch (err) {
    res.status(500).json({ msg: "Error al eliminar tarea" });
  }
};