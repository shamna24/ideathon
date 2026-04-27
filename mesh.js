document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('mesh-input');
    const sendBtn = document.getElementById('send-mesh-btn');
    const logDisplay = document.getElementById('log-display');
    const statusIndicator = document.getElementById('status-indicator');
    const historyList = document.getElementById('mesh-history-list');

    const nodes = {
        citizen: document.getElementById('node-citizen'),
        a: document.getElementById('node-a'),
        b: document.getElementById('node-b'),
        responder: document.getElementById('node-responder')
    };

    let history = JSON.parse(localStorage.getItem('resqlink_mesh_history')) || [];

    // Initialize History
    renderHistory();

    sendBtn.addEventListener('click', async () => {
        const message = input.value.trim();
        if (!message) return;

        // Reset UI
        sendBtn.disabled = true;
        clearNodeHighlights();
        logDisplay.innerHTML = '';
        
        await runSimulation(message);

        // Save and cleanup
        saveToHistory(message);
        sendBtn.disabled = false;
        input.value = '';
    });

    async function runSimulation(message) {
        const steps = [
            { id: 'citizen', log: 'Citizen initiating request...', status: 'Originating...' },
            { id: 'a', log: 'Message received at Node A (Mesh Relay)', status: 'Routing via Node A...' },
            { id: 'b', log: 'Forwarded to Node B (Secondary Relay)', status: 'Forwarding to Node B...' },
            { id: 'responder', log: 'Delivered to Emergency Responder', status: 'Delivered!' }
        ];

        for (const step of steps) {
            updateStatus(step.status);
            highlightNode(step.id);
            addLog(step.log);
            await delay(1000);
        }

        const responder = getResponder(message);
        addLog(`ASSIGNED RESPONDER: ${responder}`, 'success');
        updateStatus(`Mission Assigned: ${responder}`);
    }

    function getResponder(message) {
        const upperMsg = message.toUpperCase();
        if (upperMsg.includes('MEDICAL')) return 'Ambulance Team';
        if (upperMsg.includes('FOOD')) return 'Food Supply Team';
        return 'Rescue Team';
    }

    function highlightNode(nodeId) {
        clearNodeHighlights();
        nodes[nodeId].classList.add('active');
    }

    function clearNodeHighlights() {
        Object.values(nodes).forEach(node => node.classList.remove('active'));
    }

    function addLog(text, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
        logDisplay.appendChild(entry);
        logDisplay.scrollTop = logDisplay.scrollHeight;
    }

    function updateStatus(text) {
        statusIndicator.textContent = text;
    }

    function saveToHistory(message) {
        const newEntry = {
            id: Date.now(),
            message: message,
            responder: getResponder(message),
            timestamp: new Date().toLocaleString()
        };
        history.unshift(newEntry);
        localStorage.setItem('resqlink_mesh_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-msg">No previous requests found.</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-card">
                <div class="date">${item.timestamp}</div>
                <div class="msg">"${item.message}"</div>
                <div class="resp">Target: ${item.responder}</div>
            </div>
        `).join('');
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
