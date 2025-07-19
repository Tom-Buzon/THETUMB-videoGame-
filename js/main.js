// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game...');
    
    try {
        const game = new Game();
        console.log('Game initialized successfully');
        
        // Start game loop
        game.gameLoop();
        console.log('Game loop started');
        
    } catch (error) {
        console.error('Error starting game:', error);
    }
    
    // Prevent context menu on canvas
    document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => e.preventDefault());
});