const express = require("express");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());

// Updated bus stops data
const stops = [
    { stopName: "Arasampalayam Stop 1" },
    { stopName: "Arasampalayam Stop 2" },
    { stopName: "Arasampalayam Stop 3" },
    { stopName: "Solpalayam Stop 1" },
    { stopName: "Solpalayam Stop 2" },
    { stopName: "Solpalayam Stop 3" },
    { stopName: "Palayam Stop 1" },
    { stopName: "Palayam Stop 2" },
    { stopName: "Palayam Stop 3" },
    { stopName: "Kinathukadavu Stop 1" },
    { stopName: "Kinathukadavu Stop 2" },
    { stopName: "Elur Privu" },
    { stopName: "Othakalmandapam" },
    { stopName: "Malumichampatti" },
    { stopName: "Aathupalam" },
    { stopName: "Sundarapuram" },
    { stopName: "Ukkadam" }
];

// Updated buses data
const buses = [
    {
        busNo: "42A",
        total_stops:11,
        route: [
            {  stopName: "Arasampalayam Stop 1", village: "Arasampalayam", forword: 0 ,reverse:45},
            {  stopName: "Arasampalayam Stop 2", village: "Arasampalayam", forword: 6 ,reverse:39},
            {  stopName: "Arasampalayam Stop 3", village: "Arasampalayam", forword: 9 ,reverse:36},
            {  stopName: "Solpalayam Stop 1", village: "Solpalayam", forword: 12 ,reverse:33},
            {  stopName: "Solpalayam Stop 2", village: "Solpalayam", forword: 15,reverse:30 },
            {  stopName: "Solpalayam Stop 3", village: "Solpalayam", forword: 18 ,reverse:27},
            {  stopName: "Palayam Stop 1", village: "Palayam", forword: 28 ,reverse:17},
            {  stopName: "Palayam Stop 2", village: "Palayam", forword: 33 ,reverse:12},
            {  stopName: "Palayam Stop 3", village: "Palayam", forword: 38 ,reverse:7},
            {  stopName: "Kinathukadavu Stop 1", village: "Kinathukadavu", forword: 43 ,reverse:2},
            {  stopName: "Kinathukadavu Stop 2", village: "Kinathukadavu", forword: 45 ,reverse:0}
        ],
        trips: ["09:00", "11:00", "13:00","15:00","17:00"]
    },
    {
        busNo: "33A",
        total_stops:8,
        route: [
            {  stopName: "Ukkadam", village: "Ukkadam", forword: 0 ,reverse:30},
            { stopName: "Sundarapuram", village: "Sundarapuram", forword: 3 ,reverse:27 },
            {  stopName: "Aathupalam", village: "Aathupalam" , forword: 6 ,reverse:24},
            {  stopName: "Malumichampatti", village: "Malumichampatti" , forword: 9 ,reverse:21},
            {  stopName: "Othakalmandapam", village: "Othakalmandapam" , forword: 12 ,reverse:18},
            {  stopName: "Elur Privu", village: "Elur Privu" , forword: 15 ,reverse:15},
            {  stopName: "Kinathukadavu Stop 1", village: "Kinathukadavu", forword: 25 ,reverse:5 },
            {  stopName: "Kinathukadavu Stop 2", village: "Kinathukadavu" , forword: 30 ,reverse:0}
        ],
        trips: ["09:00", "11:00", "13:00","15:00","17:00"]
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
// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
