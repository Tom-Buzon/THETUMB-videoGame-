// Initialize game when page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    game.gameLoop();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        game.render();
    }
});