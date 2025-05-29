// Tower class definition

class Tower {
    constructor(x, y, name, cost, damage, range, fireRate, projectileSpeed, type, aoeRadius = 0) {
        this.x = x;
        this.y = y;
        this.size = GRID_SIZE * 0.8; // Roughly 80% of grid cell size
        this.name = name;
        this.cost = cost;
        this.totalCost = cost; // Keep track of total money invested
        this.damage = damage;
        this.range = range;
        this.fireRate = fireRate; // Frames per shot
        this.projectileSpeed = projectileSpeed;
        this.type = type; // e.g., 'basic', 'fast', 'aoe'
        this.aoeRadius = aoeRadius;
        this.level = 0; // Starts at level 0, upgrades to 1, 2, 3
        this.upgrade(TOWER_TYPES[type.toUpperCase()]); // Apply initial stats

        this.target = null;
        this.fireCooldown = 0; // Current cooldown in frames
        this.isValidPlacement = true; // For real-time placement feedback
    }

    upgrade(upgradeData) {
        this.level++;
        this.damage = upgradeData.damage;
        this.range = upgradeData.range;
        this.fireRate = upgradeData.fireRate;
        if (upgradeData.aoeRadius !== undefined) {
            this.aoeRadius = upgradeData.aoeRadius;
        }
        this.totalCost += Math.round(TOWER_TYPES[this.type.toUpperCase()].cost * Math.pow(TOWER_TYPES[this.type.toUpperCase()].upgradeCostMultiplier, this.level - 1));
        console.log(`Tower upgraded to Level ${this.level}. Damage: ${this.damage}, Range: ${this.range}`);
    }

    update(enemies, deltaTime) {
        this.fireCooldown = Math.max(0, this.fireCooldown - 1); // Decrement cooldown by 1 frame

        // If no target or target is dead/out of range, find a new one
        if (!this.target || this.target.currentHealth <= 0 || distance(this.x, this.y, this.target.x, this.target.y) > this.range) {
            this.findTarget(enemies);
        }

        // If a target is found and cooldown is ready, fire
        if (this.target && this.fireCooldown === 0) {
            this.fire();
            this.fireCooldown = this.fireRate; // Reset cooldown
        }
    }

    findTarget(enemies) {
        this.target = null;
        let closestDistance = Infinity;

        // Simple targeting: closest enemy within range
        for (const enemy of enemies) {
            const dist = distance(this.x, this.y, enemy.x, enemy.y);
            if (dist <= this.range) {
                if (dist < closestDistance) { // Priority: closest
                    closestDistance = dist;
                    this.target = enemy;
                }
                // More complex targeting: first, strongest, weakest, etc.
                // if (this.type === 'aoe' && enemy.health > this.target?.health) { ... } // Example
            }
        }
    }

    fire() {
        if (this.target) {
            // Create a new projectile
            const projectile = new Projectile(
                this.x,
                this.y,
                this.target,
                this.damage,
                this.projectileSpeed,
                this.aoeRadius
            );
            game.projectiles.push(projectile); // Add to global game projectiles array
        }
    }

    draw(ctx, isBeingPlaced = false) {
        // Draw base
        ctx.fillStyle = COLOR_TOWER_BASE;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw tower specific top (simplified)
        let towerColor;
        switch (this.type) {
            case 'basic':
                towerColor = 'grey';
                break;
            case 'fast':
                towerColor = 'cyan';
                break;
            case 'aoe':
                towerColor = 'orange';
                break;
            default:
                towerColor = 'white';
        }
        ctx.fillStyle = towerColor;
        ctx.fillRect(this.x - this.size / 4, this.y - this.size / 2, this.size / 2, this.size / 2); // Simple rectangular gun

        // Draw level indicator
        if (this.level > 0) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`L${this.level}`, this.x, this.y + this.size / 2.5);
        }

        // Draw range indicator if selected or being placed
        if (game.selectedTower === this || isBeingPlaced) {
            ctx.strokeStyle = this.isValidPlacement ? COLOR_RANGE_INDICATOR : 'rgba(255, 0, 0, 0.4)';
            ctx.fillStyle = this.isValidPlacement ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Draw target line for debugging (optional)
        // if (this.target) {
        //     ctx.strokeStyle = 'red';
        //     ctx.beginPath();
        //     ctx.moveTo(this.x, this.y);
        //     ctx.lineTo(this.target.x, this.target.y);
        //     ctx.stroke();
        // }
    }
}
