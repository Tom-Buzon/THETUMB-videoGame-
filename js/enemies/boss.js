import { ENEMY_CONFIG } from '../config.js';
import { Vector2D } from '../vector2d.js';
import { Bullet } from '../bullet.js';
import { Swarmer } from './swarmer.js';
import { Shooter } from './shooter.js';
import { Exploder } from './exploder.js';

export class Boss {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = ENEMY_CONFIG.BOSS.SIZE;
        this.health = ENEMY_CONFIG.BOSS.HEALTH;
        this.maxHealth = ENEMY_CONFIG.BOSS.MAX_HEALTH;
        this.speed = ENEMY_CONFIG.BOSS.SPEED;
        this.color = ENEMY_CONFIG.BOSS.COLOR;
        this.activated = true;
        
        // **PHASES DE COMBAT**
        this.phase = 1;
        this.phaseThresholds = ENEMY_CONFIG.BOSS.PHASE_THRESHOLDS;
        
        // **ATTAQUES COMPLEXES**
        this.attackCooldown = 0;
        this.attackPatterns = ['circle', 'spiral', 'homing', 'wave'];
        this.currentAttack = 0;
        
        // **AURA ET PARTICULES**
        this.auraRadius = ENEMY_CONFIG.BOSS.AURA_RADIUS;
        this.auraParticles = [];
        this.auraColor = ENEMY_CONFIG.BOSS.AURA_COLOR;
        this.auraIntensity = ENEMY_CONFIG.BOSS.AURA_INTENSITY;
        
        // **MINIONS**
        this.minionSpawnCooldown = 0;
        this.minions = [];
        
        // **TÉLÉPORTATION**
        this.teleportCooldown = 0;
        
