document.addEventListener('DOMContentLoaded', () => {
    const smsInput = document.getElementById('sms-input');
    const sendBtn = document.getElementById('send-sms-btn');
    const requestsList = document.getElementById('requests-list');
    const pendingCount = document.getElementById('pending-count');
    const emptyState = document.getElementById('empty-state');

    let requests = JSON.parse(localStorage.getItem('resqlink_requests')) || [];

    // Map Initialization
    const map = L.map('map').setView([12.9698, 77.7500], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let markersLayer = L.layerGroup().addTo(map);

    const locations = {
        'WHITEFIELD': [12.9698, 77.7500],
        'INDIRANAGAR': [12.9784, 77.6408],
        'MARATHAHALLI': [12.9591, 77.6974]
    };

    // Initialize UI
    renderRequests();
    renderMarkers();

    // Event Listeners
    sendBtn.addEventListener('click', handleSendSMS);
    smsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendSMS();
    });

    function handleSendSMS() {
        const message = smsInput.value.trim();
        if (!message) return;

        const newRequest = processSMS(message);
        requests.unshift(newRequest); // Add to beginning
        saveToLocalStorage();
        renderRequests();
        renderMarkers();
        
        // Clear input and focus
        smsInput.value = '';
        smsInput.focus();
        
        // Visual feedback
        showNotification('Request processed successfully');
    }

    function processSMS(message) {
        const upperMsg = message.toUpperCase();
        let type = 'General';
        let responder = 'Local Volunteers';
        let className = 'general';
        let color = '#10b981';

        if (upperMsg.includes('MEDICAL')) {
            type = 'Medical';
            responder = 'Ambulance Team';
            className = 'medical';
            color = '#ef4444';
        } else if (upperMsg.includes('FOOD')) {
            type = 'Food';
            responder = 'Food Supply Team';
            className = 'food';
            color = '#f59e0b';
        } else if (upperMsg.includes('FLOOD') || upperMsg.includes('RESCUE')) {
            type = 'Rescue';
            responder = 'Rescue Team';
            className = 'rescue';
            color = '#3b82f6';
        }

        // Determine location
        let coords = locations['WHITEFIELD']; // Default
        for (const loc in locations) {
            if (upperMsg.includes(loc)) {
                coords = locations[loc];
                break;
            }
        }
        
        // If no keyword, pick random sample location
        if (coords === locations['WHITEFIELD'] && !upperMsg.includes('WHITEFIELD')) {
            const locKeys = Object.keys(locations);
            coords = locations[locKeys[Math.floor(Math.random() * locKeys.length)]];
        }

        return {
            id: Date.now(),
            message: message,
            type: type,
            responder: responder,
            className: className,
            status: 'Assigned',
            timestamp: new Date().toLocaleString(),
            coords: coords,
            color: color
        };
    }

    function renderRequests() {
        if (requests.length === 0) {
            emptyState.style.display = 'block';
            requestsList.innerHTML = '';
            requestsList.appendChild(emptyState);
            pendingCount.textContent = '0 Pending';
            return;
        }

        emptyState.style.display = 'none';
        requestsList.innerHTML = '';

        requests.forEach(req => {
            const card = document.createElement('div');
            card.className = `request-card ${req.className} ${req.status === 'Completed' ? 'completed' : ''}`;
            
            card.innerHTML = `
                <div class="request-header">
                    <span class="type-tag">${req.type}</span>
                    <span class="timestamp">${req.timestamp}</span>
                </div>
                <p class="message-text">"${req.message}"</p>
                <div class="assignment-info">
                    <span class="icon">📍</span>
                    <span>Assigned to: <span class="responder-name">${req.responder}</span></span>
                </div>
                <div class="request-footer">
                    <span class="status-badge">${req.status}</span>
                    ${req.status === 'Assigned' ? 
                        `<button class="complete-btn" onclick="updateStatus(${req.id})">Mark as Completed</button>` : 
                        ''
                    }
                </div>
            `;
            requestsList.appendChild(card);
        });

        const pending = requests.filter(r => r.status === 'Assigned').length;
        pendingCount.textContent = `${pending} Pending Request${pending !== 1 ? 's' : ''}`;
    }

    function renderMarkers() {
        markersLayer.clearLayers();
        requests.forEach(req => {
            if (req.coords) {
                const marker = L.circleMarker(req.coords, {
                    radius: 10,
                    fillColor: req.color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });

                marker.bindPopup(`
                    <div style="font-family: 'Outfit', sans-serif;">
                        <strong style="color: ${req.color}">${req.type} Request</strong><br>
                        <p style="margin: 5px 0;">"${req.message}"</p>
                        <small>Status: <strong>${req.status}</strong></small><br>
                        <small>Responder: ${req.responder}</small>
                    </div>
                `);
                
                markersLayer.addLayer(marker);
            }
        });
    }

    window.updateStatus = (id) => {
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
            requests[index].status = 'Completed';
            saveToLocalStorage();
            renderRequests();
            renderMarkers();
        }
    };

    function saveToLocalStorage() {
        localStorage.setItem('resqlink_requests', JSON.stringify(requests));
    }

    function showNotification(text) {
        const originalText = sendBtn.textContent;
        sendBtn.textContent = 'Processed!';
        sendBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            sendBtn.textContent = originalText;
            sendBtn.style.backgroundColor = '';
        }, 1500);
    }
});
