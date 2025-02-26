const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());

// Updated bus stops data
const stops = [
    
        { stopName: "Kinathukadavu" },
        { stopName: "Kinathukadavu Old Bus Stand" },
        { stopName: "Kinathukadavu Check Post" },
        { stopName: "Arasampalayam Pirivu" },
        { stopName: "Solavampalayam" },
        { stopName: "Arasampalayam Railway Gate" },
        { stopName: "Arasam Palyam" },
        { stopName: "Shri Krishna Sweets Arasam Palyam" },
        { stopName: "Karachery 1" },
        { stopName: "Karachery" },
        { stopName: "Vadachithur Pirivu" },
        { stopName: "Panappatti High School" },
        { stopName: "Panappatti" },
        { stopName: "Madathukulam" },
        { stopName: "Krishnapuram" },
        { stopName: "Narasingapuram" },
        { stopName: "Chettiyar Mill" },
        { stopName: "Myvadi Pirivu" },
        { stopName: "Palappampatti" },
        { stopName: "Kalliyangadu" },
        { stopName: "Rajavur Pirivu" },
        { stopName: "Samathuvapuram" },
        { stopName: "Periyakottai Pirivu" },
        { stopName: "Vaikal Paalam" },
        { stopName: "SV Mill Udumalpet" },
        { stopName: "Shri GVG Visalakshi College" },
        { stopName: "Gandhi Nagar Udumalaipettai" },
        { stopName: "Udumalpet" },
        { stopName: "Union Office Kinathukadavu" },
        { stopName: "Kalankatuputhur" },
        { stopName: "Gothavadi Pirivu" },
        { stopName: "Kids Park School Kinathukadavu" },
        { stopName: "Senram Palayam Privu" },
        { stopName: "Thamaraikulam" },
        { stopName: "Lakshmi Mills Thamaraikulam" },
        { stopName: "LG Mullupadi" },
        { stopName: "Mullur Patti Gate" },
        { stopName: "Ellan Mill" },
        { stopName: "Mettupalayam Pirivu" },
        { stopName: "Kovilpalayam" },
        { stopName: "Cheran Nagar" },
        { stopName: "Santhegoundam palayam" },
        { stopName: "Vaikkal Medu" },
        { stopName: "Nanjegoundanputhur" },
        { stopName: "Kullakka Palayam" },
        { stopName: "Achipatti" },
        { stopName: "Cheranthozili Colony" },
        { stopName: "Sakthi Mill Jeeva Nagar" },
        { stopName: "Jeeva Nagar" },
        { stopName: "Vadakipalayam Pirivu" },
        { stopName: "Thillai Nagar" },
        { stopName: "Pollachi CTC Medu" },
        { stopName: "Magalingapuram Aarch" },
        { stopName: "Pollachi" }
    
    
];

