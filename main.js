// main.js
import { fetchTokens } from './services/token-service.js';
import { TokenModel } from './models/token-model.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch tokens when page loads
        await fetchTokens();
    } catch (error) {
        showError('Failed to connect to token service: ' + error.message);
    }
});

async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    }
}

function updateTokenList(tokens) {
    const freshTokenList = document.getElementById('freshTokenList');
    const heldTokenList = document.getElementById('heldTokenList');
    
    // Clear existing content
    freshTokenList.innerHTML = '';
    heldTokenList.innerHTML = '';

    tokens.forEach(tokenData => {
        const token = new TokenModel(tokenData);
        const tokenElement = createTokenElement(token);

        // For now, we'll consider a token "held" if it has any trades
        if (token.lastTrade) {
            heldTokenList.appendChild(tokenElement.cloneNode(true));
        } else {
            freshTokenList.appendChild(tokenElement);
        }
    });

    // Scroll fresh tokens to bottom
    freshTokenList.scrollTop = freshTokenList.scrollHeight;
}

function addNewToken(token) {
    const freshTokenList = document.getElementById('freshTokenList');
    const tokenElement = createTokenElement(token);
    freshTokenList.appendChild(tokenElement);

    // Smooth scroll to the new token
    tokenElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function createTokenElement(token) {
    const tokenElement = document.createElement('div');
    tokenElement.className = 'token-item';
    tokenElement.innerHTML = `
        <h3>${token.name} (${token.symbol})</h3>
        <div class="token-details">
            <p><strong>Market Cap:</strong> ${token.getFormattedMarketCap()}</p>
            <p><strong>Liquidity:</strong> ${token.getFormattedLiquidity()}</p>
            <p class="mint-row">
                <strong>Mint:</strong> 
                <span class="mint-address">${token.mint}</span>
                <button class="copy-button" onclick="event.stopPropagation()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </p>
            <p><strong>Pool:</strong> ${token.pool}</p>
        </div>
    `;

    // Add click event to show more details
    tokenElement.addEventListener('click', () => handleTokenClick(token));

    // Add copy button click handler
    const copyButton = tokenElement.querySelector('.copy-button');
    copyButton.addEventListener('click', () => copyToClipboard(token.mint, copyButton));

    return tokenElement;
}

function handleTokenClick(token) {
    console.log('Token clicked:', token);
    // Update the price chart with this token's data
    updatePriceChart(token.marketCapSol);
    
    // Update order book if available
    if (token.recentTrades) {
        updateTradesUI(token.recentTrades);
    }
}

// Function to show error messages
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Export functions that need to be accessed by other modules
export {
    updateTokenList,
    handleTokenClick,
    showError,
    addNewToken
};