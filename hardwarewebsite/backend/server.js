
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let latestGPS = { latitude: 0, longitude: 0 };
let latestIR = { ir1: 0, ir2: 0 };

// Store button press data
let currentStop = 0;
let forward = true; // Start moving forward

// ✅ Add this GET route to fix the 404 error
app.get('/button', (req, res) => {
    res.json({ currentStop, forward });
});

// Handle button press (POST request)
app.post('/button', (req, res) => {
    if (forward) {
        currentStop++;
        if (currentStop > 12) {
            forward = false;
            currentStop = 12;
        }
    } else {
        currentStop--;
        if (currentStop < 0) {
            forward = true;
            currentStop = 0;
        }
    }

    console.log(`Current Stop: ${currentStop}, Direction: ${forward ? "Forward" : "Reverse"}`);
    res.json({ currentStop, forward });
});

// Handle IR sensor data
app.post('/ir', (req, res) => {
    latestIR = req.body;
    console.log(`IR Sensor 1: ${latestIR.ir1}, IR Sensor 2: ${latestIR.ir2}`);
    res.json(latestIR);
});

app.get('/ir', (req, res) => {
    res.json(latestIR);
});

// Handle GPS data
app.post('/gps', (req, res) => {
    latestGPS = req.body;
    console.log(`Received GPS Data: Latitude = ${latestGPS.latitude}, Longitude = ${latestGPS.longitude}`);
    res.json(latestGPS);
});

app.get('/gps', (req, res) => {
    res.json(latestGPS);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

