// Import configuration
import { PLAYER_CONFIG, ROOM_CONFIG } from './config.js';
// Import Game class
import { Game } from './game.js';

// Initialize game when page loads
let game;

console.log('Main.js loaded - waiting for DOMContentLoaded');

function updateLoadingStatus(message) {
    const loadingStatus = document.getElementById('loadingStatus');
    if (loadingStatus) {
        loadingStatus.textContent = message;
        console.log('Loading status:', message);
    }
}

function initializeGame() {
    console.log('Creating Game instance...');
    updateLoadingStatus('Creating game instance...');
    
    game = new Game();
    // Make game instance globally accessible
    window.game = game;
    console.log('Game instance created successfully:', game);
    
    updateLoadingStatus('Starting game loop...');
    console.log('Starting game loop...');
    game.gameLoop();
    console.log('Game loop started successfully');
    
    // Hide loading screen and show game
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    if (gameContainer) {
        gameContainer.style.display = 'block';
        // Apply initial scaling
        setTimeout(applyCanvasScaling, 100);
    }
    
    updateLoadingStatus('Game ready!');
}

function restartGame() {
    console.log('Restarting game...');
    
    // Show loading screen during restart
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    
    updateLoadingStatus('Restarting game...');
    
    // Clean up existing game if it exists
    if (game) {
        // Cancel any ongoing animation frames
        if (game.animationFrameId) {
            cancelAnimationFrame(game.animationFrameId);
        }
        
        // Clear any intervals or timeouts
        if (game.player && game.player.shootInterval) {
            clearInterval(game.player.shootInterval);
        }
        
        // Clear any pending timeouts in the game
        if (game.timeouts) {
            for (const timeoutId of game.timeouts) {
                clearTimeout(timeoutId);
            }
            game.timeouts.clear();
        }
    }
    
    // Remove any existing canvas content
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset game variable
    game = null;
    
    // Reinitialize the game after a short delay to allow UI to update
    setTimeout(() => {
        try {
            initializeGame();
            console.log('Game restarted successfully');
        } catch (error) {
            console.error('Error restarting game:', error);
            console.error('Error stack:', error.stack);
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired - initializing game');
    try {
        initializeGame();
    } catch (error) {
        console.error('Error initializing game:', error);
        console.error('Error stack:', error.stack);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        // Apply scaling to fit within viewport
        applyCanvasScaling();
        game.render();
    }
});

// Apply scaling to fit canvas within viewport
function applyCanvasScaling() {
    const container = document.getElementById('gameContainer');
    const canvas = document.getElementById('gameCanvas');
    
    if (!container || !canvas) return;
    
    // Get available viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Game dimensions
    const gameWidth = 1400;
    const gameHeight = 1000; // Including HUD
    
    // Calculate scale factors with 50px margin top and bottom
    const availableHeight = viewportHeight - 100; // 50px top + 50px bottom margin
    const scaleX = viewportWidth / gameWidth;
    const scaleY = availableHeight / gameHeight;
    
    // Use the smaller scale to ensure the entire game fits
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate position to center the game
    const scaledWidth = gameWidth * scale;
    const scaledHeight = gameHeight * scale;
    const left = (viewportWidth - scaledWidth) / 2;
    const top = (availableHeight - scaledHeight) / 2 + 50; // Add 50px top margin
    
    // Apply scaling and positioning
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'top left';
    container.style.left = `${left / scale}px`;
    container.style.top = `${top / scale}px`;
    
    // Store scale factors for mouse position calculation
    if (window.game) {
        window.game.scaleFactor = scale;
    }
    
    console.log('Applied scaling:', scale, 'Position:', left, top, 'Viewport:', viewportWidth, 'x', viewportHeight);
}

// Apply initial scaling when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Apply initial scaling after a short delay to ensure elements are rendered
    setTimeout(applyCanvasScaling, 100);
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Make restartGame globally accessible
window.restartGame = restartGame;