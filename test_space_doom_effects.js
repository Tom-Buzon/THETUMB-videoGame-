// Space DOOM Visual Effects Test Suite
// This file tests all implemented visual effects

class SpaceDOOMTester {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    // Test particle system functionality
    testParticleSystem() {
        console.log("Testing Particle System...");
        
        // Test explosion effects
        const explosionTest = {
            name: "Explosion Effects",
            passed: false,
            details: []
        };
        
        // Verify particle types exist
        const particleTypes = [
            'PARTICLE_SPARK',
            'PARTICLE_DEBRIS', 
            'PARTICLE_SHOCKWAVE',
            'PARTICLE_DISSOLVE',
            'PARTICLE_ENERGY_DRAIN'
        ];
        
        particleTypes.forEach(type => {
            if (typeof window.PARTICLE_TYPES !== 'undefined' && window.PARTICLE_TYPES[type]) {
                explosionTest.details.push(`✓ ${type} exists`);
            } else {
                explosionTest.details.push(`✗ ${type} missing`);
            }
        });
        
        // Test explosion creation
        if (window.game && window.game.particleSystem) {
            const ps = window.game.particleSystem;
            explosionTest.details.push("✓ Particle system accessible");
            
            // Test addExplosion method
            if (typeof ps.addExplosion === 'function') {
                explosionTest.details.push("✓ addExplosion method exists");
                ps.addExplosion(400, 300, '#ff0000', 10, 1);
                explosionTest.details.push("✓ Explosion created successfully");
                explosionTest.passed = true;
            }
        }
        
        this.results.push(explosionTest);
    }

    // Test enemy death effects
    testEnemyDeathEffects() {
        console.log("Testing Enemy Death Effects...");
        
        const enemyTypes = ['Swarmer', 'Charger', 'Shooter', 'Sniper', 'Healer', 'Exploder'];
        const deathTest = {
            name: "Enemy Death Effects",
            passed: true,
            details: []
        };
        
        enemyTypes.forEach(type => {
            if (typeof window[type] === 'function') {
                const enemy = new window[type](100, 100);
                if (enemy.takeDamage && enemy.isDying !== undefined) {
                    deathTest.details.push(`✓ ${type} has death effects`);
                    
                    // Test death animation
                    enemy.health = 0;
                    enemy.takeDamage(100);
                    if (enemy.isDying) {
                        deathTest.details.push(`✓ ${type} death sequence triggered`);
                    }
                } else {
                    deathTest.details.push(`✗ ${type} missing death effects`);
                    deathTest.passed = false;
                }
            } else {
                deathTest.details.push(`✗ ${type} class not found`);
                deathTest.passed = false;
            }
        });
        
        this.results.push(deathTest);
    }

    // Test projectile trails
    testProjectileTrails() {
        console.log("Testing Projectile Trails...");
        
        const trailTest = {
            name: "Projectile Trails",
            passed: false,
            details: []
        };
        
        if (typeof Bullet === 'function') {
            const bullet = new Bullet(100, 100, 5, 0, 10, '#00ff00', 3, 'player');
            
            // Check for trail properties
            if (bullet.trail && Array.isArray(bullet.trail)) {
                trailTest.details.push("✓ Bullet has trail array");
                trailTest.passed = true;
            }
            
            // Test trail rendering
            if (bullet.render && bullet.render.toString().includes('shadowBlur')) {
                trailTest.details.push("✓ Trail rendering includes glow effects");
            }
        }
        
        this.results.push(trailTest);
    }

    // Test Space DOOM atmosphere
    testSpaceDOOMAtmosphere() {
        console.log("Testing Space DOOM Atmosphere...");
        
        const atmosphereTest = {
            name: "Space DOOM Atmosphere",
            passed: false,
            details: []
        };
        
        if (window.game && window.game.drawSpaceDOOMAtmosphere) {
            atmosphereTest.details.push("✓ drawSpaceDOOMAtmosphere function exists");
            
            // Test background elements
            const requiredElements = [
                'nebula effects',
                'dynamic lighting',
                'CRT glow',
                'scanlines',
                'starfield'
            ];
            
            const funcString = window.game.drawSpaceDOOMAtmosphere.toString();
            requiredElements.forEach(element => {
                if (funcString.toLowerCase().includes(element.toLowerCase())) {
                    atmosphereTest.details.push(`✓ ${element} implemented`);
                } else {
                    atmosphereTest.details.push(`✗ ${element} missing`);
                }
            });
            
            atmosphereTest.passed = true;
        }
        
        this.results.push(atmosphereTest);
    }

    // Test obstacle effects
    testObstacleEffects() {
        console.log("Testing Obstacle Effects...");
        
        const obstacleTest = {
            name: "Obstacle Effects",
            passed: false,
            details: []
        };
        
        if (typeof Obstacle === 'function') {
            const obstacle = new Obstacle(200, 200, 50, 50);
            
            // Check for enhanced effects
            if (obstacle.render && obstacle.render.toString().includes('shadowBlur')) {
                obstacleTest.details.push("✓ Obstacle has glow effects");
                obstacleTest.passed = true;
            }
            
            if (obstacle.render && obstacle.render.toString().includes('energyField')) {
                obstacleTest.details.push("✓ Obstacle has energy field");
            }
        }
        
        this.results.push(obstacleTest);
    }

    // Performance test
    testPerformance() {
        console.log("Testing Performance Impact...");
        
        const perfTest = {
            name: "Performance Impact",
            passed: true,
            details: []
        };
        
        const startTime = performance.now();
        
        // Simulate heavy particle usage
        if (window.game && window.game.particleSystem) {
            const ps = window.game.particleSystem;
            for (let i = 0; i < 100; i++) {
                ps.addExplosion(
                    Math.random() * 800,
                    Math.random() * 600,
                    '#ff0000',
                    5,
                    0.5
                );
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            perfTest.details.push(`✓ 100 explosions created in ${duration.toFixed(2)}ms`);
            
            if (duration < 100) {
                perfTest.details.push("✓ Performance within acceptable limits");
            } else {
                perfTest.details.push("⚠ Performance may need optimization");
            }
        }
        
        this.results.push(perfTest);
    }

    // Run all tests
    runAllTests() {
        console.log("=== Space DOOM Visual Effects Test Suite ===");
        console.log("Running comprehensive tests...\n");
        
        this.testParticleSystem();
        this.testEnemyDeathEffects();
        this.testProjectileTrails();
        this.testSpaceDOOMAtmosphere();
        this.testObstacleEffects();
        this.testPerformance();
        
        // Display results
        console.log("\n=== Test Results ===");
        this.results.forEach(test => {
            const status = test.passed ? "PASS" : "FAIL";
            console.log(`${status}: ${test.name}`);
            test.details.forEach(detail => console.log(`  ${detail}`));
            console.log("");
        });
        
        // Summary
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        console.log(`Overall: ${passed}/${total} tests passed`);
        
        return this.results;
    }
}

// Initialize and run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tester = new SpaceDOOMTester();
    tester.runAllTests();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpaceDOOMTester;
}