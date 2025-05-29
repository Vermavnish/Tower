// Game dimensions
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const GAME_UI_WIDTH = 280;

// Game states
const GAME_STATE = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN',
    BUILDING: 'BUILDING' // When placing a tower
};

// Colors
const COLOR_PATH = '#444';
const COLOR_GRASS = '#3a5e3a';
const COLOR_CORE = '#ff0000';
const COLOR_TOWER_BASE = '#555';
const COLOR_PROJECTILE = '#ffff00';
const COLOR_ENEMY_BASIC = '#666';
const COLOR_ENEMY_FAST = '#00aaff';
const COLOR_ENEMY_TANK = '#ff8800';
const COLOR_RANGE_INDICATOR = 'rgba(255, 255, 255, 0.2)';
const COLOR_HEALTH_BAR_BG = '#333';
const COLOR_HEALTH_BAR_FILL = '#00ff00';
const COLOR_HEALTH_BAR_DAMAGE = '#ff0000';

// Game Mechanics
const INITIAL_MONEY = 100;
const INITIAL_LIVES = 20;
const MAX_WAVES = 10;
const WAVE_INTERVAL = 3000; // ms between enemies in a wave
const MONEY_PER_KILL = 10;
const MONEY_PER_WAVE = 50; // Bonus money at end of wave

// Tower Definitions
const TOWER_TYPES = {
    BASIC: {
        name: 'Basic Tower',
        cost: 50,
        damage: 10,
        range: 150,
        fireRate: 60, // Frames between shots (e.g., 60 = 1 shot/sec)
        projectileSpeed: 8,
        upgradeCostMultiplier: 1.5,
        sellReturnMultiplier: 0.7,
        maxLevel: 3,
        levelUpgrades: {
            1: { damage: 15, range: 170, fireRate: 55 },
            2: { damage: 25, range: 200, fireRate: 45 },
            3: { damage: 40, range: 220, fireRate: 35 }
        }
    },
    FAST: {
        name: 'Fast Tower',
        cost: 80,
        damage: 5,
        range: 120,
        fireRate: 30,
        projectileSpeed: 12,
        upgradeCostMultiplier: 1.6,
        sellReturnMultiplier: 0.7,
        maxLevel: 3,
        levelUpgrades: {
            1: { damage: 8, range: 140, fireRate: 25 },
            2: { damage: 15, range: 160, fireRate: 20 },
            3: { damage: 25, range: 180, fireRate: 15 }
        }
    },
    AOE: { // Area of Effect
        name: 'AOE Tower',
        cost: 120,
        damage: 15,
        range: 100,
        fireRate: 90,
        projectileSpeed: 6,
        aoeRadius: 50, // Radius of splash damage
        upgradeCostMultiplier: 1.7,
        sellReturnMultiplier: 0.7,
        maxLevel: 3,
        levelUpgrades: {
            1: { damage: 20, range: 120, fireRate: 80, aoeRadius: 60 },
            2: { damage: 30, range: 140, fireRate: 70, aoeRadius: 70 },
            3: { damage: 45, range: 160, fireRate: 60, aoeRadius: 80 }
        }
    }
    // Add more tower types (e.g., Slow, Sniper, Stun)
};

// Enemy Definitions
const ENEMY_TYPES = {
    BASIC: {
        name: 'Basic Alien',
        health: 50,
        speed: 1.5,
        value: 10,
        damageToCore: 1,
        color: COLOR_ENEMY_BASIC
    },
    FAST: {
        name: 'Fast Alien',
        health: 30,
        speed: 3,
        value: 15,
        damageToCore: 1,
        color: COLOR_ENEMY_FAST
    },
    TANK: {
        name: 'Tank Alien',
        health: 200,
        speed: 0.8,
        value: 30,
        damageToCore: 2,
        color: COLOR_ENEMY_TANK
    }
    // Add more enemy types (e.g., Flying, Healer, Splitting)
};

// Path definition (coordinates for the enemy path)
const PATH = [
    { x: 0, y: 350 }, // Start off-screen left
    { x: 150, y: 350 },
    { x: 150, y: 100 },
    { x: 400, y: 100 },
    { x: 400, y: 500 },
    { x: 600, y: 500 },
    { x: 600, y: 200 },
    { x: 900, y: 200 },
    { x: 900, y: 600 },
    { x: 1100, y: 600 },
    { x: 1100, y: CANVAS_HEIGHT / 2 }, // Approaching core
    { x: CANVAS_WIDTH + 50, y: CANVAS_HEIGHT / 2 } // End off-screen right (core)
];

// Grid for tower placement (example, adjust based on your desired grid size)
const GRID_SIZE = 50;
const GRID_COLS = CANVAS_WIDTH / GRID_SIZE;
const GRID_ROWS = CANVAS_HEIGHT / GRID_SIZE;
