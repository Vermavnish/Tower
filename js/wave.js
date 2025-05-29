// Manages enemy waves

class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWaveNumber = 0;
        this.enemiesToSpawn = [];
        this.spawnInterval = null;
        this.enemiesSpawnedThisWave = 0;
        this.isSpawning = false;
        this.waveDefinitions = this.generateWaveDefinitions();
    }

    // Define wave composition (can be dynamic or static)
    generateWaveDefinitions() {
        const waves = [];
        // Wave 1
        waves.push({
            enemyTypes: [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 2 }
            ],
            spawnDelay: WAVE_INTERVAL // Milliseconds between enemy spawns
        });
        // Wave 2
        waves.push({
            enemyTypes: [
                { type: 'basic', count: 15 },
                { type: 'fast', count: 5 }
            ],
            spawnDelay: WAVE_INTERVAL * 0.9
        });
        // Wave 3
        waves.push({
            enemyTypes: [
                { type: 'basic', count: 10 },
                { type: 'fast', count: 8 },
                { type: 'tank', count: 1 }
            ],
            spawnDelay: WAVE_INTERVAL * 0.8
        });
        // Wave 4
        waves.push({
            enemyTypes: [
                { type: 'fast', count: 15 },
                { type: 'tank', count: 2 }
            ],
            spawnDelay: WAVE_INTERVAL * 0.7
        });
        // Wave 5
        waves.push({
            enemyTypes: [
                { type: 'basic', count: 20 },
                { type: 'fast', count: 10 },
                { type: 'tank', count: 3 }
            ],
            spawnDelay: WAVE_INTERVAL * 0.6
        });
        // Add more waves up to MAX_WAVES
        for (let i = 6; i <= MAX_WAVES; i++) {
            const basicCount = 20 + (i - 5) * 5;
            const fastCount = 10 + (i - 5) * 3;
            const tankCount = 3 + Math.floor((i - 5) * 0.7);
            waves.push({
                enemyTypes: [
                    { type: 'basic', count: basicCount },
                    { type: 'fast', count: fastCount },
                    { type: 'tank', count: tankCount }
                ],
                spawnDelay: WAVE_INTERVAL * (0.6 - (i - 5) * 0.05)
            });
        }

        return waves;
    }

    startWave(waveNumber) {
        this.currentWaveNumber = waveNumber;
        const waveDef = this.waveDefinitions[waveNumber - 1]; // -1 because array is 0-indexed
        if (!waveDef) {
            console.warn("Wave definition not found for wave:", waveNumber);
            return;
        }

        this.enemiesToSpawn = [];
        this.enemiesSpawnedThisWave = 0;
        this.isSpawning = true;

        // Populate the spawn queue
        waveDef.enemyTypes.forEach(enemyDef => {
            for (let i = 0; i < enemyDef.count; i++) {
                this.enemiesToSpawn.push(enemyDef.type);
            }
        });
        // Shuffle the spawn order for more dynamic waves (optional)
        this.enemiesToSpawn.sort(() => Math.random() - 0.5);

        this.spawnInterval = setInterval(() => {
            if (this.enemiesToSpawn.length > 0) {
                const enemyType = this.enemiesToSpawn.shift();
                this.game.enemies.push(new Enemy(enemyType, this.game.path));
                this.enemiesSpawnedThisWave++;
            } else {
                clearInterval(this.spawnInterval);
                this.isSpawning = false;
                console.log(`Wave ${waveNumber} spawning finished.`);
            }
        }, waveDef.spawnDelay);
    }

    update(deltaTime) {
        // No per-frame update needed for wave spawning logic (handled by interval)
    }

    isWaveFinishedSpawning() {
        return !this.isSpawning && this.enemiesToSpawn.length === 0;
    }

    reset() {
        clearInterval(this.spawnInterval);
        this.enemiesToSpawn = [];
        this.enemiesSpawnedThisWave = 0;
        this.isSpawning = false;
        this.currentWaveNumber = 0;
    }
}
