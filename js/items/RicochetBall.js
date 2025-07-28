
class RicochetBall extends Item {
    constructor(x, y) {
        super(x, y, '⚪');
        this.name = 'Ricochet Ball';
        this.bounceCount = 0;
        this.maxBounces = 5;
    }

    update() {
        // Exemple simple de rebond (logique à affiner avec les murs)
        if (this.hitWall()) {
            this.bounceCount++;
            this.velocity.reflect(); // à définir selon ton moteur physique
            if (this.bounceCount >= this.maxBounces) {
                this.destroy();
            }
        }
    }

    applyEffect(player) {
        // L'effet est visuel ici : balle autonome
    }
}
