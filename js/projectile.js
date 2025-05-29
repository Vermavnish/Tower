// Projectile class definition

class Projectile {
    constructor(startX, startY, targetEnemy, damage, speed, aoeRadius = 0) {
        this.x = startX;
        this.y = startY;
        this.target = targetEnemy; // Reference to the enemy it's targeting
        this.damage = damage;
        this.speed = speed;
        this.aoeRadius = aoeRadius;
        this.radius = 5;
        this.color = COLOR_PROJECTILE;
        this.hit = false;
    }

    update(deltaTime) {
        if (!this.target || this.target.currentHealth <= 0) {
            // Target is dead or invalid, projectile dissipates
            this.hit = true;
            return;
        }

        const targetX = this.target.x;
        const targetY = this.target.y;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = distance(this.x, this.y, targetX, targetY);

        if (dist <= this.speed * deltaTime * 60) { // If close enough to hit this frame (60 FPS assumed for speed scale)
            this.x = targetX;
            this.y = targetY;
            this.hit = true; // Mark for removal after damage application
        } else {
            const ratio = (this.speed * deltaTime * 60) / dist; // Normalize movement by speed
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Simple Explosion class for visual effects
class Explosion {
    constructor(x, y, radius, duration) {
        this.x = x;
        this.y = y;
        this.startRadius = 10;
        this.endRadius = radius;
        this.duration = duration; // in seconds
        this.elapsedTime = 0;
        this.isFinished = false;
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.duration) {
            this.isFinished = true;
        }
    }

    draw(ctx) {
        if (this.isFinished) return;

        const progress = this.elapsedTime / this.duration;
        const currentRadius = lerp(this.startRadius, this.endRadius, progress);
        const alpha = 1 - progress; // Fade out

        ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`; // Orange fading
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`; // Yellow outline
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 0.8, 0, Math.PI * 2); // Inner flash
        ctx.stroke();
    }
}