// Updated buses data
const buses = [
    {
        busNo: "42A",
        total_stops: 30,
        route: [
            { stopName: "Arasam Palyam", village: "Arasam Palyam", forword: 0, reverse: 90 },
            { stopName: "Kinathukadavu Check Post", village: "Kinathukadavu", forword: 3, reverse: 87 },
            { stopName: "Kinathukadavu Old Bus Stand", village: "Kinathukadavu", forword: 6, reverse: 84 },
            { stopName: "Kinathukadavu", village: "Kinathukadavu", forword: 10, reverse: 80 },
            { stopName: "Union Office Kinathukadavu", village: "Kinathukadavu", forword: 13, reverse: 77 },
            { stopName: "Kalankatuputhur", village: "Kalankatuputhur", forword: 17, reverse: 73 },
            { stopName: "Gothavadi Pirivu", village: "Gothavadi", forword: 21, reverse: 69 },
            { stopName: "Kids Park School Kinathukadavu", village: "Kids Park", forword: 24, reverse: 66 },
            { stopName: "Senram Palayam Privu", village: "Senram Palayam", forword: 28, reverse: 62 },
            { stopName: "Thamaraikulam", village: "Thamaraikulam", forword: 32, reverse: 58 },
            { stopName: "Lakshmi Mills Thamaraikulam", village: "Lakshmi Mills", forword: 35, reverse: 55 },
            { stopName: "LG Mullupadi", village: "LG Mullupadi", forword: 38, reverse: 52 },
            { stopName: "Mullur Patti Gate", village: "Mullur Patti", forword: 41, reverse: 49 },
            { stopName: "Ellan Mill", village: "Ellan Mill", forword: 44, reverse: 46 },
            { stopName: "Mettupalayam Pirivu", village: "Mettupalayam", forword: 47, reverse: 43 },
            { stopName: "Kovilpalayam", village: "Kovilpalayam", forword: 50, reverse: 40 },
            { stopName: "Cheran Nagar", village: "Cheran Nagar", forword: 53, reverse: 37 },
            { stopName: "Santhegoundam palayam", village: "Santhegoundampalayam", forword: 56, reverse: 34 },
            { stopName: "Vaikkal Medu", village: "Vaikkal Medu", forword: 59, reverse: 31 },
            { stopName: "Nanjegoundanputhur", village: "Nanjegoundanputhur", forword: 62, reverse: 28 },
            { stopName: "Kullakka Palayam", village: "Kullakka Palayam", forword: 65, reverse: 25 },
            { stopName: "Achipatti", village: "Achipatti", forword: 68, reverse: 22 },
            { stopName: "Cheranthozili Colony", village: "Cheranthozili Colony", forword: 71, reverse: 19 },
            { stopName: "Sakthi Mill Jeeva Nagar", village: "Sakthi Mill", forword: 74, reverse: 16 },
            { stopName: "Jeeva Nagar", village: "Jeeva Nagar", forword: 77, reverse: 13 },
            { stopName: "Vadakipalayam Pirivu", village: "Vadakipalayam", forword: 80, reverse: 10 },
            { stopName: "Cheran Nagar", village: "Cheran Nagar", forword: 83, reverse: 7 },
            { stopName: "Thillai Nagar", village: "Thillai Nagar", forword: 86, reverse: 4 },
            { stopName: "Pollachi CTC Medu", village: "Pollachi", forword: 88, reverse: 2 },
            { stopName: "Magalingapuram Aarch", village: "Pollachi", forword: 89, reverse: 1 },
            { stopName: "Pollachi", village: "Pollachi", forword: 90, reverse: 0 }
        ],
        trips: ["06:30", "08:30", "10:30", "12:30", "14:30", "16:30", "18:30", "20:30"]
    },
    
    {
        busNo: "33A",
        total_stops: 13,
        route: [
            { stopName: "Kinathukadavu", village: "Kinathukadavu", forword: 0, reverse: 70 },
            { stopName: "Kinathukadavu Old Bus Stand", village: "Kinathukadavu", forword: 3, reverse: 67 },
            { stopName: "Kinathukadavu Check Post", village: "Kinathukadavu", forword: 7, reverse: 63 },
            { stopName: "Arasampalayam Pirivu", village: "Arasampalayam", forword: 12, reverse: 58 },
            { stopName: "Solavampalayam", village: "Solavampalayam", forword: 18, reverse: 52 },
            { stopName: "Arasampalayam Railway Gate", village: "Arasampalayam", forword: 23, reverse: 47 },
            { stopName: "Arasam Palyam", village: "Arasam Palyam", forword: 28, reverse: 42 },
            { stopName: "Shri Krishna Sweets Arasam Palyam", village: "Shri Krishna Sweets", forword: 33, reverse: 37 },
            { stopName: "Karachery 1", village: "Karachery", forword: 38, reverse: 32 },
            { stopName: "Karachery", village: "Karachery", forword: 42, reverse: 28 },
            { stopName: "Vadachithur Pirivu", village: "Vadachithur", forword: 50, reverse: 20 },
            { stopName: "Panappatti High School", village: "Panappatti", forword: 60, reverse: 10 },
            { stopName: "Panappatti", village: "Panappatti", forword: 70, reverse: 0 }
        ],
        trips: ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"]
    }
    ,
    {
        busNo: "29",
        total_stops: 15,
        route: [
            { stopName: "Madathukulam", village: "Madathukulam", forword: 0, reverse: 83 },
            { stopName: "Krishnapuram", village: "Krishnapuram", forword: 4, reverse: 79 },
            { stopName: "Narasingapuram", village: "Narasingapuram", forword: 13, reverse: 70 },
            { stopName: "Chettiyar Mill", village: "Chettiyar Mill", forword: 20, reverse: 63 },
            { stopName: "Myvadi Pirivu", village: "Myvadi Pirivu", forword: 30, reverse: 53 },
            { stopName: "Palappampatti", village: "Palappampatti", forword: 35, reverse: 48 },
            { stopName: "Kalliyangadu", village: "Kalliyangadu", forword: 38, reverse: 45 },
            { stopName: "Rajavur Pirivu", village: "Rajavur Pirivu", forword: 42, reverse: 41 },
            { stopName: "Samathuvapuram", village: "Samathuvapuram", forword: 44, reverse: 39 },
            { stopName: "Periyakottai Pirivu", village: "Periyakottai Pirivu", forword: 50, reverse: 33 },
            { stopName: "Vaikal Paalam", village: "Vaikal Paalam", forword: 56, reverse: 27 },
            { stopName: "SV Mill Udumalpet", village: "SV Mill Udumalpet", forword: 64, reverse: 19 },
            { stopName: "Shri GVG Visalakshi College", village: "Shri GVG Visalakshi College", forword: 74, reverse: 9 },
            { stopName: "Gandhi Nagar Udumalaipettai", village: "Gandhi Nagar Udumalaipettai", forword: 80, reverse: 3 },
            { stopName: "Udumalpet", village: "Udumalpet", forword: 83, reverse: 0 }
        ],
        trips: ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"]
    }
    
    
];

