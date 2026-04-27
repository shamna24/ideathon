document.addEventListener('DOMContentLoaded', () => {
    const smsInput = document.getElementById('sms-input');
    const sendBtn = document.getElementById('send-sms-btn');
    const requestsList = document.getElementById('requests-list');
    const pendingCount = document.getElementById('pending-count');
    const emptyState = document.getElementById('empty-state');

    let requests = JSON.parse(localStorage.getItem('resqlink_requests')) || [];

    // Initialize UI
    renderRequests();

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

        if (upperMsg.includes('MEDICAL')) {
            type = 'Medical';
            responder = 'Ambulance Team';
            className = 'medical';
        } else if (upperMsg.includes('FOOD')) {
            type = 'Food';
            responder = 'Food Supply Team';
            className = 'food';
        } else if (upperMsg.includes('FLOOD') || upperMsg.includes('RESCUE')) {
            type = 'Rescue';
            responder = 'Rescue Team';
            className = 'rescue';
        }

        return {
            id: Date.now(),
            message: message,
            type: type,
            responder: responder,
            className: className,
            status: 'Assigned',
            timestamp: new Date().toLocaleString()
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

    window.updateStatus = (id) => {
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
            requests[index].status = 'Completed';
            saveToLocalStorage();
            renderRequests();
        }
    };

    function saveToLocalStorage() {
        localStorage.setItem('resqlink_requests', JSON.stringify(requests));
    }

    function showNotification(text) {
        // Simple visual feedback on button
        const originalText = sendBtn.textContent;
        sendBtn.textContent = 'Processed!';
        sendBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            sendBtn.textContent = originalText;
            sendBtn.style.backgroundColor = '';
        }, 1500);
    }
});
