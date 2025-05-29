// Enemy class definition

class Enemy {
    constructor(type, path) {
        this.type = type;
        const enemyDef = ENEMY_TYPES[type.toUpperCase()];
        this.name = enemyDef.name;
        this.maxHealth = enemyDef.health;
        this.currentHealth = enemyDef.health;
        this.speed = enemyDef.speed;
        this.value = enemyDef.value; // Money gained on kill
        this.damageToCore = enemyDef.damageToCore;
        this.color = enemyDef.color;
        this.size = 20; // Default enemy size (radius)

        this.path = path;
        this.pathProgress = 0; // 0 to 1, percentage along the total path length
        const startPos = this.path.getPositionAtPercentage(this.pathProgress);
        this.x = startPos.x;
        this.y = startPos.y;
    }

    update(deltaTime) {
        if (this.currentHealth <= 0) return; // Dead enemies don't move

        const distanceToTravel = this.speed * deltaTime * 60; // Scale speed for 60 FPS
        const newProgress = this.pathProgress + (distanceToTravel / this.path.totalLength);
        this.pathProgress = newProgress;

        const newPos = this.path.getPositionAtPercentage(this.pathProgress);
        this.x = newPos.x;
        this.y = newPos.y;
    }

    draw(ctx) {
        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar above enemy
        const healthBarWidth = this.size * 1.5;
        const healthBarHeight = 5;
        const healthBarX = this.x - healthBarWidth / 2;
        const healthBarY = this.y - this.size / 2 - healthBarHeight - 5; // 5 pixels above enemy

        drawHealthBar(ctx, healthBarX, healthBarY, healthBarWidth, healthBarHeight, this.currentHealth, this.maxHealth);
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        // console.log(`${this.name} took ${amount} damage. Health: ${this.currentHealth}/${this.maxHealth}`);
    }

    isAtEnd() {
        return this.pathProgress >= 1;
    }
}
