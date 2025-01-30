// services/token-service.js
import { updateTokenList, showError, addNewToken } from '../main.js';
import { TokenModel } from '../models/token-model.js';

// Keep track of known tokens
const knownTokens = new Map();

export async function fetchTokens() {
    try {
        const ws = new WebSocket('wss://pumpportal.fun/api/data');

        let isReconnecting = false;
        const reconnectInterval = 5000;

        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('Received:', data);
                
                if (data.txType === 'create') {
                    // New token created
                    const token = new TokenModel(data);
                    knownTokens.set(token.mint, token);
                    addNewToken(token);
                    // Update the full list
                    updateTokenList(Array.from(knownTokens.values()));
                } else if (data.type === 'trade') {
                    // Handle trade events
                    updateTradesUI(data.trades);
                    // Update token data if we have it
                    if (data.mint && knownTokens.has(data.mint)) {
                        const token = knownTokens.get(data.mint);
                        token.lastTrade = data;
                        updateTokenList(Array.from(knownTokens.values()));
                    }
                } else if (data.type === 'token_created') {
                    // Handle token creation events
                    notifyNewTokenCreated(data.token);
                } else if (data.type === 'token_list') {
                    // Handle initial token list
                    updateTokenList(data.tokens);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                showError('Error processing message: ' + error.message);
            }
        };

        ws.onopen = function() {
            console.log('WebSocket connection opened');
            isReconnecting = false;
            
            // Subscribe to events
            subscribeToEvents(ws);
        };

        ws.onclose = function() {
            console.log('WebSocket connection closed');
            
            if (!isReconnecting) {
                isReconnecting = true;
                showError('Connection lost. Attempting to reconnect...');
                
                setTimeout(() => {
                    console.log('Attempting to reconnect...');
                    fetchTokens();
                }, reconnectInterval);
            }
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            showError('WebSocket error: ' + error.message);
        };

    } catch (error) {
        console.error('Error in fetchTokens:', error);
        showError('Failed to connect: ' + error.message);
        throw error;
    }
}

function subscribeToEvents(ws) {
    // Subscribe to new token events
    ws.send(JSON.stringify({
        method: "subscribeNewToken"
    }));

    // Subscribe to token creation events
    ws.send(JSON.stringify({
        method: "subscribeTokenCreated"
    }));

    // Subscribe to token trade events
    ws.send(JSON.stringify({
        method: "subscribeTokenTrade",
        keys: []
    }));

    // Subscribe to account trade events
    ws.send(JSON.stringify({
        method: "subscribeAccountTrade", 
        keys: []
    }));
}

function notifyNewTokenCreated(token) {
    showError(`New token created: ${token.name} (${token.symbol})`);
}

function updateTradesUI(trades) {
    const orderBookDiv = document.getElementById('orderBook');
    if (!orderBookDiv) return;

    orderBookDiv.innerHTML = trades.map(trade => 
        `<div class="trade-item ${trade.side}">
            <span>${trade.side.toUpperCase()}</span>
            <span>${trade.amount} @ ${trade.price} SOL</span>
        </div>`
    ).join('');
}

// Example HTML elements for demonstration
if (typeof document !== 'undefined') {
    const container = document.body;
    
    // Add a div to display new token notifications
    const notificationDiv = document.createElement('div');
    notificationDiv.id = 'notification';
    notificationDiv.style.position = 'fixed';
    notificationDiv.style.top = '10px';
    notificationDiv.style.left = '10px';
    container.appendChild(notificationDiv);

    // Add a div to display trade list
    const tradesDiv = document.createElement('div');
    tradesDiv.id = 'orderBook';
    tradesDiv.style.position = 'fixed';
    tradesDiv.style.top = '70px';
    tradesDiv.style.left = '10px';
    container.appendChild(tradesDiv);
}

// Example of unsubscribing after a certain time
setTimeout(() => {
    // Unsubscribe from token trade events
    ws.send(JSON.stringify({
        method: "unsubscribeTokenTrade",
        keys: []
    }));
}, 10000); // After 10 seconds

// Example of dynamically adding new subscriptions
function addNewSubscription() {
    const newKey = prompt('Enter a new token key to subscribe:');
    if (newKey) {
        ws.send(JSON.stringify({
            method: "subscribeTokenTrade",
            keys: [newKey]
        }));
    }
}

// Example of handling user input for dynamic subscriptions
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addNewSubscription();
        }
    });
}