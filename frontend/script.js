let map, marker, heatmap, chart;

// Backend URL
const BACKEND_URL = "http://127.0.0.1:8000/predict";

function initMap() {
    const center = { lat: 26.1445, lng: 91.7362 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: center
    });

    marker = new google.maps.Marker({ position: center, map });

    const basePoints = [
        { lat: 26.1445, lng: 91.7362 },
        { lat: 25.5941, lng: 85.1376 },
        { lat: 28.7041, lng: 77.1025 }
    ];

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: basePoints.map(p => new google.maps.LatLng(p.lat, p.lng)),
        map: map,
        dissipating: true,
        radius: 50,
        opacity: 0.7
    });

    // Smooth animation
    setInterval(() => {
        const animatedData = basePoints.map(p => new google.maps.LatLng(
            p.lat + (Math.random() - 0.5) * 0.02,
            p.lng + (Math.random() - 0.5) * 0.02
        ));
        heatmap.setData(animatedData);
    }, 1000);

    addShelters();
    createChart();
}

function addShelters() {
    const shelters = [
        { lat: 26.18, lng: 91.73 },
        { lat: 26.15, lng: 91.70 },
        { lat: 26.12, lng: 91.75 }
    ];

    shelters.forEach(s => {
        new google.maps.Marker({
            position: s,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });
    });
}

function detectLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(location);
        marker.setPosition(location);
    });
}

function createChart(data = [0,0,0,0,0,0]) {
    const ctx = document.getElementById("chart");
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["1h","2h","3h","4h","5h","6h"],
            datasets: [{
                label: "Rainfall (mm)",
                data: data,
                backgroundColor: "rgba(30, 95, 163, 0.2)",
                borderColor: "#1e5fa3",
                borderWidth: 2,
                fill: true
            }]
        },
        options: { responsive:true, maintainAspectRatio:false }
    });
}

async function predict() {
    const city = document.getElementById("city").value.trim();
    if (!city) { alert("Please enter a city name"); return; }

    try {
        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city })
        });

        const data = await res.json();
        if (data.error) { alert(data.error); return; }

        const loc = { lat: data.lat, lng: data.lon };
        map.setCenter(loc);
        marker.setPosition(loc);

        document.getElementById("weather").innerText = `Rainfall: ${data.rainfall} mm | Humidity: ${data.humidity}% | Temp: ${data.temperature}°C`;
        document.getElementById("risk").innerText = "Flood Risk: " + data.flood_risk;

        chart.data.datasets[0].data = [data.rainfall,data.rainfall*1.1,data.rainfall*1.2,data.rainfall*1.3,data.rainfall*1.5,data.rainfall*1.8];
        chart.update();

        showAlert(data.flood_risk);

    } catch(err) {
        alert("Error: Failed to fetch backend. Make sure backend is running.");
        console.error(err);
    }
}

function showAlert(level) {
    const alertBox = document.getElementById("alert");
    alertBox.style.display = "block";

    if(level.toLowerCase().includes("high") || level.toLowerCase().includes("severe")){
        alertBox.style.background = "red";
        alertBox.innerText = "⚠ High Flood Risk";
    } else {
        alertBox.style.background = "green";
        alertBox.innerText = "Safe Conditions";
    }
}

// Dummy functions
function sendSMS(){ alert("Emergency SMS Sent"); }
function submitReport(e){ e.preventDefault(); alert("Flood report submitted for " + document.getElementById("reportCity").value); }
function shareWhatsApp(){ window.open("https://wa.me/?text=Flood Alert from JalRaksha"); }
function shareTwitter(){ window.open("https://twitter.com/intent/tweet?text=Flood Alert from JalRaksha"); }
function shareFacebook(){ window.open("https://www.facebook.com/sharer/sharer.php?u=https://jalraksha"); }