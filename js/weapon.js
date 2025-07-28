class Weapon {
    constructor() {
        this.states = {
            MINIGUN: {
                name: 'MINI GUN',
                hpRange: [90, 100],
                fireRate: 50,
                damage: 6,
                recoilMult: 0.1,
                color: '#00ff00'
            },
            AUTO: {
                name: 'AUTO RIFLE',
                hpRange: [75, 89],
                fireRate: 100,
                damage: 10,
                recoilMult: 0.3,
                color: '#00ff00'
            },
            BURST: {
                name: 'BURST RIFLE',
                hpRange: [50, 74],
                fireRate: 300,
                damage: 25,
                recoilMult: 0.5,
                color: '#ffff00'
            },
            SEMI: {
                name: 'SEMI-AUTO',
                hpRange: [25, 49],
                fireRate: 600,
                damage: 80,
                recoilMult: 0.7,
                color: '#ff6600'
            },
            SINGLE: {
                name: 'SINGLE SHOT',
                hpRange: [11, 24],
                fireRate: 1200,
                damage: 200,
                recoilMult: 0.9,
                color: '#ff0000'
            },
            LASER: {
                name: 'LASER',
                hpRange: [1, 10],
                fireRate: 1200,
                damage: 800,
                recoilMult: 1,
                color: '#ff0000'
            }
        
        };
        
        this.currentState = 'AUTO';
        this.lastFireTime = 0;
    }

    updateState(playerHealth, maxHealth) {
        const healthPercent = (playerHealth / maxHealth) * 100;
        //console.log(`Weapon state update: ${playerHealth}/${maxHealth} = ${healthPercent}%`);
        
        // Store the current state before updating
        const previousState = this.currentState;
        
        for (const [state, config] of Object.entries(this.states)) {
            if (healthPercent >= config.hpRange[0] && healthPercent <= config.hpRange[1]) {
                this.currentState = state;
                break;
            }
        }
        
        // Return the new weapon name if the state changed
        if (previousState !== this.currentState) {
            return this.states[this.currentState].name;
        }
        
        // Return null if no change occurred
        return null;
    }

    shoot(x, y, direction) {
        const now = Date.now();
        const state = this.states[this.currentState];
        
        if (now - this.lastFireTime < state.fireRate) {
            return null;
        }
        
        this.lastFireTime = now;
        
        return new Bullet(
            x + direction.x * 20,
            y + direction.y * 20,
            direction.x * 8,
            direction.y * 8,
            state.damage,
            state.color,
            5,
            'player'
        );
    }

    getName() {
        return this.states[this.currentState].name;
    }

    getDamage() {
        return this.states[this.currentState].damage;
    }

    getFireRate() {
        return this.states[this.currentState].fireRate;
    }

    getColor() {
        return this.states[this.currentState].color;
    }
}