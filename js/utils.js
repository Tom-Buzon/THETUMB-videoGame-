// Utility functions
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radians) {
    return radians * 180 / Math.PI;
}