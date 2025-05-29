// Utility functions for the game

/**
 * Calculates the Euclidean distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number} Distance
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a point is within a circle.
 * @param {number} pointX
 * @param {number} pointY
 * @param {number} circleX
 * @param {number} circleY
 * @param {number} radius
 * @returns {boolean} True if point is inside circle.
 */
function isPointInCircle(pointX, pointY, circleX, circleY, radius) {
    return distance(pointX, pointY, circleX, circleY) <= radius;
}

/**
 * Checks if two circles are overlapping.
 * @param {number} x1
 * @param {number} y1
 * @param {number} r1
 * @param {number} x2
 * @param {number} y2
 * @param {number} r2
 * @returns {boolean} True if circles overlap.
 */
function areCirclesOverlapping(x1, y1, r1, x2, y2, r2) {
    return distance(x1, y1, x2, y2) < (r1 + r2);
}

/**
 * Lerps (linear interpolate) between two values.
 * Used for smooth movement/transitions.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number} Interpolated value.
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} Clamped value.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Generates a random integer within a range (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number} Random integer.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Draws a rounded rectangle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 */
function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

/**
 * Draws a health bar.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} currentHealth
 * @param {number} maxHealth
 * @param {number} [borderColor]
 * @param {number} [fillColor]
 * @param {number} [bgColor]
 */
function drawHealthBar(ctx, x, y, width, height, currentHealth, maxHealth, borderColor = '#000', fillColor = COLOR_HEALTH_BAR_FILL, bgColor = COLOR_HEALTH_BAR_BG) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);

    const healthPercentage = currentHealth / maxHealth;
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width * healthPercentage, height);

    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x, y, width, height);
}
