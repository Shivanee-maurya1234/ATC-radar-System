const API_URL = '/api/flights';

const canvas = document.getElementById('radarCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let sweepAngle = 0;
let selectedFlightId = null;
window.activeFlights = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchFlights();

    // Spawn flight button
    const spawnBtn = document.getElementById('spawnBtn');
    if (spawnBtn) {
        spawnBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const newFlight = {
                callsign: document.getElementById('callsign')?.value || 'AI-505',
                x: parseFloat(document.getElementById('posX')?.value) || 300,
                y: parseFloat(document.getElementById('posY')?.value) || 300,
                vx: parseFloat(document.getElementById('speedX')?.value) || 0.5,
                vy: parseFloat(document.getElementById('speedY')?.value) || -0.5,
                altitude: document.getElementById('altitude')?.value || 'FL300',
                status: 'ACTIVE'
            };

            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFlight)
            })
            .then(res => res.json())
            .then(() => fetchFlights())
            .catch(err => console.error('Error posting flight:', err));
        });
    }

    // Vector update button
    const updateVectorBtn = document.getElementById('updateVectorBtn');
    if (updateVectorBtn) {
        updateVectorBtn.addEventListener('click', () => {
            if (!selectedFlightId) return alert('Select a flight on the radar first!');

            const flight = window.activeFlights.find(f => f.id === selectedFlightId);
            if (!flight) return;

            const newVx = parseFloat(document.getElementById('vectorX')?.value) || flight.vx;
            const newVy = parseFloat(document.getElementById('vectorY')?.value) || flight.vy;

            flight.vx = newVx;
            flight.vy = newVy;

            fetch(`${API_URL}/${selectedFlightId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flight)
            })
            .then(() => fetchFlights())
            .catch(err => console.error('Error updating vector:', err));
        });
    }

    // Land/Clear flight button
    const clearFlightBtn = document.getElementById('clearFlightBtn');
    if (clearFlightBtn) {
        clearFlightBtn.addEventListener('click', () => {
            if (!selectedFlightId) return alert('Select a flight to land/clear!');

            fetch(`${API_URL}/${selectedFlightId}`, { method: 'DELETE' })
            .then(() => {
                selectedFlightId = null;
                document.getElementById('selectedFlight').innerText = 'None';
                fetchFlights();
            })
            .catch(err => console.error('Error clearing flight:', err));
        });
    }

    // Click canvas to select blip
    if (canvas) {
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const clicked = window.activeFlights.find(f => {
                const dist = Math.hypot(f.x - clickX, f.y - clickY);
                return dist <= 15;
            });

            if (clicked) {
                selectedFlightId = clicked.id;
                document.getElementById('selectedFlight').innerText = clicked.callsign;
                if (document.getElementById('vectorX')) document.getElementById('vectorX').value = clicked.vx;
                if (document.getElementById('vectorY')) document.getElementById('vectorY').value = clicked.vy;
            }
        });
    }

    requestAnimationFrame(animateRadar);
});

function fetchFlights() {
    fetch(API_URL)
        .then(res => res.json())
        .then(flights => {
            window.activeFlights = flights;
            renderFlightList(flights);
        })
        .catch(err => console.error('Error fetching flights:', err));
}

function renderFlightList(flights) {
    const trackerText = document.getElementById('flightTrackerStatus');
    if (trackerText) {
        if (!flights || flights.length === 0) {
            trackerText.innerText = "No active flights on radar.";
        } else {
            trackerText.innerText = `Active (${flights.length}): ` + 
                flights.map(f => `${f.callsign || 'UNK'} (X:${Math.round(f.x)}, Y:${Math.round(f.y)})`).join(' | ');
        }
    }
}

function animateRadar() {
    if (!ctx || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;

    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00ffcc33';
    ctx.lineWidth = 1;
    for (let r = 50; r <= radius; r += 50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX, height - 10);
    ctx.moveTo(10, centerY);
    ctx.lineTo(width - 10, centerY);
    ctx.stroke();

    if (window.activeFlights) {
        window.activeFlights.forEach(f => {
            f.x += (f.vx || 0) * 0.1;
            f.y += (f.vy || 0) * 0.1;

            const isSelected = f.id === selectedFlightId;

            ctx.beginPath();
            ctx.arc(f.x, f.y, isSelected ? 12 : 8, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? 'rgba(255, 200, 0, 0.4)' : 'rgba(0, 255, 100, 0.3)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? '#ffcc00' : '#00ffcc';
            ctx.fill();

            ctx.font = '11px monospace';
            ctx.fillStyle = isSelected ? '#ffcc00' : '#00ffcc';
            ctx.fillText(`${f.callsign || 'UNK'}`, f.x + 10, f.y + 4);
        });
    }

    sweepAngle += 0.02;
    const lineX = centerX + radius * Math.cos(sweepAngle);
    const lineY = centerY + radius * Math.sin(sweepAngle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(lineX, lineY);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.stroke();

    requestAnimationFrame(animateRadar);
}

setInterval(fetchFlights, 3000);