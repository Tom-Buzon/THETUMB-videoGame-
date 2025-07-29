import { WEAPON_CONFIG } from './config.js';
import { Bullet } from './bullet.js';

export class Weapon {
    constructor() {
        this.states = {
            MINIGUN: {
                name: WEAPON_CONFIG.STATES.MINIGUN.NAME,
                hpRange: WEAPON_CONFIG.STATES.MINIGUN.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.MINIGUN.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.MINIGUN.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.MINIGUN.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.MINIGUN.COLOR
            },
            AUTO: {
                name: WEAPON_CONFIG.STATES.AUTO.NAME,
                hpRange: WEAPON_CONFIG.STATES.AUTO.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.AUTO.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.AUTO.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.AUTO.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.AUTO.COLOR
            },
            BURST: {
                name: WEAPON_CONFIG.STATES.BURST.NAME,
                hpRange: WEAPON_CONFIG.STATES.BURST.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.BURST.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.BURST.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.BURST.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.BURST.COLOR
            },
            SEMI: {
                name: WEAPON_CONFIG.STATES.SEMI.NAME,
                hpRange: WEAPON_CONFIG.STATES.SEMI.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.SEMI.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.SEMI.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.SEMI.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.SEMI.COLOR
            },
            SINGLE: {
                name: WEAPON_CONFIG.STATES.SINGLE.NAME,
                hpRange: WEAPON_CONFIG.STATES.SINGLE.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.SINGLE.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.SINGLE.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.SINGLE.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.SINGLE.COLOR
            },
            LASER: {
                name: WEAPON_CONFIG.STATES.LASER.NAME,
                hpRange: WEAPON_CONFIG.STATES.LASER.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.LASER.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.LASER.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.LASER.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.LASER.COLOR
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