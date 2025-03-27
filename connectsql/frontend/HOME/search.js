let clickedBusStops=[];
function search() {
    const from = document.getElementById("from").value.trim();
    const to = document.getElementById("to").value.trim();
    const bus = document.getElementById("bus").value.trim();
    const timeOption = document.getElementById("timeOption").value;
    const setTime = document.getElementById("setTime").value;
    

    if (!to) {
        alert("Please enter at least a 'To' location.");
        return;
    }

    // If "From" location is provided, call searchBus
    if (from) {
        searchBus();
    }
    // If only "To" location is provided, call searchToLocation
    else {
        searchToLocation();
    }
}

/*
function searchToLocation() {
    const to = document.getElementById("to").value.trim();
    const bus = document.getElementById("bus").value.trim();
    const timeOption = document.getElementById("timeOption").value;
    const setTime = document.getElementById("setTime").value;

    if (!to) {
        alert("Please enter a 'To' location.");
        return;
    }

    // Determine the filter time based on the selected option
    let filterTime = null;
    if (timeOption === "set" && setTime) {
        // Use user-set time
        const [hours, minutes] = setTime.split(":").map(Number);
        filterTime = new Date();
        filterTime.setHours(hours, minutes, 0, 0); // Set the user-defined hours & minutes
    } else if (timeOption === "current") {
        // Use current time
        filterTime = new Date();
    }

    // Check if the API endpoint exists
    const apiUrl = `http://localhost:8080/api/to-location-buses?to=${to}&busNo=${bus}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                // Handle 404 or other HTTP errors
                if (response.status === 404) {
                    throw new Error("The requested resource was not found.");
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(data => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";

            if (!Array.isArray(data)) {
                console.error("Expected an array but got:", data);
                resultsDiv.innerHTML = "<p>No buses found.</p>";
                resultsDiv.style.display = "block";
                return;
            }

            if (data.length === 0) {
                resultsDiv.innerHTML = "<p>No buses found.</p>";
                resultsDiv.style.display = "block";
                return;
            }

            // Filter buses based on time option
            const filteredBuses = data.filter(bus => {
                if (timeOption === "notset") {
                    return true; // Show all buses
                } else {
                    return bus.tripTimes.some(trip => {
                        const tripTime = parseTimeString(trip.fromTime);
                        return tripTime >= filterTime;
                    });
                }
            });

            if (filteredBuses.length === 0) {
                resultsDiv.innerHTML = "<p>No buses found for the selected time.</p>";
                resultsDiv.style.display = "block";
                return;
            }

            // Sort buses based on the closest arrival time to the filterTime
            filteredBuses.sort((a, b) => {
                const closestTimeA = findClosestTime(a.tripTimes, filterTime);
                const closestTimeB = findClosestTime(b.tripTimes, filterTime);

                return closestTimeA - closestTimeB; // Sort in ascending order
            });

            // Display sorted buses
            filteredBuses.forEach(bus => {
                const busItem = document.createElement("div");
                busItem.classList.add("bus-item");

                // Bus information
                const busInfo = `
                    <div class="bus-info">
                        <div><strong>Bus No:</strong> ${bus.busNo}</div>
                        <div><strong>Route:</strong> ${bus.from} to ${bus.to}</div>
                      
                    </div>
                `;

                // Filter trip times based on the filter time
                const filteredTripTimes = bus.tripTimes.filter(trip => {
                    const tripTime = parseTimeString(trip.fromTime);
                    return tripTime >= filterTime;
                });

                // Timings (filtered based on the filter time)
                const timingsHTML = `
    <div class="timings">
        <select ${filteredTripTimes.length === 1 ? 'disabled' : ''}>
            ${filteredTripTimes
                .map(time => {
                    const fromTime12 = convertTo12HourFormat(time.fromTime);
                    const toTime12 = convertTo12HourFormat(time.toTime);
                    return `
                        <option value="${time.fromTime} - ${time.toTime}">
                            ${fromTime12} - ${toTime12}
                        </option>
                    `;
                }).join("")}
        </select>
    </div>
`;
                // Combine bus info and timings
                busItem.innerHTML = busInfo + timingsHTML;
                resultsDiv.appendChild(busItem);

                // Add click event listener to the bus item
                busItem.addEventListener("click", () => {
                    // Get the selected time from the dropdown
                    const selectedTime = busItem.querySelector("select").value.split(" - ")[0];

                    // Fetch the full route data for the selected bus
                    fetch(`http://localhost:8080/api/bus-route?busNo=${bus.busNo}&isReverseDirection=${bus.isReverseDirection}`)
                        .then(response => response.json())
                        .then(routeData => {
                           
                             // Clear the array before adding new data
                             clickedBusStops = [];
                             localStorage.removeItem("clickedBusStops");
 
                             //storing the data 
                             routeData.route.forEach(stop => {
                                 clickedBusStops.push({
                                     stopName: stop.stopName,
                                     latitude: stop.latitude,
                                     longitude: stop.longitude
                                 });
                             });
                             console.log("clickedBusStops:"+clickedBusStops+"\n");
 
                             // Store the latest route data in localStorage
                             localStorage.setItem("clickedBusStops", JSON.stringify(clickedBusStops));
 
                            // Pass the selected time, direction, and "From" stop name to createOuterDivs
                           // createOuterDivs(routeData, selectedTime, bus.isReverseDirection, bus.from);
                        })
                        .catch(error => console.error("Error fetching route data:", error));
                });
            });

            resultsDiv.style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            const resultsDiv = document.getElementById("results");
            if (resultsDiv) {
                // Display a user-friendly message instead of logging the error
                resultsDiv.innerHTML = "<p>No buses found for the selected location.</p>";
                resultsDiv.style.display = "block";
            }
        });
}*/

