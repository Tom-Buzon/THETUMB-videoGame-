// Import configuration
import { PLAYER_CONFIG, ROOM_CONFIG } from './config.js';
// Import Game class
import { Game } from './game.js';

// Initialize game when page loads
let game;

console.log('Main.js loaded - waiting for DOMContentLoaded');

function initializeGame() {
    console.log('Creating Game instance...');
    game = new Game();
    console.log('Game instance created successfully:', game);
    console.log('Starting game loop...');
    game.gameLoop();
    console.log('Game loop started successfully');
}

function restartGame() {
    console.log('Restarting game...');
    
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
    }
    
    // Remove any existing canvas content
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset game variable
    game = null;
    
    // Reinitialize the game
    try {
        initializeGame();
        console.log('Game restarted successfully');
    } catch (error) {
        console.error('Error restarting game:', error);
        console.error('Error stack:', error.stack);
    }
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
        game.render();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Make restartGame globally accessible
window.restartGame = restartGame;