// Search API: Returns matching stops based on query (case-insensitive)
app.get("/api/stops", (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";

    // Filter stops based on query (matching stop name)
    const result = stops.filter(stop => stop.stopName.toLowerCase().includes(query));

    res.json(result);
});
app.get("/api/buses", (req, res) => {
    const { from, to, busNo } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Both 'from' and 'to' parameters are required" });
    }

    const filteredBuses = buses.filter(bus =>
        (!busNo || bus.busNo.toLowerCase().includes(busNo.toLowerCase()))
    );

    let availableBuses = [];

    filteredBuses.forEach(bus => {
        let fromIndex = -1;
        let toIndex = -1;

        bus.route.forEach((stop, index) => {
            if (stop.stopName.toLowerCase() === from.toLowerCase()) {
                fromIndex = index;
            }
            if (stop.stopName.toLowerCase() === to.toLowerCase()) {
                toIndex = index;
            }
        });

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            const isReverseDirection = fromIndex > toIndex;

            // Adjust the route data based on direction
            const routeData = isReverseDirection ? bus.route.slice().reverse() : bus.route;

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

            availableBuses.push({
                busNo: bus.busNo,
                from: bus.route[fromIndex].stopName,
                to: bus.route[toIndex].stopName,
                tripTimes: tripTimes,
                totalStops: bus.totalStops,
                isReverseDirection: isReverseDirection // Include direction in the response
            });
        }
    });

    res.json(availableBuses);
});
//bus route in stop view
// Bus Route API: Returns the full route data for a specific bus
app.get("/api/bus-route", (req, res) => {
    const { busNo, isReverseDirection } = req.query;

    if (!busNo) {
        return res.status(400).json({ error: "Bus number is required" });
    }

    const bus = buses.find(bus => bus.busNo.toLowerCase() === busNo.toLowerCase());

    if (!bus) {
        return res.status(404).json({ error: "Bus not found" });
    }

    // Adjust the route data based on direction
    const routeData = isReverseDirection === "true" ? bus.route.slice().reverse() : bus.route;

    res.json({
        busNo: bus.busNo,
        route: routeData,
        isReverseDirection: isReverseDirection === "true"
    });
});

