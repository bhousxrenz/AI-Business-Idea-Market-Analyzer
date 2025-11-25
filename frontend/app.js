// Application State
let chatHistory = [];
let currentChatId = null;
let messages = [];
let sidebarOpen = true;

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : ''; // Vercel will handle routing

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 AI Business Analyzer initialized');
    loadChatHistory();
    checkAPIHealth();
    
    // Focus input on load
    document.getElementById('messageInput').focus();
});

// Check API Health
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        const statusEl = document.getElementById('apiStatus');
        if (data.api_key_configured) {
            statusEl.innerHTML = '<span class="status-dot"></span><span class="status-text">Connected</span>';
            console.log('✅ API Status: Connected');
        } else {
            statusEl.innerHTML = '<span class="status-dot" style="background: #ef4444;"></span><span class="status-text">API Key Missing</span>';
            console.warn('⚠️ API Key not configured');
        }
    } catch (error) {
        console.warn('⚠️ API health check failed:', error);
        const statusEl = document.getElementById('apiStatus');
        statusEl.innerHTML = '<span class="status-dot" style="background: #ef4444;"></span><span class="status-text">Offline</span>';
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebarOpen = !sidebarOpen;
    
    if (!sidebarOpen) {
        sidebar.classList.add('hidden');
    } else {
        sidebar.classList.remove('hidden');
    }
}

// Start New Chat
function startNewChat() {
    messages = [];
    currentChatId = null;
    
    const container = document.getElementById('messagesContainer');
    container.innerHTML = `
        <div class="welcome-message">
            <div class="message assistant-message">
                <div class="message-avatar">💡</div>
                <div class="message-content">
                    <h2>Hello! I'm your AI Business Analyzer.</h2>
                    <p>I can help you with:</p>
                    <ul class="feature-list">
                        <li>💡 Generate unique business ideas</li>
                        <li>📊 Analyze market potential</li>
                        <li>🎯 Evaluate competitors</li>
                        <li>💰 Create financial projections</li>
                        <li>📈 Develop marketing strategies</li>
                        <li>📁 Analyze your business data</li>
                    </ul>
                    <p class="cta-text">What would you like to explore today?</p>
                </div>
            </div>
        </div>
    `;
    
    // Update chat history display
    loadChatHistory();
    
    // Focus input
    document.getElementById('messageInput').focus();
    
    console.log('🆕 Started new chat');
}

// Handle Key Press
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send Message to Backend
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Disable input while processing
    input.disabled = true;
    document.getElementById('sendBtn').disabled = true;
    
    // Add user message to UI
    addMessageToUI('user', message);
    input.value = '';
    
    // Show loading
    showLoading();
    
    try {
        // Send to backend with conversation history
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                history: messages.slice(-10) // Send last 10 messages for context
            })
        });
        
        const data = await response.json();
        
        // Remove loading
        removeLoading();
        
        if (data.success) {
            addMessageToUI('assistant', data.response);
            saveChat();
        } else {
            addMessageToUI('assistant', `❌ Error: ${data.error}\n\nPlease ensure your API key is configured in Vercel environment variables.`);
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        removeLoading();
        addMessageToUI('assistant', '❌ Unable to connect to the AI service.\n\nPlease check:\n• Backend is running\n• GOOGLE_API_KEY is set in environment variables\n• Network connection is stable');
    } finally {
        // Re-enable input
        input.disabled = false;
        document.getElementById('sendBtn').disabled = false;
        input.focus();
    }
}

// Add Message to UI
function addMessageToUI(role, content) {
    const container = document.getElementById('messagesContainer');
    
    // Remove welcome message if it exists
    const welcomeMsg = container.querySelector('.welcome-message');
    if (welcomeMsg && messages.length === 0) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = role === 'assistant' ? '💡' : '👤';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${formatMessage(content)}</div>
    `;
    
    container.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    
    // Add to messages array
    messages.push({ role, content, timestamp: new Date().toISOString() });
}

// Format Message Content
function formatMessage(content) {
    // Convert markdown-style formatting
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/\n/g, '<br>') // Line breaks
        .replace(/###\s(.*?)(<br>|$)/g, '<h3>$1</h3>') // H3 headers
        .replace(/##\s(.*?)(<br>|$)/g, '<h2>$1</h2>') // H2 headers
        .replace(/•/g, '&bull;'); // Bullets
    
    return formatted;
}

// Show Loading Indicator
function showLoading() {
    const container = document.getElementById('messagesContainer');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant-message';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = `
        <div class="message-avatar">💡</div>
        <div class="message-content">
            <div class="loading-indicator">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    container.appendChild(loadingDiv);
    loadingDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Remove Loading Indicator
function removeLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) {
        loading.remove();
    }
}

