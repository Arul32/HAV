function toggleTimeInput() {
    const timeOption = document.getElementById("timeOption").value;
    const setTimeInput = document.getElementById("setTime");

    if (timeOption === "current" || timeOption === "notset") {
        setTimeInput.disabled = true;
        setTimeInput.value = "";
    } else {

        setTimeInput.disabled = false;
    }
}

function fetchSuggestions(inputId) {
const query = document.getElementById(inputId).value.trim();
const resultsDiv = document.getElementById("results");

if (!query) {
resultsDiv.style.display = "none";
return;
}

fetch(`http://localhost:8080/api/stops?q=${query}`)
.then(response => response.json())
.then(data => {
    resultsDiv.innerHTML = ""; // Clear previous results

    if (data.length === 0) {
        resultsDiv.style.display = "none";
        return;
    }

    // Show only 4 suggestions initially
    const initialSuggestions = data.slice(0, 4);
    initialSuggestions.forEach(stop => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.innerHTML = `<strong>Stop Name:</strong> ${stop.stopName}`;
        div.onclick = () => {
            document.getElementById(inputId).value = stop.stopName;
            resultsDiv.style.display = "none"; // Hide suggestions after selection
        };
        resultsDiv.appendChild(div);
    });

    // Add "See More" button if there are more than 4 suggestions
    if (data.length > 4) {
        const seeMoreDiv = document.createElement("div");
        seeMoreDiv.classList.add("see-more");
        seeMoreDiv.textContent = "See More";
        seeMoreDiv.onclick = () => {
            // Show the next 4 suggestions (up to 8 total)
            const remainingSuggestions = data.slice(4, 8);
            remainingSuggestions.forEach(stop => {
                const div = document.createElement("div");
                div.classList.add("suggestion-item");
                div.innerHTML = `<strong>Stop Name:</strong> ${stop.stopName}`;
                div.onclick = () => {
                    document.getElementById(inputId).value = stop.stopName;
                    resultsDiv.style.display = "none";
                };
                resultsDiv.appendChild(div);
            });

            // Remove the "See More" button after expanding
            seeMoreDiv.remove();
        };
        resultsDiv.appendChild(seeMoreDiv);
    }

    resultsDiv.style.display = "block"; // Show the results div
})
.catch(error => {
    console.error("Error fetching suggestions:", error);
    resultsDiv.style.display = "none";
});
}




// 
window.onload = function () {
toggleTimeInput();
};