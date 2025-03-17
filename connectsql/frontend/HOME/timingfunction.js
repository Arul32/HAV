function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(":");
    let period = "AM";
    let hours12 = parseInt(hours, 10);

    if (hours12 >= 12) {
        period = "PM";
        if (hours12 > 12) {
            hours12 -= 12;
        }
    } else if (hours12 === 0) {
        hours12 = 12; // Handle midnight (00:00)
    }

    return `${hours12}:${minutes} ${period}`;
}
function parseTimeString(timeStr) {
    const trimmedTime = timeStr.trim();
    const is12HourFormat = trimmedTime.toLowerCase().includes("am") || trimmedTime.toLowerCase().includes("pm");

    if (is12HourFormat) {
        // Convert 12-hour format to 24-hour
        const [time, period] = trimmedTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period.toLowerCase() === "pm" && hours !== 12) {
            hours += 12; // Convert PM to 24-hour format
        } else if (period.toLowerCase() === "am" && hours === 12) {
            hours = 0; // Convert 12 AM to 0 hours
        }

        const tripTime = new Date();
        tripTime.setHours(hours, minutes, 0, 0);
        return tripTime;
    } else {
        // Assume it's 24-hour format
        const [hours, minutes] = trimmedTime.split(":").map(Number);
        const tripTime = new Date();
        tripTime.setHours(hours, minutes, 0, 0);
        return tripTime;
    }
}
// Helper function to find the closest trip time to the filterTime
function findClosestTime(tripTimes, filterTime) {
    let closestTime = null;

    tripTimes.forEach(trip => {
        const tripTime = parseTimeString(trip.fromTime);

        if (tripTime >= filterTime) {
            if (!closestTime || Math.abs(tripTime - filterTime) < Math.abs(closestTime - filterTime)) {
                closestTime = tripTime;
            }
        }
    });

    return closestTime || new Date(8640000000000000); // Return a very large date if no valid time is found
}
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
}