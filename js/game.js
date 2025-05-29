// Main Game object and state management

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.gameState = GAME_STATE.MENU; // Initial state

        this.money = INITIAL_MONEY;
        this.lives = INITIAL_LIVES;
        this.currentWave = 0;
        this.maxWaves = MAX_WAVES;

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.explosions = []; // For visual effects

        this.selectedTower = null; // Currently selected tower for upgrade/sell
        this.towerBeingPlaced = null; // Tower currently being dragged for placement

        this.lastFrameTime = 0;
        this.deltaTime = 0; // Time in seconds since last frame
        this.animationFrameId = null;

        this.initEventListeners();
        this.ui = new UIManager(this); // UIManager instance
        this.path = new GamePath(PATH); // GamePath instance
        this.waveManager = new WaveManager(this); // WaveManager instance
    }

    initEventListeners() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

        document.getElementById('startGameButton').addEventListener('click', () => {
            if (this.gameState === GAME_STATE.MENU || this.gameState === GAME_STATE.PLAYING) {
                this.startNextWave();
            }
        });
        document.getElementById('restartGameButton').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });

        // Event listeners for tower selection in UI
        document.querySelectorAll('.tower-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const towerType = e.currentTarget.dataset.towerType;
                this.selectTowerForPlacement(towerType);
            });
        });

        document.getElementById('upgradeTowerButton').addEventListener('click', () => {
            if (this.selectedTower) {
                this.upgradeSelectedTower();
            }
        });

        document.getElementById('sellTowerButton').addEventListener('click', () => {
            if (this.selectedTower) {
                this.sellSelectedTower();
            }
        });
    }

    startGame() {
        this.gameState = GAME_STATE.PLAYING;
        this.resetGame(); // Ensure game is clean
        this.ui.updateAllUI();
        this.gameLoop(0); // Start the loop
    }

    resetGame() {
        cancelAnimationFrame(this.animationFrameId);
        this.money = INITIAL_MONEY;
        this.lives = INITIAL_LIVES;
        this.currentWave = 0;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.explosions = [];
        this.selectedTower = null;
        this.towerBeingPlaced = null;
        this.waveManager.reset();
        this.ui.hideOverlayScreens();
        this.ui.updateSelectedTowerInfo(null);
        this.ui.updateAllUI();
    }

    gameLoop(currentTime) {
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background elements (path, grass, core)
        this.path.draw(this.ctx);
        this.drawCore();

        if (this.gameState === GAME_STATE.PLAYING || this.gameState === GAME_STATE.BUILDING) {
            this.update();
            this.draw();
        } else if (this.gameState === GAME_STATE.GAME_OVER) {
            this.ui.showGameOverScreen("You ran out of lives!");
        } else if (this.gameState === GAME_STATE.WIN) {
            this.ui.showGameWinScreen();
        }

        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.deltaTime));
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isAtEnd()) {
                this.lives -= enemy.damageToCore;
                this.ui.updateLives(this.lives);
                if (this.lives <= 0) {
                    this.gameState = GAME_STATE.GAME_OVER;
                }
                return false; // Remove enemy
            }
            return enemy.currentHealth > 0; // Remove dead enemies
        });

        // Update towers
        this.towers.forEach(tower => tower.update(this.enemies, this.deltaTime));

        // Update projectiles
        this.projectiles.forEach(proj => proj.update(this.deltaTime));
        this.projectiles = this.projectiles.filter(proj => {
            if (!proj.target || proj.target.currentHealth <= 0 || proj.hit) {
                return false; // Remove if target is dead or projectile hit
            }
            // Check for collision with target
            if (distance(proj.x, proj.y, proj.target.x, proj.target.y) < proj.target.size / 2 + proj.radius) {
                proj.hit = true;
                this.applyDamage(proj.target, proj.damage, proj.aoeRadius, proj.x, proj.y);
                return false; // Remove projectile
            }
            return true;
        });

        // Update explosions (for AOE effects or visual feedback)
        this.explosions.forEach(exp => exp.update(this.deltaTime));
        this.explosions = this.explosions.filter(exp => !exp.isFinished);

        // Update wave manager
        this.waveManager.update(this.deltaTime);

        // Check for wave completion
        if (this.enemies.length === 0 && this.waveManager.isWaveFinishedSpawning() && this.gameState === GAME_STATE.PLAYING) {
            if (this.currentWave < this.maxWaves) {
                this.money += MONEY_PER_WAVE;
                this.ui.updateMoney(this.money);
                // Optional: show "Wave Clear" message, wait for player to start next wave
                document.getElementById('startGameButton').textContent = 'Start Next Wave';
                document.getElementById('startGameButton').style.display = 'block';
            } else {
                this.gameState = GAME_STATE.WIN;
            }
        }
    }

    draw() {
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw towers
        this.towers.forEach(tower => tower.draw(this.ctx));

        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(this.ctx));

        // Draw explosions
        this.explosions.forEach(exp => exp.draw(this.ctx));

        // Draw tower being placed (if any)
        if (this.towerBeingPlaced) {
            this.towerBeingPlaced.draw(this.ctx, true); // Draw with range indicator
        }
    }

    drawCore() {
        this.ctx.fillStyle = COLOR_CORE;
        this.ctx.beginPath();
        this.ctx.arc(CANVAS_WIDTH + 15, CANVAS_HEIGHT / 2, 30, 0, Math.PI * 2); // Slightly off-screen to the right
        this.ctx.fill();
        this.ctx.closePath();
    }

    addMoney(amount) {
        this.money += amount;
        this.ui.updateMoney(this.money);
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.ui.updateMoney(this.money);
            return true;
        }
        return false;
    }

    applyDamage(target, damage, aoeRadius = 0, hitX = 0, hitY = 0) {
        target.takeDamage(damage);
        if (aoeRadius > 0) {
            this.enemies.forEach(enemy => {
                if (enemy !== target && distance(hitX, hitY, enemy.x, enemy.y) < aoeRadius) {
                    enemy.takeDamage(damage * 0.5); // AOE damage is often reduced
                }
            });
            this.explosions.push(new Explosion(hitX, hitY, aoeRadius, 0.2)); // Visual explosion
        }

        if (target.currentHealth <= 0) {
            this.addMoney(target.value);
        }
    }

    startNextWave() {
        if (this.gameState === GAME_STATE.PLAYING || this.gameState === GAME_STATE.BUILDING) {
            if (this.currentWave < this.maxWaves) {
                this.currentWave++;
                this.ui.updateWave(this.currentWave);
                this.waveManager.startWave(this.currentWave);
                document.getElementById('startGameButton').style.display = 'none'; // Hide button during wave
                this.towerBeingPlaced = null; // Clear any pending tower placement
                this.canvas.classList.remove('placing-tower');
                this.selectedTower = null;
                this.ui.updateSelectedTowerInfo(null);
            }
        }
    }

    // --- Tower Placement Logic ---
    selectTowerForPlacement(type) {
        const towerDef = TOWER_TYPES[type.toUpperCase()];
        if (!towerDef) return;

        if (this.money >= towerDef.cost) {
            this.towerBeingPlaced = new Tower(0, 0, towerDef.name, towerDef.cost, towerDef.damage, towerDef.range, towerDef.fireRate, towerDef.projectileSpeed, type, towerDef.aoeRadius);
            this.gameState = GAME_STATE.BUILDING;
            this.canvas.classList.add('placing-tower');
            this.ui.deselectTowerButtons();
            document.querySelector(`.tower-button[data-tower-type="${type}"]`).classList.add('selected');
        } else {
            console.log("Not enough money for " + towerDef.name);
            // Add UI feedback: flash money red, or show a message
        }
    }

    handleMouseMove(event) {
        if (this.towerBeingPlaced) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Snap to grid for placement
            const gridX = Math.floor(mouseX / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
            const gridY = Math.floor(mouseY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

            this.towerBeingPlaced.x = gridX;
            this.towerBeingPlaced.y = gridY;

            // Check if valid placement (not on path, not overlapping other towers)
            const isValid = this.isPlacementValid(gridX, gridY, this.towerBeingPlaced.size);
            this.towerBeingPlaced.isValidPlacement = isValid;
        }
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (this.gameState === GAME_STATE.BUILDING && this.towerBeingPlaced) {
            // Attempt to place the tower
            const gridX = Math.floor(clickX / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
            const gridY = Math.floor(clickY / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

            if (this.isPlacementValid(gridX, gridY, this.towerBeingPlaced.size)) {
                if (this.spendMoney(this.towerBeingPlaced.cost)) {
                    const newTower = new Tower(gridX, gridY, this.towerBeingPlaced.name, this.towerBeingPlaced.cost,
                                               this.towerBeingPlaced.damage, this.towerBeingPlaced.range,
                                               this.towerBeingPlaced.fireRate, this.towerBeingPlaced.projectileSpeed,
                                               this.towerBeingPlaced.type, this.towerBeingPlaced.aoeRadius);
                    this.towers.push(newTower);
                    this.towerBeingPlaced = null; // Tower placed
                    this.gameState = GAME_STATE.PLAYING; // Return to playing state
                    this.canvas.classList.remove('placing-tower');
                    this.ui.deselectTowerButtons();
                } else {
                    console.log("Not enough money to place this tower!");
                }
            } else {
                console.log("Invalid placement location!");
                // Optionally give visual feedback for invalid placement
            }
        } else if (this.gameState === GAME_STATE.PLAYING) {
            // Select existing tower
            let clickedOnTower = false;
            for (let i = 0; i < this.towers.length; i++) {
                const tower = this.towers[i];
                if (distance(clickX, clickY, tower.x, tower.y) < tower.size / 2) {
                    this.selectedTower = tower;
                    this.ui.updateSelectedTowerInfo(tower);
                    clickedOnTower = true;
                    break;
                }
            }
            if (!clickedOnTower) {
                this.selectedTower = null;
                this.ui.updateSelectedTowerInfo(null);
            }
        }
    }

    isPlacementValid(x, y, size) {
        // 1. Check if on path
        if (this.path.isPointOnPath(x, y, size / 2 + 5)) { // Add a small buffer
            return false;
        }

        // 2. Check if overlapping existing towers
        for (const tower of this.towers) {
            if (distance(x, y, tower.x, tower.y) < (size / 2 + tower.size / 2)) {
                return false;
            }
        }

        // 3. Check if within canvas boundaries (excluding UI sidebar)
        if (x - size / 2 < 0 || x + size / 2 > CANVAS_WIDTH || y - size / 2 < 0 || y + size / 2 > CANVAS_HEIGHT) {
            return false;
        }

        return true;
    }

    upgradeSelectedTower() {
        if (!this.selectedTower) return;

        const towerDef = TOWER_TYPES[this.selectedTower.type.toUpperCase()];
        if (!towerDef) return;

        const currentLevel = this.selectedTower.level;
        const nextLevel = currentLevel + 1;

        if (nextLevel > towerDef.maxLevel) {
            console.log("Tower is already max level!");
            return;
        }

        const upgradeCost = Math.round(towerDef.cost * Math.pow(towerDef.upgradeCostMultiplier, currentLevel));
        if (this.spendMoney(upgradeCost)) {
            this.selectedTower.upgrade(towerDef.levelUpgrades[nextLevel]);
            this.ui.updateSelectedTowerInfo(this.selectedTower); // Refresh UI
            console.log(`Upgraded ${this.selectedTower.name} to level ${this.selectedTower.level}`);
        } else {
            console.log("Not enough money to upgrade!");
        }
    }

    sellSelectedTower() {
        if (!this.selectedTower) return;

        const towerDef = TOWER_TYPES[this.selectedTower.type.toUpperCase()];
        if (!towerDef) return;

        const sellAmount = Math.round(this.selectedTower.totalCost * towerDef.sellReturnMultiplier);
        this.addMoney(sellAmount);

        // Remove tower from array
        this.towers = this.towers.filter(t => t !== this.selectedTower);
        this.selectedTower = null;
        this.ui.updateSelectedTowerInfo(null); // Clear UI
        console.log(`Sold tower for ${sellAmount} money.`);
    }
}
