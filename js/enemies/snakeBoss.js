import { SNAKE_BOSS } from '../config.js';
import { Vector2D } from '../vector2d.js';
import { Bullet } from '../bullet.js';
import { Enemy } from '../enemy.js';

export class SnakeBoss extends Enemy {
    constructor(x, y) {
        super(x, y);
        
        // Override base properties with snake boss-specific values
        this.size = SNAKE_BOSS.SIZE;
        this.health = SNAKE_BOSS.HEALTH;
        this.maxHealth = SNAKE_BOSS.MAX_HEALTH;
        this.speed = SNAKE_BOSS.SPEED;
        this.color = SNAKE_BOSS.COLORS.PHASE_1;
        
        // Snake-specific properties
        this.segmentCount = SNAKE_BOSS.SEGMENT_COUNT;
        this.segmentSize = SNAKE_BOSS.SEGMENT_SIZE;
        this.segments = [];
        this.initializeSegments();
        
        // **PHASES**
        this.phase = 1;
        this.phaseThresholds = SNAKE_BOSS.PHASE_THRESHOLDS;
        
        // **ATTACK SYSTEM**
        this.attackCooldowns = {
            basicProjectile: 0,
            sweep: 0,
            homingMissile: 0,
            poisonCloud: 0,
            ultimate: 0
        };
        
        // **MOVEMENT**
        this.targetPosition = new Vector2D(x, y);
        this.movementTimer = 0;
        this.movementPattern = 0;
        this.circleAngle = 0; // Initialize circle angle for circlePlayer movement
        
        // **VISUAL EFFECTS**
        this.trailTimer = 0;
        this.auraParticles = [];
        this.poisonClouds = [];
        this.vitalPointGlowIntensity = 0;
        this.segmentAngles = new Array(this.segmentCount).fill(0);
        
        // **DEATH ANIMATION**
        this.deathAnimationSpeed = 0.05;
    }
    
    initializeSegments() {
        // Create segments in a line behind the head
        for (let i = 0; i < this.segmentCount; i++) {
            this.segments.push({
                position: new Vector2D(
                    this.position.x - i * this.segmentSize * 1.5,
                    this.position.y
                ),
                size: this.segmentSize,
                isVital: this.isVitalPoint(i),
                color: i === 0 ? this.color : this.getSegmentColor(this.isVitalPoint(i))
            });
        }
        // Head is the first segment
        this.segments[0].size = this.size;
    }
    
    isVitalPoint(segmentIndex) {
        // Every 3rd segment is a vital point, starting with the head
        return segmentIndex % 3 === 0;
    }
    
    getSegmentColor(isVital) {
        if (isVital) {
            return SNAKE_BOSS.VITAL_POINT_COLOR;
        }
        return this.color;
    }
    
    updatePhase() {
        const healthPercent = (this.health / this.maxHealth) * 100;
        
        if (healthPercent <= 20 && this.phase < 4) {
            this.phase = 4;
            this.onPhaseChange(4);
        } else if (healthPercent <= 40 && this.phase < 3) {
            this.phase = 3;
            this.onPhaseChange(3);
        } else if (healthPercent <= 70 && this.phase < 2) {
            this.phase = 2;
            this.onPhaseChange(2);
        }
    }
    