app.get("/api/to-location-buses", (req, res) => {
    const to = req.query.to ? req.query.to.toLowerCase() : "";
    const busNo = req.query.busNo ? req.query.busNo.toLowerCase() : "";

    if (!to) {
        return res.status(400).json({ error: "Please provide a 'To' location." });
    }

    // Find buses that include the "To" location and match the bus number
    const matchingBuses = buses.filter(bus => {
        const includesTo = bus.route.some(stop => stop.stopName.toLowerCase() === to);
        const matchesBusNo = busNo ? bus.busNo.toLowerCase().includes(busNo) : true;
        return includesTo && matchesBusNo;
    });

    if (matchingBuses.length === 0) {
        return res.status(404).json({ error: "No buses found for the provided 'To' location and bus number." });
    }

    // Prepare the response with the three scenarios
    const availableBuses = matchingBuses.map(bus => {
        const toIndex = bus.route.findIndex(stop => stop.stopName.toLowerCase() === to);
        const firstStop = bus.route[0].stopName;
        const lastStop = bus.route[bus.route.length - 1].stopName;

        // Case 1: "To" location is the first stop (reverse direction)
        if (toIndex === 0) {
            return {
                busNo: bus.busNo,
                from: lastStop,
                to: firstStop,
                tripTimes: bus.trips
                    .filter((_, index) => index % 2 !== 0) // Odd-indexed timings for reverse direction
                    .map(trip => ({
                        fromTime: trip,
                        toTime: calculateToTime(trip, bus.route[toIndex].reverse) // Use reverse time
                    })),
                totalStops: bus.route.length,
                isReverseDirection: true // Indicate reverse direction
            };
        }

        // Case 2: "To" location is the last stop (forward direction)
        if (toIndex === bus.route.length - 1) {
            return {
                busNo: bus.busNo,
                from: firstStop,
                to: lastStop,
                tripTimes: bus.trips
                    .filter((_, index) => index % 2 === 0) // Even-indexed timings for forward direction
                    .map(trip => ({
                        fromTime: trip,
                        toTime: calculateToTime(trip, bus.route[toIndex].forword) // Use forward time
                    })),
                totalStops: bus.route.length,
                isReverseDirection: false // Indicate forward direction
            };
        }

        // Case 3: "To" location is between the first and last stop
        return [
            {
                busNo: bus.busNo,
                from: firstStop,
                to: bus.route[toIndex].stopName,
                tripTimes: bus.trips
                    .filter((_, index) => index % 2 === 0) // Even-indexed timings for forward direction
                    .map(trip => ({
                        fromTime: trip,
                        toTime: calculateToTime(trip, bus.route[toIndex].forword) // Use forward time
                    })),
                totalStops: toIndex + 1,
                isReverseDirection: false // Indicate forward direction
            },
            {
                busNo: bus.busNo,
                from: lastStop,
                to: bus.route[toIndex].stopName,
                tripTimes: bus.trips
                    .filter((_, index) => index % 2 !== 0) // Odd-indexed timings for reverse direction
                    .map(trip => ({
                        fromTime: trip,
                        toTime: calculateToTime(trip, bus.route[toIndex].reverse) // Use reverse time
                    })),
                totalStops: bus.route.length - toIndex,
                isReverseDirection: true // Indicate reverse direction
            }
        ];
    }).flat(); // Flatten the array of scenarios

    res.json(availableBuses);
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