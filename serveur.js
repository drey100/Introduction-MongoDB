require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

// Middleware JSON
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/taskDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur de connexion", err));

// Modèle de la tâche avec un id personnalisé
const taskSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String },
  completed: { type: Boolean }
});

const Task = mongoose.model("Task", taskSchema);

// Route principale
app.get("/", (req, res) => {
  res.send({ message: "Bienvenue sur API-Tanguy!" });
});

// Création de tâche avec génération automatique d'ID
app.post("/tasks", async (req, res) => {
  try {
    // Récupérer la dernière tâche pour obtenir le dernier ID
    const lastTask = await Task.findOne().sort({ id: -1 });

    // Calcul du nouvel ID
    const newId = lastTask ? lastTask.id + 1 : 1;

    // Création de la tâche
    const newTask = new Task({ id: newId, title: req.body.title, completed: req.body.completed });

    // Sauvegarde dans la base de données
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: "Erreur serveur", error });
  }
});

// Récupération des tâches
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Récupération d'une tâche par ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ id: parseInt(req.params.id) });

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Mise à jour d'une tâche
app.put("/tasks/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { title, completed },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Suppression d'une tâche
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ id: parseInt(req.params.id) });

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