        // **SHIELD**
        this.shieldActive = false;
        this.shieldCooldown = 0;
    }

    update(player) {
        // **GESTION DES PHASES**
        this.updatePhase();
        
        // **MOUVEMENT INTELLIGENT**
        this.updateMovement(player);
        
        // **ATTAQUES COMPLEXES**
        const bullets = this.updateAttacks(player);
        
        // **AURA ET PARTICULES**
        this.updateAura();
        
        // **MINIONS**
        this.updateMinions(player);
        
        // **SHIELD**
        this.updateShield();
        
        // **TÉLÉPORTATION**
        this.updateTeleport(player);
        
        return bullets;
    }

    updatePhase() {
        if (this.health <= this.phaseThresholds[2] && this.phase < 4) {
            this.phase = 4;
            this.auraColor = '#ff00ff';
            this.auraIntensity = 1.0;
            this.speed = 2.0;
        } else if (this.health <= this.phaseThresholds[1] && this.phase < 3) {
            this.phase = 3;
            this.auraColor = '#ff6600';
            this.auraIntensity = 0.8;
            this.speed = 1.6;
        } else if (this.health <= this.phaseThresholds[0] && this.phase < 2) {
            this.phase = 2;
            this.auraColor = '#ff0000';
            this.auraIntensity = 0.7;
            this.speed = 1.4;
        }
    }

    updateMovement(player) {
        // **MOUVEMENT PRÉDICTIF**
        const distance = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );

        let targetX = player.position.x;
        let targetY = player.position.y;

        // **ÉVITEMENT INTELLIGENT**
        if (distance < 100) {
            // S'éloigner si trop proche
            const direction = new Vector2D(
                this.position.x - player.position.x,
                this.position.y - player.position.y
            ).normalize();
            targetX = this.position.x + direction.x * 150;
            targetY = this.position.y + direction.y * 150;
        } else if (distance > 200) {
            // Se rapprocher si trop loin
            const direction = new Vector2D(
                player.position.x - this.position.x,
                player.position.y - this.position.y
            ).normalize();
            targetX = this.position.x + direction.x * this.speed * 2;
            targetY = this.position.y + direction.y * this.speed * 2;
        }

        // **MOUVEMENT SMOOTH**
        const direction = new Vector2D(
            targetX - this.position.x,
            targetY - this.position.y
        ).normalize();

        this.velocity = direction.multiply(this.speed);
        this.position = this.position.add(this.velocity);

        // **LIMITES**
        this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));
    }

    updateAttacks(player) {
        const bullets = [];
        
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return bullets;
        }

        // **PATTERN D'ATTAQUE SELON LA PHASE**
        switch (this.phase) {
            case 1:
                this.attackCooldown = ENEMY_CONFIG.BOSS.ATTACK_COOLDOWNS.PHASE_1;
                bullets.push(...this.circleAttack(player));
                break;
            case 2:
                this.attackCooldown = ENEMY_CONFIG.BOSS.ATTACK_COOLDOWNS.PHASE_2;
                bullets.push(...this.spiralAttack(player));
                break;
            case 3:
                this.attackCooldown = ENEMY_CONFIG.BOSS.ATTACK_COOLDOWNS.PHASE_3;
                bullets.push(...this.homingAttack(player));
                break;
            case 4:
                this.attackCooldown = ENEMY_CONFIG.BOSS.ATTACK_COOLDOWNS.PHASE_4;
                bullets.push(...this.comboAttack(player));
                break;
        }

        return bullets;
    }

    circleAttack(player) {
        const bullets = [];
        const bulletCount = 8 + this.phase * 2;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / bulletCount) * Math.PI * 2;
            const direction = new Vector2D(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            bullets.push(new Bullet(
                this.position.x + direction.x * 50,
                this.position.y + direction.y * 50,
                direction.x * 4,
                direction.y * 4,
                20,
                '#ff0000',
                5,
                'enemy'
            ));
        }
        
        return bullets;
    }

    spiralAttack(player) {
        const bullets = [];
        const bulletCount = 6 + this.phase;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / bulletCount) * Math.PI * 2 + Date.now() * 0.001;
            const direction = new Vector2D(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            bullets.push(new Bullet(
                this.position.x + direction.x * 40,
                this.position.y + direction.y * 40,
                direction.x * 3,
                direction.y * 3,
                15,
                '#ff6600',
                4,
                'enemy'
            ));
        }
        
        return bullets;
    }

    homingAttack(player) {
        const bullets = [];
        const bulletCount = 3 + this.phase;
        
        for (let i = 0; i < bulletCount; i++) {
            const direction = new Vector2D(
                player.position.x - this.position.x,
                player.position.y - this.position.y
            ).normalize();
            
            bullets.push(new Bullet(
                this.position.x,
                this.position.y,
                direction.x * 3,
                direction.y * 3,
                25,
                '#ff00ff',
                6,
                'enemy'
            ));
        }
        
        return bullets;
    }

    comboAttack(player) {
        const bullets = [];
        
        // **COMBINAISON DE TOUTES LES ATTAQUES**
        bullets.push(...this.circleAttack(player));
        bullets.push(...this.spiralAttack(player));
        bullets.push(...this.homingAttack(player));
        
        return bullets;
    }

    updateAura() {
        // **GÉNÉRATION DE PARTICULES D'AURA**
        if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.auraRadius * (0.5 + Math.random() * 0.5);
            
            this.auraParticles.push({
                x: this.position.x + Math.cos(angle) * distance,
                y: this.position.y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 30,
                maxLife: 30,
                color: this.auraColor
            });
        }
        
        // **MISE À JOUR DES PARTICULES**
        this.auraParticles = this.auraParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }

    updateMinions(player) {
        if (this.minionSpawnCooldown > 0) {
            this.minionSpawnCooldown--;
        }
        
        if (this.phase >= 3 && this.minionSpawnCooldown <= 0) {
            this.minionSpawnCooldown = ENEMY_CONFIG.BOSS.MINION_SPAWN_COOLDOWN;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100;
            const x = this.position.x + Math.cos(angle) * distance;
            const y = this.position.y + Math.sin(angle) * distance;
            
            // Créer un minion selon la phase
            let minion;
            if (this.phase === 3) {
                minion = new Swarmer(x, y);
            } else {
                const types = [new Swarmer(x, y), new Shooter(x, y), new Exploder(x, y)];
                minion = types[Math.floor(Math.random() * types.length)];
            }
            
            minion.activated = true;
            minion.health = Math.floor(minion.health * 0.5);
            this.minions.push(minion);
        }
        
        // **MISE À JOUR DES MINIONS**
        this.minions = this.minions.filter(minion => {
            if (minion.health <= 0) return false;
            
            // Les minions ne tirent pas, ils chargent
            minion.update(player);
            return true;
        });
    }

    updateShield() {
        if (this.shieldCooldown > 0) {
            this.shieldCooldown--;
        }
        
        if (this.phase >= 2 && this.shieldCooldown <= 0 && !this.shieldActive) {
            this.shieldActive = true;
            this.shieldCooldown = ENEMY_CONFIG.BOSS.SHIELD_COOLDOWN;
            
            setTimeout(() => {
                this.shieldActive = false;
            }, ENEMY_CONFIG.BOSS.SHIELD_DURATION);
        }
    }

    updateTeleport(player) {
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
        }
        
        if (this.phase >= 3 && this.teleportCooldown <= 0) {
            const distance = Math.sqrt(
                (player.position.x - this.position.x) ** 2 +
                (player.position.y - this.position.y) ** 2
            );
            
            if (distance < 100) {
                this.teleportCooldown = ENEMY_CONFIG.BOSS.TELEPORT_COOLDOWN;
                
                // Téléportation aléatoire
                this.position.x = Math.random() * 600 + 100;
                this.position.y = Math.random() * 400 + 100;
                
                // Effet de téléportation
                for (let i = 0; i < 20; i++) {
                    this.auraParticles.push({
                        x: this.position.x,
                        y: this.position.y,
                        vx: (Math.random() - 0.5) * 10,
                        vy: (Math.random() - 0.5) * 10,
                        life: 20,
                        maxLife: 20,
                        color: '#ffffff'
                    });
                }
            }
        }
    }

    takeDamage(amount) {
        if (this.shieldActive) {
            amount = Math.floor(amount * ENEMY_CONFIG.BOSS.SHIELD_DAMAGE_REDUCTION); // Réduction de dégâts avec shield
        }
        
        this.health = Math.max(0, this.health - amount);
    }

    render(ctx) {
        // **RENDU DE L'AURA**
        this.auraParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        
        // **CERCLE D'AURA**
        ctx.strokeStyle = this.auraColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = this.auraIntensity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.auraRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // **CORPS DU BOSS**
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // **YEUX DU BOSS**
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.position.x - 15, this.position.y - 10, 5, 0, Math.PI * 2);
        ctx.arc(this.position.x + 15, this.position.y - 10, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // **BOUCHE DU BOSS**
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // **SHIELD VISUEL**
        if (this.shieldActive) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // **BARRE DE VIE DU BOSS**
        const barWidth = 200;
        const barHeight = 8;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 20;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        
        // **NUMÉRO DE PHASE**
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 20px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(`PHASE ${this.phase}`, this.position.x, this.position.y - this.size - 30);
        
        // **RENDU DES MINIONS**
        this.minions.forEach(minion => minion.render(ctx));
    }
}