// Handle File Upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['.txt', '.csv', '.json'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
        alert('Please upload a TXT, CSV, or JSON file');
        return;
    }
    
    addMessageToUI('user', `📎 Uploaded file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-file`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Hide loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';
        
        if (data.success) {
            addMessageToUI('assistant', data.analysis);
            
            // Add charts if the data has numeric content
            if (data.has_charts) {
                setTimeout(() => {
                    addFinancialCharts();
                }, 500);
            }
            
            saveChat();
        } else {
            addMessageToUI('assistant', `❌ Error analyzing file: ${data.error}`);
        }
    } catch (error) {
        console.error('❌ File upload error:', error);
        document.getElementById('loadingOverlay').style.display = 'none';
        addMessageToUI('assistant', '❌ Error uploading file. Please ensure the backend is running and try again.');
    }
    
    // Reset file input
    event.target.value = '';
}

// Add Financial Charts
function addFinancialCharts() {
    const container = document.getElementById('messagesContainer');
    const chartId = Date.now();
    
    const chartsDiv = document.createElement('div');
    chartsDiv.className = 'charts-wrapper';
    chartsDiv.innerHTML = `
        <div class="chart-container">
            <div class="chart-title">📈 Revenue & Expenses Trend</div>
            <canvas id="lineChart_${chartId}" width="400" height="200"></canvas>
        </div>
        <div class="chart-container">
            <div class="chart-title">💰 Monthly Profit Analysis</div>
            <canvas id="barChart_${chartId}" width="400" height="200"></canvas>
        </div>
    `;
    container.appendChild(chartsDiv);
    
    // Scroll to charts
    chartsDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    
    // Create charts after DOM is ready
    setTimeout(() => {
        const lineCanvas = document.getElementById(`lineChart_${chartId}`);
        const barCanvas = document.getElementById(`barChart_${chartId}`);
        if (lineCanvas) createLineChart(lineCanvas);
        if (barCanvas) createBarChart(barCanvas);
    }, 100);
}

// Create Line Chart
function createLineChart(canvas) {
    // Generate sample data (in production, this would come from the uploaded file)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = months.map((_, i) => 15000 + Math.random() * 5000 + i * 1500);
    const expenseData = months.map((_, i) => 8000 + Math.random() * 3000 + i * 800);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: '#fff',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#9ca3af',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

// Create Bar Chart
function createBarChart(canvas) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const profitData = months.map((_, i) => 7000 + Math.random() * 4000 + i * 700);
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Profit',
                data: profitData,
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: '#fff',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Profit: $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#9ca3af',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

// Save Chat to LocalStorage
function saveChat() {
    if (messages.length <= 1) return; // Don't save if only welcome message
    
    const chatId = currentChatId || `chat_${Date.now()}`;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg 
        ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '')
        : 'New Chat';
    
    const chat = {
        id: chatId,
        title: title,
        messages: messages,
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(chatId, JSON.stringify(chat));
        currentChatId = chatId;
        loadChatHistory();
        console.log('💾 Chat saved:', chatId);
    } catch (error) {
        console.error('❌ Error saving chat:', error);
    }
}

// Load Chat History from LocalStorage
function loadChatHistory() {
    const historyList = document.getElementById('chatHistoryList');
    chatHistory = [];
    
    // Get all chats from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_')) {
            try {
                const chat = JSON.parse(localStorage.getItem(key));
                if (chat && chat.id && chat.messages) {
                    chatHistory.push(chat);
                }
            } catch (error) {
                console.error('Error loading chat:', key, error);
            }
        }
    }
    
    // Sort by timestamp (newest first)
    chatHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Render chat history
    if (chatHistory.length === 0) {
        historyList.innerHTML = '<div style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px;">No chat history yet</div>';
    } else {
        historyList.innerHTML = chatHistory.map(chat => `
            <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" onclick="loadChat('${chat.id}')">
                <div>
                    <div class="chat-title">${escapeHtml(chat.title)}</div>
                    <div class="chat-date">${formatDate(chat.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
}

// Load Specific Chat
function loadChat(chatId) {
    try {
        const chatData = localStorage.getItem(chatId);
        if (!chatData) return;
        
        const chat = JSON.parse(chatData);
        messages = chat.messages || [];
        currentChatId = chatId;
        
        // Clear and rebuild messages container
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        // Add all messages
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.role}-message`;
            const avatar = msg.role === 'assistant' ? '💡' : '👤';
            messageDiv.innerHTML = `
                <div class="message-avatar">${avatar}</div>
                <div class="message-content">${formatMessage(msg.content)}</div>
            `;
            container.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        // Update history display
        loadChatHistory();
        
        console.log('📂 Loaded chat:', chatId);
    } catch (error) {
        console.error('❌ Error loading chat:', error);
    }
}

// Helper Functions
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Log initialization
console.log('✅ App initialized successfully');
console.log('📍 API Base URL:', API_BASE_URL || 'Same origin');
