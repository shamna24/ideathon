document.addEventListener('DOMContentLoaded', () => {
    const feed = document.getElementById('unified-feed');
    const totalEl = document.getElementById('total-count');
    const pendingEl = document.getElementById('pending-count');
    const completedEl = document.getElementById('completed-count');
    const searchInput = document.getElementById('search-input');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let allData = [];
    let currentFilter = 'all';

    // Initial Load
    refreshData();

    // Event Listeners
    searchInput.addEventListener('input', renderFeed);
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.tab;
            renderFeed();
        });
    });

    function refreshData() {
        const smsData = JSON.parse(localStorage.getItem('resqlink_requests')) || [];
        const meshData = JSON.parse(localStorage.getItem('resqlink_mesh_history')) || [];
        const beaconData = JSON.parse(localStorage.getItem('resqlink_beacon_requests')) || [];

        // Normalize SMS Data
        const normalizedSMS = smsData.map(item => ({
            id: `sms-${item.id}`,
            source: 'sms',
            title: item.type,
            message: item.message,
            timestamp: item.timestamp,
            status: item.status, // Assigned or Completed
            responder: item.responder,
            rawDate: item.id // Use ID as proxy for date sorting
        }));

        // Normalize Mesh Data
        const normalizedMesh = meshData.map(item => ({
            id: `mesh-${item.id}`,
            source: 'mesh',
            title: 'Mesh Relay',
            message: item.message,
            timestamp: item.timestamp,
            status: 'Completed', // Mesh simulation finishes immediately
            responder: item.responder,
            rawDate: item.id
        }));

        // Normalize Beacon Data
        const normalizedBeacon = beaconData.map(item => ({
            id: `beacon-${item.id}`,
            source: 'beacon',
            title: `Beacon: ${item.name}`,
            message: item.message,
            timestamp: item.timestamp,
            status: 'Assigned', // Beacon requests stay active
            responder: item.team,
            rawDate: item.id
        }));

        allData = [...normalizedSMS, ...normalizedMesh, ...normalizedBeacon]
            .sort((a, b) => b.rawDate - a.rawDate);

        updateStats();
        renderFeed();
    }

    function renderFeed() {
        const searchTerm = searchInput.value.toLowerCase();
        
        const filtered = allData.filter(item => {
            const matchesTab = currentFilter === 'all' || item.source === currentFilter;
            const matchesSearch = item.message.toLowerCase().includes(searchTerm) || 
                                item.title.toLowerCase().includes(searchTerm) ||
                                item.responder.toLowerCase().includes(searchTerm);
            return matchesTab && matchesSearch;
        });

        if (filtered.length === 0) {
            feed.innerHTML = '<div class="empty-state">No matching requests found.</div>';
            return;
        }

        feed.innerHTML = filtered.map(item => `
            <div class="unified-card">
                <div class="source-tag ${item.source}">
                    <i>${getSourceIcon(item.source)}</i>
                    <span>${item.source}</span>
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <span class="request-title">${item.title}</span>
                        <span class="request-meta">${item.timestamp}</span>
                    </div>
                    <div class="request-message">"${item.message}"</div>
                    <div class="card-footer">
                        <div class="status-indicator">
                            <span class="status-dot ${item.status === 'Completed' ? 'completed' : 'pending'}"></span>
                            <span>${item.status === 'Assigned' ? 'Pending Action' : 'Completed'}</span>
                        </div>
                        <div class="responder-tag">🛡️ ${item.responder}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function updateStats() {
        totalEl.textContent = allData.length;
        pendingEl.textContent = allData.filter(i => i.status === 'Assigned').length;
        completedEl.textContent = allData.filter(i => i.status === 'Completed').length;
    }

    function getSourceIcon(source) {
        if (source === 'sms') return '💬';
        if (source === 'mesh') return '📡';
        if (source === 'beacon') return '📍';
        return '❓';
    }
});