    onPhaseChange(newPhase) {
        // Update color based on phase
        this.color = SNAKE_BOSS.COLORS[`PHASE_${newPhase}`];
        
        // Update all segments
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].color = this.getSegmentColor(this.segments[i].isVital);
        }
        
        // Add phase change visual effects
        this.addPhaseChangeEffects();
    }
    
    addPhaseChangeEffects() {
        // Add flash effect
        if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
            window.game.particleSystem.addFlash(
                this.position.x,
                this.position.y,
                200,
                '#ffffff'
            );
        }
        
        // Add particles
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                window.game.particleSystem.addParticle({
                    x: this.position.x,
                    y: this.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 40,
                    decay: 0.95,
                    color: this.color,
                    size: 2 + Math.random() * 3
                });
            }
        }
        
        // Add screen shake
        if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
            window.game.particleSystem.addScreenShake(5);
        }
    }
    
    update(player) {
        // **PHASE MANAGEMENT**
        this.updatePhase();
        
        // **MOVEMENT**
        this.updateMovement(player);
        
        // **ATTACKS**
        const bullets = this.updateAttacks(player);
        
        // **VISUAL EFFECTS**
        this.updateVisualEffects();
        
        // **COOLDOWN MANAGEMENT**
        this.updateAttackCooldowns();
        
        return bullets;
    }
    
    updateMovement(player) {
        this.movementTimer++;
        
        // Update segment positions with smooth following
        this.updateSegmentPositions();
        
        // Update head position based on movement pattern
        switch (this.movementPattern) {
            case 0: // Chase player
                this.chasePlayer(player);
                break;
            case 1: // Circle around player
                this.circlePlayer(player);
                break;
            case 2: // Evade player
                this.evadePlayer(player);
                break;
        }
        
        // Change movement pattern periodically
        if (this.movementTimer > 180) {
            this.movementPattern = (this.movementPattern + 1) % 3;
            console.log("Snake boss changing movement pattern to:", this.movementPattern);
            this.movementTimer = 0;
        }
    }
    
    updateSegmentPositions() {
        // Update each segment to follow the previous one
        for (let i = 1; i < this.segments.length; i++) {
            const prevSegment = this.segments[i - 1];
            const segment = this.segments[i];
            
            // Calculate direction to previous segment
            const dx = prevSegment.position.x - segment.position.x;
            const dy = prevSegment.position.y - segment.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Maintain distance between segments
            if (distance > this.segmentSize * 1.5) {
                const angle = Math.atan2(dy, dx);
                segment.position.x = prevSegment.position.x - Math.cos(angle) * this.segmentSize * 1.5;
                segment.position.y = prevSegment.position.y - Math.sin(angle) * this.segmentSize * 1.5;
                
                // Store segment angle for rendering
                this.segmentAngles[i] = angle;
            }
        }
        
        // Update head position and angle
        this.position = this.segments[0].position;
        if (this.segments.length > 1) {
            const dx = this.segments[1].position.x - this.segments[0].position.x;
            const dy = this.segments[1].position.y - this.segments[0].position.y;
            this.segmentAngles[0] = Math.atan2(dy, dx);
        }
    }
    
    chasePlayer(player) {
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 100) {
            const speed = this.speed * [1.0, 1.5, 2.0, 3.0][this.phase - 1];
            this.segments[0].position.x += (dx / distance) * speed;
            this.segments[0].position.y += (dy / distance) * speed;
        }
    }
    
    circlePlayer(player) {
        // Move toward a point that circles around the player
        this.circleAngle = this.circleAngle || 0;
        const phaseSpeed = [1.0, 1.2, 1.5, 2.0][this.phase - 1];
        this.circleAngle += 0.02 * phaseSpeed; // Speed increases with phase
        const radius = 150;
        
        // Calculate target position that circles around the player
        const targetX = player.position.x + Math.cos(this.circleAngle) * radius;
        const targetY = player.position.y + Math.sin(this.circleAngle) * radius;
        
        // Move head toward the target position
        const dx = targetX - this.segments[0].position.x;
        const dy = targetY - this.segments[0].position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const speed = this.speed * [1.0, 1.5, 2.0, 3.0][this.phase - 1] * 0.5; // Slower for circling
            this.segments[0].position.x += (dx / distance) * speed;
            this.segments[0].position.y += (dy / distance) * speed;
        }
        //console.log("Circle player - angle:", this.circleAngle, "phase speed:", phaseSpeed);
    }
    
    evadePlayer(player) {
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Always move away from player, not just when close
        if (distance > 0) {  // Avoid division by zero
            const speed = this.speed * [1.0, 1.5, 2.0, 3.0][this.phase - 1];
            this.segments[0].position.x -= (dx / distance) * speed;
            this.segments[0].position.y -= (dy / distance) * speed;
        }
    }
    
    updateAttacks(player) {
        const bullets = [];
        
        // Check which attacks are available in current phase
        const availableAttacks = this.getAvailableAttacks();
        
        // Update attack cooldowns
        for (const attack in this.attackCooldowns) {
            if (this.attackCooldowns[attack] > 0) {
                this.attackCooldowns[attack]--;
            }
        }
        
        // Randomly select an attack if available
        if (Math.random() < 0.02 && availableAttacks.length > 0) {
            const attack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
            
            switch (attack) {
                case 'basicProjectile':
                    if (this.attackCooldowns.basicProjectile <= 0) {
                        bullets.push(...this.basicProjectileAttack());
                        this.attackCooldowns.basicProjectile = SNAKE_BOSS.ATTACK_COOLDOWNS[`PHASE_${this.phase}`].basicProjectile;
                        this.addAttackLaunchEffects('basicProjectile');
                    }
                    break;
                case 'sweep':
                    if (this.attackCooldowns.sweep <= 0) {
                        bullets.push(...this.sweepAttack());
                        this.attackCooldowns.sweep = SNAKE_BOSS.ATTACK_COOLDOWNS[`PHASE_${this.phase}`].sweep;
                        this.addAttackLaunchEffects('sweep');
                    }
                    break;
                case 'homingMissile':
                    if (this.attackCooldowns.homingMissile <= 0) {
                        bullets.push(...this.homingMissileAttack());
                        this.attackCooldowns.homingMissile = SNAKE_BOSS.ATTACK_COOLDOWNS[`PHASE_${this.phase}`].homingMissile;
                        this.addAttackLaunchEffects('homingMissile');
                    }
                    break;
                case 'poisonCloud':
                    if (this.attackCooldowns.poisonCloud <= 0) {
                        this.poisonCloudAttack();
                        this.attackCooldowns.poisonCloud = SNAKE_BOSS.ATTACK_COOLDOWNS[`PHASE_${this.phase}`].poisonCloud;
                        this.addAttackLaunchEffects('poisonCloud');
                    }
                    break;
                case 'ultimate':
                    if (this.attackCooldowns.ultimate <= 0) {
                        bullets.push(...this.ultimateAttack());
                        this.attackCooldowns.ultimate = SNAKE_BOSS.ATTACK_COOLDOWNS[`PHASE_${this.phase}`].ultimate;
                        this.addAttackLaunchEffects('ultimate');
                    }
                    break;
            }
        }
        
        // Update poison clouds
        this.updatePoisonClouds(bullets);
        
        return bullets;
    }
    
    getAvailableAttacks() {
        switch (this.phase) {
            case 1:
                return ['basicProjectile', 'sweep'];
            case 2:
                return ['basicProjectile', 'sweep', 'homingMissile'];
            case 3:
                return ['basicProjectile', 'sweep', 'homingMissile', 'poisonCloud'];
            case 4:
                return ['basicProjectile', 'sweep', 'homingMissile', 'poisonCloud', 'ultimate'];
            default:
                return ['basicProjectile'];
        }
    }
    
    updateAttackCooldowns() {
        // Reduce cooldowns based on phase
        const cooldownMultiplier = [1.0, 0.8, 0.6, 0.4][this.phase - 1];
        
        for (const attack in this.attackCooldowns) {
            if (this.attackCooldowns[attack] > 0) {
                this.attackCooldowns[attack] -= cooldownMultiplier;
            }
        }
    }
    
    basicProjectileAttack() {
        const bullets = [];
        const projectileCount = 6 + this.phase * 2;
        
        for (let i = 0; i < projectileCount; i++) {
            const angle = (i / projectileCount) * Math.PI * 2;
            const direction = new Vector2D(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            bullets.push(new Bullet(
                this.position.x + direction.x * 30,
                this.position.y + direction.y * 30,
                direction.x * 4,
                direction.y * 4,
                15,
                this.color,
                5,
                'enemy'
            ));
        }
        
        return bullets;
    }
    
    sweepAttack() {
        const bullets = [];
        // Create a wide arc of bullets
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI - Math.PI / 2;
            const direction = new Vector2D(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            bullets.push(new Bullet(
                this.position.x + direction.x * 30,
                this.position.y + direction.y * 30,
                direction.x * 3,
                direction.y * 3,
                12,
                this.color,
                4,
                'enemy'
            ));
        }
        
        return bullets;
    }
    
    homingMissileAttack() {
        const bullets = [];
        const missileCount = 2 + this.phase;
        
        for (let i = 0; i < missileCount; i++) {
            // Add slight variation to missile directions
            const angleVariation = (Math.random() - 0.5) * 0.5;
            
            bullets.push(new Bullet(
                this.position.x,
                this.position.y,
                Math.cos(angleVariation) * 3,
                Math.sin(angleVariation) * 3,
                20,
                '#ff00ff',
                7,
                'enemy'
            ));
        }
        
        return bullets;
    }
    
    poisonCloudAttack() {
        // Create a poison cloud effect
        const cloud = {
            x: this.position.x,
            y: this.position.y,
            radius: 50,
            maxRadius: 150,
            growthRate: 2,
            damage: 2,
            duration: 180,
            color: '#00ff00'
        };
        
        this.poisonClouds.push(cloud);
        
        // Add particle effects
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50;
            
            if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                window.game.particleSystem.addParticle({
                    x: cloud.x + Math.cos(angle) * distance,
                    y: cloud.y + Math.sin(angle) * distance,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 60,
                    decay: 0.98,
                    color: '#00ff00',
                    size: 3 + Math.random() * 2
                });
            }
        }
    }
    
    updatePoisonClouds(bullets) {
        for (let i = this.poisonClouds.length - 1; i >= 0; i--) {
            const cloud = this.poisonClouds[i];
            
            // Grow the cloud
            cloud.radius += cloud.growthRate;
            
            // Reduce duration
            cloud.duration--;
            
            // Remove expired clouds
            if (cloud.duration <= 0 || cloud.radius > cloud.maxRadius) {
                this.poisonClouds.splice(i, 1);
                continue;
            }
            
            // Add occasional particles
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * cloud.radius;
                
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    window.game.particleSystem.addParticle({
                        x: cloud.x + Math.cos(angle) * distance,
                        y: cloud.y + Math.sin(angle) * distance,
                        vx: (Math.random() - 0.5) * 1,
                        vy: (Math.random() - 0.5) * 1,
                        life: 30,
                        decay: 0.96,
                        color: '#00ff00',
                        size: 2 + Math.random() * 2
                    });
                }
            }
        }
    }
    
    ultimateAttack() {
        const bullets = [];
        
        // Create massive shockwave
        if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
            window.game.particleSystem.createShockwave(
                this.position.x,
                this.position.y,
                300
            );
            
            window.game.particleSystem.addScreenShake(15);
        }
        
        // Add massive particle explosion
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            
            if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                window.game.particleSystem.addParticle({
                    x: this.position.x,
                    y: this.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 40,
                    decay: 0.95,
                    color: this.color,
                    size: 2 + Math.random() * 4
                });
            }
        }
        
        // Create a ring of bullets
        for (let i = 0; i < 36; i++) {
            const angle = (i / 36) * Math.PI * 2;
            const direction = new Vector2D(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            bullets.push(new Bullet(
                this.position.x + direction.x * 50,
                this.position.y + direction.y * 50,
                direction.x * 5,
                direction.y * 5,
                25,
                '#ff0000',
                8,
                'enemy'
            ));
        }
        
        return bullets;
    }
    
    updateVisualEffects() {
        // Add trail particles
        this.updateSegmentTrails();
        
        // Update aura particles
        this.updateAura();
        
        // Update poison cloud particles
        this.updatePoisonCloudParticles();
    }
    
    updateSegmentTrails() {
        // Add trail particles at regular intervals
        if (this.trailTimer <= 0) {
            // Add particles to each segment
            for (let i = 0; i < this.segments.length; i++) {
                const segment = this.segments[i];
                const angle = this.segmentAngles[i];
                
                // Add more particles to vital points
                const particleCount = this.segments[i].isVital ? 5 : 2;
                
                for (let j = 0; j < particleCount; j++) {
                    // Position particles along the segment direction
                    const offsetAngle = angle + (Math.random() - 0.5) * 0.5;
                    const offsetDistance = (Math.random() - 0.5) * segment.size;
                    
                    const particleX = segment.position.x + Math.cos(offsetAngle) * offsetDistance;
                    const particleY = segment.position.y + Math.sin(offsetAngle) * offsetDistance;
                    
                    // Velocity based on segment movement and phase
                    const speedMultiplier = [1.0, 1.2, 1.5, 2.0][this.phase - 1];
                    const vx = Math.cos(angle + Math.PI) * (0.5 + Math.random() * 1.5) * speedMultiplier;
                    const vy = Math.sin(angle + Math.PI) * (0.5 + Math.random() * 1.5) * speedMultiplier;
                    
                    if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                        window.game.particleSystem.addParticle({
                            x: particleX,
                            y: particleY,
                            vx: vx,
                            vy: vy,
                            life: 40 + Math.random() * 20,
                            decay: 0.95 + Math.random() * 0.03,
                            color: this.getTrailColor(),
                            size: 1 + Math.random() * 3
                        });
                    }
                }
            }
            
            this.trailTimer = 2; // Reset timer more frequently for smoother trails
        } else {
            this.trailTimer--;
        }
    }
    
    getTrailColor() {
        // Slightly dimmer version of phase color for trails
        return this.color.replace('#', '#88'); // Add alpha for dimming
    }
    
    updateAura() {
        // Generate aura particles
        if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const distance = SNAKE_BOSS.AURA_RADIUS * (0.5 + Math.random() * 0.5);
            
            this.auraParticles.push({
                x: this.position.x + Math.cos(angle) * distance,
                y: this.position.y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 30,
                maxLife: 30,
                color: SNAKE_BOSS.AURA_COLOR
            });
        }
        
        // Update particles
        this.auraParticles = this.auraParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    updatePoisonCloudParticles() {
        // Add particles for poison clouds
        for (const cloud of this.poisonClouds) {
            if (Math.random() < 0.2) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * cloud.radius;
                
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    window.game.particleSystem.addParticle({
                        x: cloud.x + Math.cos(angle) * distance,
                        y: cloud.y + Math.sin(angle) * distance,
                        vx: (Math.random() - 0.5) * 1,
                        vy: (Math.random() - 0.5) * 1,
                        life: 20,
                        decay: 0.95,
                        color: '#00ff00',
                        size: 2 + Math.random() * 2
                    });
                }
            }
        }
    }
    
    addAttackLaunchEffects(attackType) {
        switch (attackType) {
            case 'basicProjectile':
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    // Enhanced muzzle flash with more particles
                    window.game.particleSystem.addMuzzleFlash(
                        this.position.x,
                        this.position.y,
                        this.color,
                        25
                    );
                    
                    // Add additional explosion effect
                    window.game.particleSystem.addExplosion(
                        this.position.x,
                        this.position.y,
                        this.color,
                        15,
                        1.0
    );
                }
                break;
                
            case 'homingMissile':
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    // Enhanced energy drain with more particles
                    window.game.particleSystem.addEnergyDrain(
                        this.position.x,
                        this.position.y,
                        '#ff00ff'
                    );
                    
                    // Add particle burst
                    for (let i = 0; i < 20; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 1 + Math.random() * 3;
                        
                        window.game.particleSystem.addParticle({
                            x: this.position.x,
                            y: this.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 30,
                            decay: 0.95,
                            color: '#ff00ff',
                            size: 2 + Math.random() * 2
                        });
                    }
                }
                break;
                
            case 'poisonCloud':
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    // Enhanced flash with larger radius
                    window.game.particleSystem.addFlash(
                        this.position.x,
                        this.position.y,
                        150,
                        '#00ff00'
                    );
                    
                    // Add poison particles
                    for (let i = 0; i < 30; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * 50;
                        const speed = 0.5 + Math.random() * 1.5;
                        
                        window.game.particleSystem.addParticle({
                            x: this.position.x + Math.cos(angle) * distance,
                            y: this.position.y + Math.sin(angle) * distance,
                            vx: Math.cos(angle + Math.PI) * speed,
                            vy: Math.sin(angle + Math.PI) * speed,
                            life: 50,
                            decay: 0.96,
                            color: '#00ff00',
                            size: 2 + Math.random() * 3
                        });
                    }
                }
                break;
                
            case 'ultimate':
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    // Enhanced flash with even larger radius
                    window.game.particleSystem.addFlash(
                        this.position.x,
                        this.position.y,
                        400,
                        '#ffffff'
                    );
                    
                    // Stronger screen shake
                    window.game.particleSystem.addScreenShake(20);
                    
                    // Add massive particle explosion
                    for (let i = 0; i < 50; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 4;
                        
                        window.game.particleSystem.addParticle({
                            x: this.position.x,
                            y: this.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 60,
                            decay: 0.94,
                            color: this.color,
                            size: 3 + Math.random() * 4
                        });
                    }
                }
                break;
        }
    }
    
    takeDamage(amount, segmentIndex = 0) {
        // Only apply damage if the segment is a vital point
        if (this.segments[segmentIndex].isVital) {
            // Call parent takeDamage method
            super.takeDamage(amount);
            
            // Add visual feedback for hit
            this.addHitEffect(segmentIndex, true);
            
            return true; // Damage was applied
        }
        
        // Add visual feedback for blocked hit
        this.addHitEffect(segmentIndex, false);
        
        return false; // No damage was applied
    }
    
    addHitEffect(segmentIndex, isVitalPoint) {
        const segment = this.segments[segmentIndex];
        
        if (isVitalPoint) {
            // Vital point hit effects
            if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                window.game.particleSystem.addExplosion(
                    segment.position.x,
                    segment.position.y,
                    this.color,
                    20,
                    1.5
                );
                
                window.game.particleSystem.addFlash(
                    segment.position.x,
                    segment.position.y,
                    50,
                    '#ffffff'
                );
                
                window.game.particleSystem.addScreenShake(3);
            }
        } else {
            // Non-vital point hit effects
            if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                window.game.particleSystem.addImpactSparks(
                    segment.position.x,
                    segment.position.y,
                    '#ffff00',
                    8
                );
            }
        }
    }
    
    triggerDeathEffects() {
        // Call parent method for base effects
        super.triggerDeathEffects();
        
        // Add snake-specific death effects
        // Sequential explosions along the body with enhanced effects
        for (let i = 0; i < this.segments.length; i++) {
            setTimeout(() => {
                const segment = this.segments[i];
                
                if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                    // Larger explosion for vital points
                    const explosionSize = segment.isVital ? 25 : 15;
                    const intensity = segment.isVital ? 1.5 : 1.2;
                    
                    window.game.particleSystem.addExplosion(
                        segment.position.x,
                        segment.position.y,
                        this.color,
                        explosionSize,
                        intensity
                    );
                    
                    // Add multiple dissolve effects for visual impact
                    for (let j = 0; j < 3; j++) {
                        setTimeout(() => {
                            window.game.particleSystem.addDissolveEffect(
                                segment.position.x + (Math.random() - 0.5) * 20,
                                segment.position.y + (Math.random() - 0.5) * 20,
                                this.color,
                                segment.size * (0.7 + Math.random() * 0.6)
                            );
                        }, j * 50);
                    }
                    
                    // Add shockwave for vital points
                    if (segment.isVital) {
                        window.game.particleSystem.createShockwave(
                            segment.position.x,
                            segment.position.y,
                            segment.size * 3
                        );
                    }
                }
            }, i * 80); // Faster stagger for more dynamic effect
        }
        
        // Massive particle shower with color variations
        for (let i = 0; i < 150; i++) {
            const segment = this.segments[Math.floor(Math.random() * this.segments.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            
            // Color variation based on phase
            let particleColor = this.color;
            if (Math.random() < 0.3) {
                // Add some variation
                const colors = ['#ffffff', '#ffff00', '#ff9900', '#ff0000'];
                particleColor = colors[Math.floor(Math.random() * colors.length)];
            }
            
            if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
                window.game.particleSystem.addParticle({
                    x: segment.position.x + (Math.random() - 0.5) * 30,
                    y: segment.position.y + (Math.random() - 0.5) * 30,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 80,
                    decay: 0.96,
                    color: particleColor,
                    size: 1 + Math.random() * 4
                });
            }
        }
        
        // Final screen flash with larger radius
        if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
            window.game.particleSystem.addFlash(
                this.position.x,
                this.position.y,
                500,
                '#ffffff'
            );
            
            // Stronger screen shake
            window.game.particleSystem.addScreenShake(25);
            
            // Add energy drain effect for final burst
            window.game.particleSystem.addEnergyDrain(
                this.position.x,
                this.position.y,
                this.color
            );
        }
    }
    
    render(ctx) {
        // Render death animation if dying
        if (this.isDying) {
            this.renderDeathAnimation(ctx);
            return;
        }
        
        // Render poison clouds
        this.renderPoisonClouds(ctx);
        
        // Render aura particles
        this.renderAuraParticles(ctx);
        
        // Render segments
        this.renderSegments(ctx);
        
        // Render health bar
        this.renderHealthBar(ctx);
    }
    
    renderSegments(ctx) {
        // Render each segment with enhanced visual effects
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const angle = this.segmentAngles[i];
            
            // Pulsing effect for vital points
            let size = segment.size;
            let glowIntensity = 1.0;
            
            if (segment.isVital) {
                const pulse = Math.sin(Date.now() * 0.01 + i * 0.5) * 0.3 + 1.0;
                size = segment.size * pulse;
                glowIntensity = Math.sin(Date.now() * 0.02 + i) * 0.5 + 1.5;
            }
            
            // Render segment with rotation
            ctx.save();
            ctx.translate(segment.position.x, segment.position.y);
            ctx.rotate(angle);
            
            // Draw segment
            ctx.fillStyle = segment.color;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow for vital points
            if (segment.isVital) {
                // Inner glow
                const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
                innerGradient.addColorStop(0, segment.color);
                innerGradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = innerGradient;
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Outer glow
                ctx.shadowColor = segment.color;
                ctx.shadowBlur = 15 * glowIntensity;
                ctx.fillStyle = segment.color;
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Core bright spot
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    renderAuraParticles(ctx) {
        // Render aura particles
        this.auraParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    
    renderPoisonClouds(ctx) {
        // Render poison clouds
        this.poisonClouds.forEach(cloud => {
            const gradient = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius
            );
            gradient.addColorStop(0, `${cloud.color}88`);
            gradient.addColorStop(1, `${cloud.color}00`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    renderHealthBar(ctx) {
        const barWidth = 200;
        const barHeight = 8;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 20;
        
        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Health bar background
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        
        // Phase indicator
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 20px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(`PHASE ${this.phase}`, this.position.x, this.position.y - this.size - 30);
    }
    
    renderDeathAnimation(ctx) {
        // Custom death animation for snake boss
        const progress = this.deathAnimationProgress || 0;
        const alpha = 1 - progress;
        
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Render segments with enhanced glitch effect
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const angle = this.segmentAngles[i];
            
            // Enhanced glitch effect with more randomness
            const glitchIntensity = progress * 30;
            const glitchX = segment.position.x + (Math.random() - 0.5) * glitchIntensity;
            const glitchY = segment.position.y + (Math.random() - 0.5) * glitchIntensity;
            
            // Pulsing size reduction
            const size = segment.size * (1 - progress * 0.8);
            
            // Render with rotation and glitch
            ctx.save();
            ctx.translate(glitchX, glitchY);
            ctx.rotate(angle + progress * Math.PI * 2);
            
            // Draw main segment
            ctx.fillStyle = segment.color;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glitch particles around the segment
            if (segment.isVital && Math.random() < 0.3) {
                ctx.fillStyle = '#ffffff';
                for (let j = 0; j < 5; j++) {
                    const particleAngle = Math.random() * Math.PI * 2;
                    const particleDistance = size * (0.5 + Math.random() * 0.5);
                    const particleSize = 1 + Math.random() * 3;
                    
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(particleAngle) * particleDistance,
                        Math.sin(particleAngle) * particleDistance,
                        particleSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }
        
        ctx.globalAlpha = 1;
    }
}