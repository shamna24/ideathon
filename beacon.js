document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-btn');
    const statusBox = document.getElementById('connection-status');
    const portalContent = document.getElementById('portal-content');
    const form = document.getElementById('beacon-form');
    const requestsList = document.getElementById('requests-list');
    const confirmation = document.getElementById('confirmation-msg');

    let requests = JSON.parse(localStorage.getItem('resqlink_beacon_requests')) || [];

    // Connection Flow
    connectBtn.addEventListener('click', () => {
        statusBox.innerHTML = '<div class="connection-confirmed">Connected to Local Relief Network</div>';
        portalContent.classList.remove('hidden');
        renderRequests();
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const location = document.getElementById('location').value;
        const type = document.getElementById('type').value;
        const message = document.getElementById('message').value;

        const teamMap = {
            'Medical': 'Ambulance',
            'Food': 'Food Team',
            'Rescue': 'Rescue Team'
        };

        const newRequest = {
            id: Date.now(),
            name,
            location,
            type,
            message,
            team: teamMap[type],
            timestamp: new Date().toLocaleString()
        };

        requests.unshift(newRequest);
        localStorage.setItem('resqlink_beacon_requests', JSON.stringify(requests));

        // UI Updates
        form.reset();
        renderRequests();
        showConfirmation();
    });

    function renderRequests() {
        if (requests.length === 0) {
            requestsList.innerHTML = '<p class="empty-msg">No requests sent yet.</p>';
            return;
        }

        requestsList.innerHTML = requests.map(req => `
            <div class="request-card ${req.type.toLowerCase()}">
                <div class="card-header">
                    <span class="card-name">${req.name}</span>
                    <span class="card-type" style="color: var(--${req.type.toLowerCase()})">${req.type}</span>
                </div>
                <div class="card-loc" style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.5rem;">📍 ${req.location}</div>
                <div class="card-msg">"${req.message}"</div>
                <div class="card-team">
                    <span>🛡️ Assigned: <strong>${req.team}</strong></span>
                </div>
            </div>
        `).join('');
    }

    function showConfirmation() {
        confirmation.classList.remove('hidden');
        setTimeout(() => {
            confirmation.classList.add('hidden');
        }, 3000);
    }
});
