// routes/groupFlashcards.js
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_DIR = path.join(__dirname, "..", "data");

// Helper to read or create JSON file
async function readOrCreateJsonFile(filepath, defaultData = { cards: [] }) {
  try {
    const data = await fs.readFile(filepath, "utf8");
    return JSON.parse(data);
  } catch {
    await fs.writeFile(filepath, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }
}

// Helper to write JSON file
async function writeJsonFile(filepath, data) {
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf8");
}

// ✅ GET: Fetch all flashcards for a specific room
router.get("/:roomId/flashcards", async (req, res) => {
  try {
    const { roomId } = req.params;
    const filePath = path.join(DATA_DIR, `room_${roomId}_flashcards.json`);
    const data = await readOrCreateJsonFile(filePath);
    res.json(data);
  } catch (err) {
    console.error("Get room flashcards error:", err);
    res.status(500).json({ error: "Could not load room flashcards" });
  }
});

// ✅ POST: Add a flashcard to a specific room
router.post("/:roomId/flashcards/add", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { question, answer, tags = [], difficulty = "easy" } = req.body || {};

    if (!question || !answer) {
      return res.status(400).json({ error: "question and answer required" });
    }

    const filePath = path.join(DATA_DIR, `room_${roomId}_flashcards.json`);
    const data = await readOrCreateJsonFile(filePath);

    const card = {
      id: `room_${roomId}_${Date.now()}`,
      question,
      answer,
      tags,
      difficulty,
      createdAt: new Date().toISOString(),
      lastReviewed: null,
      nextReviewDate: null
    };

    data.cards.push(card);
    await writeJsonFile(filePath, data);

    res.status(201).json({ success: true, card });
  } catch (err) {
    console.error("Add room flashcard error:", err);
    res.status(500).json({ error: "Could not add flashcard to room" });
  }
});

module.exports = router;
