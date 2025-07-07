const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /generate API: Only answers sports-related questions
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  // Optional: keyword check to restrict to sports topics
  const sportsKeywords = ['football', 'cricket', 'basketball', 'tennis', 'fifa', 'olympics', 'nba', 'world cup', 'hockey', 'player', 'tournament'];
  const isSportsRelated = sportsKeywords.some(keyword =>
    prompt.toLowerCase().includes(keyword)
  );

  if (!isSportsRelated) {
    return res.status(400).send({
      error: 'Only sports-related questions are allowed.',
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.send({ answer: text });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).send({ error: 'Failed to get response from Gemini.' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
