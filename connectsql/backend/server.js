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

    //    console.log("Raw Database Results:", results); // Log the raw results from the database

        const availableBuses = processBusResults(results, from, to);
      //  console.log("Processed Buses:", availableBuses); // Log the processed buses

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
               // console.log(`Bus ${bus.busNo} Trips (Raw):`, bus.trips);
               console.log("bus no:"+bus.busNo+" reversed:"+isReverseDirection);
               const now = new Date();
let isBusLive = false;

// Use forEach to check each trip
bus.trips.forEach((trip, index) => {
    // Check if this trip should be considered based on direction
    if ((isReverseDirection && index % 2 !== 0) || (!isReverseDirection && index % 2 === 0)) {
        const [tripHours, tripMinutes] = trip.split(':').map(Number);
        
        // Calculate start and end times
        const tripStart = new Date();
        tripStart.setHours(tripHours, tripMinutes, 0, 0);
        
        const tripEnd = new Date(tripStart);
        tripEnd.setMinutes(tripEnd.getMinutes() + bus.totaltime);
        
        // Check if current time is within this trip's window
        if (now >= tripStart && now <= tripEnd) {
            isBusLive = true;
            console.log(`🚌 Bus ${bus.busNo} is LIVE (${isReverseDirection ? "REVERSE" : "FORWARD"})`);
            console.log(`   Trip ${index + 1}: ${trip} - ${tripEnd.getHours()}:${tripEnd.getMinutes().toString().padStart(2, '0')}`);
        }
    }
});

            // Calculate bus schedules and check if the bus is live
           
            // Check if any trip is live
        

            // Log whether the bus is live or not
          
            // Use the totaltime from the buses table
            const totalTime = bus.totaltime;

            availableBuses.push({
                id: bus.id,
                busNo: bus.busNo,
                from: bus.route[fromIndex].stopName,
                to: bus.route[toIndex].stopName,
                fromLatitude: bus.route[fromIndex].latitude,
                fromLongitude: bus.route[fromIndex].longitude,
                toLatitude: bus.route[toIndex].latitude,
                toLongitude: bus.route[toIndex].longitude,
                tripTimes: tripTimes,
                totalStops: bus.total_stops,
                totalTime: totalTime,
                live: isBusLive,
                isReverseDirection: isReverseDirection,
                liveTime: isBusLive ? (() => {
                    const liveTrip = bus.trips.find((trip, index) => {
                        const [tripHours, tripMinutes] = trip.split(':').map(Number);
                        const tripStart = new Date();
                        tripStart.setHours(tripHours, tripMinutes, 0, 0);
                        const tripEnd = new Date(tripStart);
                        tripEnd.setMinutes(tripEnd.getMinutes() + bus.totaltime);
                        return now >= tripStart && now <= tripEnd;
                    });
                    
                    const [startHours, startMins] = liveTrip.split(':').map(Number);
                    const startTime = new Date();
                    startTime.setHours(startHours, startMins, 0, 0);
                    
                    const endTime = new Date(startTime);
                    endTime.setMinutes(endTime.getMinutes() + bus.totaltime);
                    
                    return {
                        start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                })() : null
            });
        }
    });

    return availableBuses;
}
// API to get bus route
// Modified API to get bus route
app.get("/api/bus-route", (req, res) => {
    const { busNo, isReverseDirection } = req.query;

    if (!busNo) {
        return res.status(400).json({ error: "Bus number is required" });
    }

    const sql = `SELECT stopName, village, latitude, longitude, forword, reverse 
                 FROM routes WHERE busNo = ? 
                 ORDER BY forword ${isReverseDirection === "true" ? "DESC" : "ASC"}`;

    db.query(sql, [busNo], (err, results) => {
        if (err) {
            console.error("Error fetching bus route:", err);
            return res.status(500).json({ error: "Failed to fetch bus route" });
        }

        // Verify we got results with timing data
        if (results.length > 0) {
            console.log("First stop timing data:", {
                stopName: results[0].stopName,
                forword: results[0].forword,
                reverse: results[0].reverse
            });
        }

        res.json({
            busNo: busNo,
            route: results.map(stop => ({
                stopName: stop.stopName,
                village: stop.village,
                latitude: stop.latitude,
                longitude: stop.longitude,
                forword: stop.forword,  // Explicitly include
                reverse: stop.reverse   // Explicitly include
            })),
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