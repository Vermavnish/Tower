// main.js - Entry point for the game

let game; // Global reference to the game object

window.onload = () => {
    game = new Game();
    // Initial UI update or show main menu if you have one
    game.ui.updateAllUI();
    // game.startGame(); // Uncomment to auto-start, otherwise rely on UI button
};