function searchBus() {
    const from = document.getElementById("from").value.trim();
    const to = document.getElementById("to").value.trim();
    const bus = document.getElementById("bus").value.trim();
    const timeOption = document.getElementById("timeOption").value;
    const setTime = document.getElementById("setTime").value;

    if (!from || !to) {
        alert("Please enter both 'From' and 'To' locations.");
        return;
    }

    const resultsDiv = document.getElementById("results");

    let filterTime = null;
    if (timeOption === "set" && setTime) {
        const [hours, minutes] = setTime.split(":").map(Number);
        filterTime = new Date();
        filterTime.setHours(hours, minutes, 0, 0);
    } else if (timeOption === "current") {
        filterTime = new Date();
    }

    fetch(`http://localhost:8080/api/buses?from=${from}&to=${to}&busNo=${bus}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            resultsDiv.innerHTML = "";

            if (data.length === 0) {
                resultsDiv.innerHTML = "<p>No buses found.</p>";
                resultsDiv.style.display = "block";
                return;
            }

            const filteredBuses = data.filter(bus => {
                if (timeOption === "notset") {
                    return true;
                } else {
                    return bus.tripTimes.some(trip => {
                        const tripTime = parseTimeString(trip.fromTime);
                        return tripTime >= filterTime;
                    });
                }
            });

            if (filteredBuses.length === 0) {
                resultsDiv.innerHTML = "<p>No buses found for the selected time.</p>";
                resultsDiv.style.display = "block";
                return;
            }

            filteredBuses.sort((a, b) => {
                const closestTimeA = findClosestTime(a.tripTimes, filterTime);
                const closestTimeB = findClosestTime(b.tripTimes, filterTime);
                return closestTimeA - closestTimeB;
            });

            filteredBuses.forEach(bus => {
                const busItem = document.createElement("div");
                busItem.classList.add("bus-item");

                const busInfo = `
                    <div class="bus-info">
                        <div><strong>Bus No:</strong> ${bus.busNo}</div>
                        <div><strong>Route:</strong> ${bus.from} to ${bus.to}</div>
                    </div>
                `;

                const filteredTripTimes = bus.tripTimes.filter(trip => {
                    const tripTime = parseTimeString(trip.fromTime);
                    return tripTime >= filterTime;
                });

                const timingsHTML = `
                    <div class="timings">
                        <select ${filteredTripTimes.length === 1 ? 'disabled' : ''}>
                            ${filteredTripTimes
                                .map(time => `
                                    <option value="${time.fromTime} - ${time.toTime}">
                                        ${time.fromTime} - ${time.toTime}
                                    </option>
                                `).join("")}
                        </select>
                    </div>
                `;

                const mapViewButton = `
                    <button class="map-view-button" style="margin-top: 0px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Map View
                    </button>
                `;

                const seatViewButton = `
                    <button class="seat-view-button" style="margin-top: 0px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Seat View
                    </button>
                `;

                const reviewButton = `
                    <button class="re-view-button" style="margin-top: 0px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Review
                    </button>
                `;

                busItem.innerHTML = busInfo + mapViewButton + seatViewButton + reviewButton + timingsHTML;
                resultsDiv.appendChild(busItem);

                busItem.addEventListener("click", () => {
                    const selectedTime = busItem.querySelector("select").value.split(" - ")[0];
                    fetch(`http://localhost:8080/api/bus-route?busNo=${bus.busNo}&isReverseDirection=${bus.isReverseDirection}`)
                        .then(response => response.json())
                        .then(routeData => {
                            // Handle route data if needed
                        })
                        .catch(error => console.error("Error fetching route data:", error));
                });

                const mapButton = busItem.querySelector(".map-view-button");
mapButton.addEventListener("click", (event) => {
    event.stopPropagation();
    fetch(`http://localhost:8080/api/bus-route?busNo=${bus.busNo}&isReverseDirection=${bus.isReverseDirection}`)
        .then(response => response.json())
        .then(routeData => {
            // Debug: Verify timing data exists
            if (routeData.route.length > 0) {
                console.log("First stop in API response:", {
                    name: routeData.route[0].stopName,
                    forword: routeData.route[0].forword,
                    reverse: routeData.route[0].reverse
                });
            }

            const clickedBusStops = {
                totalStops: bus.totalStops,
                stops: routeData.route, // Use the complete route data
                isLive: bus.live,
                liveTime: bus.liveTime,
                busNo: bus.busNo,
                isReverseDirection: bus.isReverseDirection
            };
            
            localStorage.setItem("clickedBusStops", JSON.stringify(clickedBusStops));
            window.location.href = "../MAP/map.html";
        })
        .catch(error => console.error("Error fetching route data:", error));
});

                const seatButton = busItem.querySelector(".seat-view-button");
                seatButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    window.location.href = "../SEAT/seatavailablity.html";
                });

                const reviewButtonElement = busItem.querySelector(".re-view-button");
                reviewButtonElement.addEventListener("click", (event) => {
                    event.stopPropagation();
                    sessionStorage.setItem("BUSID", bus.id);
                    console.log("Bus ID clicked:", bus.id);
                    window.location.href = "../REVIEW/review.html"; // Redirect to the review page
                });
            });

            resultsDiv.style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            if (resultsDiv) {
                resultsDiv.innerHTML = "<p>Error fetching data. Please try again.</p>";
                resultsDiv.style.display = "block";
            }
        });
}
function parseTimeString(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0); // Set hours and minutes
    return date;
}
