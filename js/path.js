// Manages the enemy path on the canvas

class GamePath {
    constructor(pathPoints) {
        this.pathPoints = pathPoints; // Array of {x, y} coordinates
        this.segmentLengths = [];
        this.totalLength = 0;
        this.calculatePathLengths();
    }

    calculatePathLengths() {
        this.totalLength = 0;
        this.segmentLengths = [];
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const p1 = this.pathPoints[i];
            const p2 = this.pathPoints[i + 1];
            const segLength = distance(p1.x, p1.y, p2.x, p2.y);
            this.segmentLengths.push(segLength);
            this.totalLength += segLength;
        }
    }

    /**
     * Gets the interpolated position along the path based on a percentage.
     * @param {number} percentage (0 to 1)
     * @returns {{x: number, y: number}} Current position
     */
    getPositionAtPercentage(percentage) {
        if (percentage <= 0) return { ...this.pathPoints[0] };
        if (percentage >= 1) return { ...this.pathPoints[this.pathPoints.length - 1] };

        const targetLength = this.totalLength * percentage;
        let currentLength = 0;

        for (let i = 0; i < this.segmentLengths.length; i++) {
            const segmentLength = this.segmentLengths[i];
            if (currentLength + segmentLength >= targetLength) {
                // The position is within this segment
                const segmentStart = this.pathPoints[i];
                const segmentEnd = this.pathPoints[i + 1];
                const segmentProgress = (targetLength - currentLength) / segmentLength;

                const x = lerp(segmentStart.x, segmentEnd.x, segmentProgress);
                const y = lerp(segmentStart.y, segmentEnd.y, segmentProgress);
                return { x, y };
            }
            currentLength += segmentLength;
        }
        return { ...this.pathPoints[this.pathPoints.length - 1] }; // Should not happen if percentage is handled
    }

    /**
     * Checks if a given point is on the path (within a certain tolerance).
     * This is used for tower placement validation.
     * @param {number} pointX
     * @param {number} pointY
     * @param {number} tolerance
     * @returns {boolean}
     */
    isPointOnPath(pointX, pointY, tolerance) {
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const p1 = this.pathPoints[i];
            const p2 = this.pathPoints[i + 1];

            // Calculate distance from point to line segment
            // This is a simplified check. For true segment distance, more complex math is needed.
            // For a TD game, often just checking distance to each path point is sufficient,
            // or discretizing the path into a grid and checking grid cells.
            // Let's use a simple bounding box check or distance to midpoint for now.

            const minX = Math.min(p1.x, p2.x) - tolerance;
            const maxX = Math.max(p1.x, p2.x) + tolerance;
            const minY = Math.min(p1.y, p2.y) - tolerance;
            const maxY = Math.max(p1.y, p2.y) + tolerance;

            if (pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY) {
                 // More accurate check: project point onto line segment
                 // (This gets a bit math-heavy for a quick example, but is the correct way)
                 // For now, if it's in the bounding box, assume it's "on path" for tower block
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = COLOR_GRASS;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Draw grass background

        ctx.strokeStyle = COLOR_PATH;
        ctx.lineWidth = 60; // Width of the road
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
        for (let i = 1; i < this.pathPoints.length; i++) {
            ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
        }
        ctx.stroke();

        // Optional: draw lane lines or edges
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw path points for debugging (optional)
        // ctx.fillStyle = 'blue';
        // this.pathPoints.forEach(p => {
        //     ctx.beginPath();
        //     ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        //     ctx.fill();
        // });
    }
}
