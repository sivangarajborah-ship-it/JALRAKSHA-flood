const BACKEND_URL = "https://5x7fnbehz5.execute-api.ap-south-1.amazonaws.com/prod/floodprediction";

// Google map
let map;
let marker;
let chart;

// initialize map
function initMap() {
    const defaultLoc = { lat: 20.5937, lng: 78.9629 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: defaultLoc,
    });

    marker = new google.maps.Marker({
        position: defaultLoc,
        map: map,
    });

    const ctx = document.getElementById("rainChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Now", "1hr", "2hr", "3hr", "4hr", "5hr"],
            datasets: [{
                label: "Predicted Rainfall (mm)",
                data: [0,0,0,0,0,0],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true
        }
    });
}

// main prediction function
async function predict() {

    const city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Enter a city name");
        return;
    }

    try {

        // send GET request to API
        const response = await fetch(
            `${BACKEND_URL}?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // location update
        const loc = {
            lat: data.lat,
            lng: data.lon
        };

        map.setCenter(loc);
        marker.setPosition(loc);

        // weather display
        document.getElementById("weather").innerText =
            `Rainfall: ${data.rainfall} mm | Humidity: ${data.humidity}% | Temperature: ${data.temperature}°C`;

        // flood risk
        document.getElementById("risk").innerText =
            "Flood Risk: " + data.flood_risk;

        // rainfall prediction chart
        chart.data.datasets[0].data = [
            data.rainfall,
            data.rainfall * 1.1,
            data.rainfall * 1.2,
            data.rainfall * 1.3,
            data.rainfall * 1.5,
            data.rainfall * 1.8
        ];

        chart.update();

        showAlert(data.flood_risk);

    } catch (error) {

        console.error(error);
        alert("Error: Failed to fetch backend.");

    }
}

// flood alert popup
function showAlert(risk) {

    const alertBox = document.getElementById("alert");

    if (risk === "High") {
        alertBox.innerText = "⚠️ High Flood Risk! Stay Alert!";
        alertBox.style.display = "block";
    }
    else if (risk === "Moderate") {
        alertBox.innerText = "⚠️ Moderate Flood Risk.";
        alertBox.style.display = "block";
    }
    else {
        alertBox.style.display = "none";
    }

}