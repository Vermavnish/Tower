// Manages all UI elements and their updates

class UIManager {
    constructor(game) {
        this.game = game;

        this.waveCounter = document.getElementById('waveCounter');
        this.maxWaves = document.getElementById('maxWaves');
        this.moneyDisplay = document.getElementById('moneyDisplay');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.startGameButton = document.getElementById('startGameButton');

        this.towerSelectionButtons = document.querySelectorAll('.tower-button');
        this.selectedTowerInfoPanel = document.getElementById('selectedTowerInfo');
        this.selectedTowerType = document.getElementById('selectedTowerType');
        this.selectedTowerLevel = document.getElementById('selectedTowerLevel');
        this.selectedTowerDamage = document.getElementById('selectedTowerDamage');
        this.selectedTowerRange = document.getElementById('selectedTowerRange');
        this.selectedTowerRate = document.getElementById('selectedTowerRate');
        this.upgradeTowerButton = document.getElementById('upgradeTowerButton');
        this.sellTowerButton = document.getElementById('sellTowerButton');
        this.upgradeCostDisplay = document.getElementById('upgradeCost');
        this.sellAmountDisplay = document.getElementById('sellAmount');

        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.gameWinScreen = document.getElementById('gameWinScreen');

        this.maxWaves.textContent = MAX_WAVES;
    }

    updateWave(waveNumber) {
        this.waveCounter.textContent = waveNumber;
    }

    updateMoney(money) {
        this.moneyDisplay.textContent = money;
        this.updateTowerButtonStates();
    }

    updateLives(lives) {
        this.livesDisplay.textContent = lives;
    }

    updateAllUI() {
        this.updateWave(this.game.currentWave);
        this.updateMoney(this.game.money);
        this.updateLives(this.game.lives);
        this.updateTowerButtonStates();
    }

    updateTowerButtonStates() {
        this.towerSelectionButtons.forEach(button => {
            const type = button.dataset.towerType;
            const towerDef = TOWER_TYPES[type.toUpperCase()];
            if (this.game.money >= towerDef.cost) {
                button.classList.remove('disabled');
                button.querySelector('span').style.color = '#b0b0e0';
            } else {
                button.classList.add('disabled');
                button.querySelector('span').style.color = '#6a6a6a'; // Grey out text
            }
        });
    }

    deselectTowerButtons() {
        this.towerSelectionButtons.forEach(button => {
            button.classList.remove('selected');
        });
    }

    updateSelectedTowerInfo(tower) {
        if (tower) {
            this.selectedTowerInfoPanel.style.display = 'block';
            this.selectedTowerType.textContent = tower.name;
            this.selectedTowerLevel.textContent = tower.level;
            this.selectedTowerDamage.textContent = tower.damage;
            this.selectedTowerRange.textContent = tower.range;
            this.selectedTowerRate.textContent = `${(60 / tower.fireRate).toFixed(1)} shots/sec`;

            const towerDef = TOWER_TYPES[tower.type.toUpperCase()];
            const nextLevel = tower.level + 1;

            if (nextLevel <= towerDef.maxLevel) {
                const upgradeCost = Math.round(towerDef.cost * Math.pow(towerDef.upgradeCostMultiplier, tower.level));
                this.upgradeCostDisplay.textContent = upgradeCost;
                this.upgradeTowerButton.style.display = 'inline-block';
                if (this.game.money >= upgradeCost) {
                    this.upgradeTowerButton.classList.remove('disabled');
                } else {
                    this.upgradeTowerButton.classList.add('disabled');
                }
            } else {
                this.upgradeTowerButton.style.display = 'none';
                this.selectedTowerLevel.textContent += ' (Max)';
            }

            const sellAmount = Math.round(tower.totalCost * towerDef.sellReturnMultiplier);
            this.sellAmountDisplay.textContent = sellAmount;
            this.sellTowerButton.style.display = 'inline-block';

        } else {
            this.selectedTowerInfoPanel.style.display = 'none';
        }
    }

    showGameOverScreen(message) {
        this.gameOverMessage.textContent = message;
        this.gameOverScreen.style.display = 'flex';
    }

    showGameWinScreen() {
        this.gameWinScreen.style.display = 'flex';
    }

    hideOverlayScreens() {
        this.gameOverScreen.style.display = 'none';
        this.gameWinScreen.style.display = 'none';
    }
}
