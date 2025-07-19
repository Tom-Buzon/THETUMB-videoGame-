class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return this.divide(mag);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    distance(vector) {
        return this.subtract(vector).magnitude();
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    limit(max) {
        const mag = this.magnitude();
        if (mag > max) {
            return this.normalize().multiply(max);
        }
        return this;
    }
}