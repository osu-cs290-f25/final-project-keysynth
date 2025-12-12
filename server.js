const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8500;

// Path to the presets JSON file
const PRESET_FILE = path.join(__dirname, 'presets.json');

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load all presets
app.get('/api/presets', (req, res) => {
    try {
        const data = fs.readFileSync(PRESET_FILE, 'utf8');
        const presets = JSON.parse(data);
        res.status(200).json(presets);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load presets' });
    }
});

// Save a new preset
app.post('/api/presets', (req, res) => {
    try {
        const newPreset = req.body;
        const data = fs.readFileSync(PRESET_FILE, 'utf8');
        const presets = JSON.parse(data);
        presets.push(newPreset);
        fs.writeFileSync(PRESET_FILE, JSON.stringify(presets, null, 2));
        res.status(201).json({ message: 'Preset saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save preset' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});