// Test script for verifying the Valkyrie item fix
// This script adds testing functions to verify that the protector's invulnerability effect is properly removed when the protector is killed by Valkyrie

import { Protector } from './enemies/protector.js';
import { Swarmer } from './enemies/swarmer.js';
import { ValkyrieItem } from './items/Valkyrie.js';

class ValkyrieFixTest {
    constructor(game) {
        this.game = game;
        this.testResults = [];
        this.testRunning = false;
    }

    // Function to spawn a healer and a swarmer for testing
    spawnTestEnemies() {
        console.log("Spawning test enemies...");
        
        // Clear existing enemies for a clean test
        this.game.enemies = [];
        
        // Spawn a swarmer
        const swarmer = new Swarmer(400, 300);
        swarmer.activated = true;
        
        // Spawn a protector that will protect the swarmer
        const protector = new Protector(350, 300, [swarmer]);
        protector.activated = true;
        
        // Add enemies to the game
        this.game.enemies.push(swarmer);
        this.game.enemies.push(protector);
        
        console.log("Spawned protector at (", protector.position.x, ",", protector.position.y, ")");
        console.log("Spawned swarmer at (", swarmer.position.x, ",", swarmer.position.y, ")");
        console.log("Protector is protecting:", protector.protectedEnemy === swarmer);
        
        return { protector, swarmer };
    }

    // Function to test if an enemy is invulnerable
    testEnemyVulnerability(enemy, testName) {
        console.log("Testing vulnerability for", testName);
        
        // Store original health
        const originalHealth = enemy.health;
        
        // Try to damage the enemy
        enemy.takeDamage(10);
        
        // Check if health changed
        const isVulnerable = enemy.health < originalHealth;
        
        // Restore original health for further testing
        enemy.health = originalHealth;
        
        console.log(testName, "is", isVulnerable ? "vulnerable" : "invulnerable");
        return isVulnerable;
    }

    // Function to run the complete test
    runTest() {
        if (this.testRunning) {
            console.log("Test is already running!");
            return;
        }
        
        this.testRunning = true;
        this.testResults = [];
        console.log("=== Valkyrie Fix Test Started ===");
        
        // Spawn test enemies
        const { protector, swarmer } = this.spawnTestEnemies();
        
        // Verify initial state - swarmer should be invulnerable
        console.log("\n1. Testing initial protection state:");
        const initialVulnerability = this.testEnemyVulnerability(swarmer, "Swarmer (initial)");
        this.testResults.push({
            test: "Initial protection",
            result: !initialVulnerability,
            expected: true,
            passed: !initialVulnerability === true
        });
        
        // Activate Valkyrie item
        console.log("\n2. Activating Valkyrie item:");
        const valkyrie = new ValkyrieItem(this.game, 200, 200);
        valkyrie.activate();
        
        // Update the valkyrie to trigger the shockwave
        // We need to simulate the passage of time for the effect to complete
        console.log("Simulating Valkyrie effect...");
        
        // Set the activation time to simulate that the effect duration has passed
        valkyrie.activationTime = Date.now() - valkyrie.effectDuration - 100;
        
        // Update the valkyrie to trigger the shockwave
        valkyrie.update();
        
        // Check if protector was killed
        const protectorAlive = protector.health > 0;
        console.log("Protector is alive:", protectorAlive);
        
        this.testResults.push({
            test: "Protector killed by Valkyrie",
            result: !protectorAlive,
            expected: true,
            passed: !protectorAlive === true
        });
        
        // Check if swarmer is now vulnerable
        console.log("\n3. Testing swarmer vulnerability after Valkyrie activation:");
        const postValkyrieVulnerability = this.testEnemyVulnerability(swarmer, "Swarmer (after Valkyrie)");
        this.testResults.push({
            test: "Swarmer vulnerability after Valkyrie",
            result: postValkyrieVulnerability,
            expected: true,
            passed: postValkyrieVulnerability === true
        });
        
        // Print test results
        console.log("\n=== Test Results ===");
        let allPassed = true;
        this.testResults.forEach((result, index) => {
            console.log(`${index + 1}. ${result.test}: ${result.passed ? 'PASS' : 'FAIL'}`);
            console.log(`   Expected: ${result.expected}, Got: ${result.result}`);
            if (!result.passed) allPassed = false;
        });
        
        console.log("\nOverall result:", allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
        console.log("=== Valkyrie Fix Test Completed ===");
        
        this.testRunning = false;
        return allPassed;
    }

    // Function to add a button to the UI for running the test
    addTestButton() {
        // Create a test button in the DOM
        const testButton = document.createElement('button');
        testButton.id = 'valkyrieTestButton';
        testButton.textContent = 'Run Valkyrie Fix Test';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '10000';
        testButton.style.padding = '10px';
        testButton.style.backgroundColor = '#ff0000';
        testButton.style.color = '#ffffff';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '5px';
        testButton.style.cursor = 'pointer';
        
        testButton.addEventListener('click', () => {
            this.runTest();
        });
        
        document.body.appendChild(testButton);
        console.log("Valkyrie test button added to UI");
    }
}

// Make the test class available globally
window.ValkyrieFixTest = ValkyrieFixTest;

// Function to initialize the test when the game is ready
function initializeValkyrieTest() {
    if (window.game) {
        window.valkyrieTest = new ValkyrieFixTest(window.game);
        window.valkyrieTest.addTestButton();
        console.log("Valkyrie fix test initialized");
    } else {
        console.log("Game not ready, waiting...");
        setTimeout(initializeValkyrieTest, 1000);
    }
}

// Initialize the test when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeValkyrieTest);
} else {
    initializeValkyrieTest();
}

export { ValkyrieFixTest };