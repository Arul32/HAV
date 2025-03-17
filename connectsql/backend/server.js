const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// MySQL database connection
const db = mysql.createConnection({
    host: "localhost", // Replace with your MySQL host
    user: "root",      // Replace with your MySQL username
    password: "123456",      // Replace with your MySQL password
    database: "bus_system" // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

//s
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    // Insert new user into the database
    const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(insertQuery, [username, email, password], (err, results) => {
        if (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ error: "Failed to create user" });
        }
        res.status(201).json({ message: "User created successfully", username });
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Fetch user from the database
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = results[0];

        // Verify password (plain text comparison)
        if (password !== user.password) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Login successful
        res.json({ message: "Login successful", username: user.username });
    });
});

// Search API: Returns matching stops based on query (case-insensitive)
app.get("/api/stops", (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";

    const sql = `SELECT * FROM stops WHERE LOWER(stopName) LIKE ?`;
    const searchTerm = `%${query}%`;

    db.query(sql, [searchTerm], (err, results) => {
        if (err) {
            console.error("Error fetching stops:", err);
            return res.status(500).json({ error: "Failed to fetch stops" });
        }
        res.json(results);
    });
});


// API to fetch reviews for a specific bus ID
app.get("/api/reviews", (req, res) => {
    const busId = req.query.busId;

    if (!busId) {
        return res.status(400).json({ error: "Bus ID is required" });
    }

    // Fetch reviews for the given bus ID, sorted by created_at in descending order
    const sql = `
        SELECT username, rating, review_text, created_at
        FROM bus_reviews
        WHERE bus_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [busId], (err, results) => {
        if (err) {
            console.error("Error fetching reviews:", err);
            return res.status(500).json({ error: "Failed to fetch reviews" });
        }

        res.json(results);
    });
});

// API to submit a review
app.post("/api/reviews", (req, res) => {
    const { bus_id, username, rating, review_text } = req.body;

    if (!bus_id || !username || !rating || !review_text) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Insert the review into the database
    const sql = `
        INSERT INTO bus_reviews (bus_id, username, rating, review_text)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [bus_id, username, rating, review_text], (err, results) => {
        if (err) {
            console.error("Error submitting review:", err);
            return res.status(500).json({ error: "Failed to submit review" });
        }

        res.json({ message: "Review submitted successfully" });
    });
});

// API to search buses based on 'from', 'to', and 'busNo'
app.get("/api/buses", (req, res) => {
    const { from, to, busNo } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Both 'from' and 'to' parameters are required" });
    }

    let sql = `
    SELECT b.id, b.busNo, b.total_stops, b.trips, b.totaltime, r.stopName, r.village, r.forword, r.reverse, r.latitude, r.longitude
    FROM buses b
    JOIN routes r ON b.busNo = r.busNo
    WHERE r.stopName IN (?, ?)
`;

    if (busNo) {
        sql += ` AND b.busNo LIKE ?`;
    }

    console.log("SQL Query:", sql); // Log the SQL query
    console.log("Query Parameters:", [from, to, `%${busNo}%`]); // Log the query parameters

    db.query(sql, [from, to, `%${busNo}%`], (err, results) => {
        if (err) {
            console.error("Error fetching buses:", err);
            return res.status(500).json({ error: "Failed to fetch buses" });
        }

        console.log("Raw Database Results:", results); // Log the raw results from the database

        const availableBuses = processBusResults(results, from, to);
        console.log("Processed Buses:", availableBuses); // Log the processed buses

        res.json(availableBuses);
    });
});
function processBusResults(results, from, to) {
    const busMap = {};
    const currentTime = new Date(); // Define currentTime here (local time)

    // Group results by busNo
    results.forEach(row => {
        if (!busMap[row.busNo]) {
            busMap[row.busNo] = {
                id: row.id, // Include the bus ID
                busNo: row.busNo,
                total_stops: row.total_stops,
                trips: Array.isArray(row.trips) ? row.trips : row.trips.split(","), // Handle both array and string
                totaltime: row.totaltime, // Include totaltime from the buses table
                route: []
            };
        }
        busMap[row.busNo].route.push({
            stopName: row.stopName,
            village: row.village,
            forword: row.forword,
            reverse: row.reverse,
            latitude: row.latitude,
            longitude: row.longitude
        });
    });

    const availableBuses = [];

    // Process each bus
    Object.values(busMap).forEach(bus => {
        let fromIndex = -1;
        let toIndex = -1;

        // Find indices of 'from' and 'to' stops
        bus.route.forEach((stop, index) => {
            if (stop.stopName.toLowerCase() === from.toLowerCase()) {
                fromIndex = index;
            }
            if (stop.stopName.toLowerCase() === to.toLowerCase()) {
                toIndex = index;
            }
        });

        // If both 'from' and 'to' stops exist and are not the same
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            const isReverseDirection = fromIndex > toIndex;

            // Calculate trip times
            const tripTimes = bus.trips
                .map((trip, index) => {
                    if ((!isReverseDirection && index % 2 === 0) || (isReverseDirection && index % 2 !== 0)) {
                        const tripStartTime = new Date(`1970-01-01T${trip}:00`);
                        const fromTime = new Date(tripStartTime);
                        fromTime.setMinutes(fromTime.getMinutes() + bus.route[fromIndex][isReverseDirection ? "reverse" : "forword"]);
                        const toTime = new Date(tripStartTime);
                        toTime.setMinutes(toTime.getMinutes() + bus.route[toIndex][isReverseDirection ? "reverse" : "forword"]);
                        return {
                            fromTime: fromTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            toTime: toTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                    }
                    return null;
                })
                .filter(time => time !== null);

            // Calculate bus schedules and check if the bus is live
            const busSchedules = bus.trips.map((trip) => {
                // Parse the trip's starting time (e.g., "14:30")
                const tripStartTime = new Date(`1970-01-01T${trip}:00`);

                // Calculate the trip's ending time by adding totalTime (e.g., 90 minutes)
                const tripEndTime = new Date(tripStartTime);
                tripEndTime.setMinutes(tripEndTime.getMinutes() + bus.totaltime);

                // Check if the current time is within the trip's start and end time
                const isLive = currentTime >= tripStartTime && currentTime <= tripEndTime;

                return {
                    startTime: tripStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: tripEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isLive: isLive // Add isLive flag
                };
            });

            // Check if any trip is live
            const isBusLive = busSchedules.some(schedule => schedule.isLive);

            // Log whether the bus is live or not
            console.log(`Bus ${bus.busNo} is ${isBusLive ? "live" : "not live"}.`);

            // Use the totaltime from the buses table
            const totalTime = bus.totaltime;

            availableBuses.push({
                id: bus.id, // Include the bus ID
                busNo: bus.busNo,
                from: bus.route[fromIndex].stopName,
                to: bus.route[toIndex].stopName,
                fromLatitude: bus.route[fromIndex].latitude,
                fromLongitude: bus.route[fromIndex].longitude,
                toLatitude: bus.route[toIndex].latitude,
                toLongitude: bus.route[toIndex].longitude,
                tripTimes: tripTimes,
                totalStops: bus.total_stops,
                totalTime: totalTime, // Use the totaltime from the buses table
                live: isBusLive, // Add live status
                isReverseDirection: isReverseDirection
            });
        }
    });

    return availableBuses;
}
// API to get bus route
app.get("/api/bus-route", (req, res) => {
    const { busNo, isReverseDirection } = req.query;

    if (!busNo) {
        return res.status(400).json({ error: "Bus number is required" });
    }

    const sql = `SELECT * FROM routes WHERE busNo = ? ORDER BY forword ${isReverseDirection === "true" ? "DESC" : "ASC"}`;

    db.query(sql, [busNo], (err, results) => {
        if (err) {
            console.error("Error fetching bus route:", err);
            return res.status(500).json({ error: "Failed to fetch bus route" });
        }

        res.json({
            busNo: busNo,
            route: results,
            isReverseDirection: isReverseDirection === "true"
        });
    });
});

// API to search buses based on 'to' location
app.get("/api/to-location-buses", (req, res) => {
    const { to, busNo } = req.query;

    if (!to) {
        return res.status(400).json({ error: "Please provide a 'To' location." });
    }

    let sql = `
        SELECT b.busNo, b.total_stops, b.trips, r.stopName, r.village, r.forword, r.reverse, r.latitude, r.longitude
        FROM buses b
        JOIN routes r ON b.busNo = r.busNo
        WHERE r.stopName = ?
    `;

    if (busNo) {
        sql += ` AND b.busNo LIKE ?`;
    }

    db.query(sql, [to, `%${busNo}%`], (err, results) => {
        if (err) {
            console.error("Error fetching buses:", err);
            return res.status(500).json({ error: "Failed to fetch buses" });
        }

        const availableBuses = processBusResults(results, null, to);
        res.json(availableBuses);
    });
});

// Helper function to calculate "toTime" in 24-hour format
function calculateToTime(fromTime, duration) {
    const [hours, minutes] = fromTime.split(":").map(Number);
    const tripStartTime = new Date();
    tripStartTime.setHours(hours, minutes, 0, 0);

    const toTime = new Date(tripStartTime);
    toTime.setMinutes(toTime.getMinutes() + duration);

    // Format the time in 24-hour format
    const toHours = toTime.getHours().toString().padStart(2, "0");
    const toMinutes = toTime.getMinutes().toString().padStart(2, "0");

    return `${toHours}:${toMinutes}`;
}
// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});