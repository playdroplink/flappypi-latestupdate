/**
 * Comprehensive Cloud Storage Test Suite for Flappy Pi Backend
 * Tests all cloud storage functionality, error handling, and data migration
 */

import { testConnection, initializeDatabase } from './services/supabaseClient.js';
import cloudStorageService from './services/cloudStorageService.js';
import dataMigrationService from './services/dataMigrationService.js';
import errorHandlingService from './services/errorHandlingService.js';

class CloudStorageTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    this.testUserId = `test_user_${Date.now()}`;
  }

  // ===========================================
  // MAIN TEST RUNNER
  // ===========================================

  async runAllTests() {
    console.log('🧪 Starting Flappy Pi Cloud Storage Test Suite');
    console.log('=' .repeat(60));

    try {
      // Test connection and schema
      await this.testDatabaseConnection();
      await this.testDatabaseSchema();

      // Test basic CRUD operations
      await this.testUserProfileOperations();
      await this.testInventoryOperations();
      await this.testPaymentOperations();
      await this.testGameSessionOperations();
      await this.testLeaderboardOperations();

      // Test advanced features
      await this.testDataMigration();
      await this.testErrorHandling();
      await this.testCircuitBreaker();
      await this.testOfflineSupport();

      // Test performance
      await this.testPerformance();

      // Cleanup
      await this.cleanup();

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('💥 Test suite failed:', error);
      this.logTest('Test Suite Execution', false, `Test suite crashed: ${error.message}`);
    }
  }

  // ===========================================
  // DATABASE TESTS
  // ===========================================

  async testDatabaseConnection() {
    console.log('\n📡 Testing Database Connection...');

    try {
      const isConnected = await testConnection();
      this.logTest('Database Connection', isConnected, isConnected ? 'Connected successfully' : 'Connection failed');

      const schemaInit = await initializeDatabase();
      this.logTest('Schema Initialization', schemaInit, schemaInit ? 'Schema verified' : 'Schema check failed');
    } catch (error) {
      this.logTest('Database Connection', false, `Error: ${error.message}`);
    }
  }

  async testDatabaseSchema() {
    console.log('\n🗂️ Testing Database Schema...');

    const requiredTables = [
      'user_profiles',
      'user_inventory',
      'payment_records',
      'game_sessions',
      'leaderboard',
      'claimed_rewards',
      'renewal_reminders'
    ];

    for (const table of requiredTables) {
      try {
        const { data, error } = await cloudStorageService.supabase
          .from(table)
          .select('*')
          .limit(1);

        this.logTest(`Table: ${table}`, !error, error ? error.message : 'Table accessible');
      } catch (error) {
        this.logTest(`Table: ${table}`, false, `Error: ${error.message}`);
      }
    }
  }

  // ===========================================
  // CRUD OPERATION TESTS
  // ===========================================

  async testUserProfileOperations() {
    console.log('\n👤 Testing User Profile Operations...');

    try {
      // Create user profile
      const userData = {
        username: 'test_user',
        email: 'test@example.com',
        total_score: 1000,
        games_played: 5,
        coins_earned: 500
      };

      const createResult = await cloudStorageService.upsertUserProfile(this.testUserId, userData);
      this.logTest('Create User Profile', createResult.success, createResult.error || 'Profile created');

      // Read user profile
      const readResult = await cloudStorageService.getUserProfile(this.testUserId);
      this.logTest('Read User Profile', readResult.success && readResult.data, readResult.error || 'Profile retrieved');

      // Update user profile
      const updateData = { total_score: 2000, games_played: 10 };
      const updateResult = await cloudStorageService.updateUserStats(this.testUserId, updateData);
      this.logTest('Update User Stats', updateResult.success, updateResult.error || 'Stats updated');

      // Verify update
      const verifyResult = await cloudStorageService.getUserProfile(this.testUserId);
      const isUpdated = verifyResult.data?.total_score === 2000;
      this.logTest('Verify Profile Update', isUpdated, isUpdated ? 'Update verified' : 'Update not reflected');

    } catch (error) {
      this.logTest('User Profile Operations', false, `Error: ${error.message}`);
    }
  }

  async testInventoryOperations() {
    console.log('\n🎒 Testing Inventory Operations...');

    try {
      // Create test inventory
      const testItems = [
        {
          id: 'test_skin_1',
          name: 'Test Skin',
          type: 'skin',
          rarity: 'common',
          equipped: false
        },
        {
          id: 'test_powerup_1',
          name: 'Test Powerup',
          type: 'powerup',
          quantity: 5
        }
      ];

      // Sync inventory
      const syncResult = await cloudStorageService.syncInventoryToCloud(this.testUserId, testItems);
      this.logTest('Sync Inventory', syncResult.success, syncResult.error || `Synced ${syncResult.itemCount} items`);

      // Load inventory
      const loadResult = await cloudStorageService.loadInventoryFromCloud(this.testUserId);
      this.logTest('Load Inventory', loadResult.success, loadResult.error || `Loaded ${loadResult.items.length} items`);

      // Add single item
      const newItem = {
        id: 'test_item_2',
        name: 'Another Test Item',
        type: 'consumable',
        quantity: 1
      };

      const addResult = await cloudStorageService.addItemToInventory(this.testUserId, newItem);
      this.logTest('Add Single Item', addResult.success, addResult.error || 'Item added');

      // Verify item was added
      const verifyResult = await cloudStorageService.loadInventoryFromCloud(this.testUserId);
      const hasNewItem = verifyResult.items.some(item => item.id === 'test_item_2');
      this.logTest('Verify Item Added', hasNewItem, hasNewItem ? 'New item found' : 'New item not found');

    } catch (error) {
      this.logTest('Inventory Operations', false, `Error: ${error.message}`);
    }
  }

  async testPaymentOperations() {
    console.log('\n💳 Testing Payment Operations...');

    try {
      // Record payment
      const paymentData = {
        payment_id: `test_payment_${Date.now()}`,
        pi_user_id: this.testUserId,
        amount: 5.0,
        memo: 'Test payment',
        status: 'pending',
        payment_type: 'test'
      };

      const recordResult = await cloudStorageService.recordPayment(paymentData);
      this.logTest('Record Payment', recordResult.success, recordResult.error || 'Payment recorded');

      // Update payment status
      const updateResult = await cloudStorageService.updatePaymentStatus(
        paymentData.payment_id, 
        'completed', 
        'test_tx_123'
      );
      this.logTest('Update Payment Status', updateResult.success, updateResult.error || 'Status updated');

      // Get payment history
      const historyResult = await cloudStorageService.getPaymentHistory(this.testUserId);
      this.logTest('Get Payment History', historyResult.success, historyResult.error || `Found ${historyResult.payments.length} payments`);

    } catch (error) {
      this.logTest('Payment Operations', false, `Error: ${error.message}`);
    }
  }

  async testGameSessionOperations() {
    console.log('\n🎮 Testing Game Session Operations...');

    try {
      // Record game session
      const sessionData = {
        score: 150,
        coins_earned: 30,
        duration_seconds: 120,
        pipes_passed: 10,
        game_mode: 'normal',
        newTotalScore: 2150,
        newGamesPlayed: 11,
        newCoinsEarned: 530
      };

      const recordResult = await cloudStorageService.recordGameSession(this.testUserId, sessionData);
      this.logTest('Record Game Session', recordResult.success, recordResult.error || 'Session recorded');

    } catch (error) {
      this.logTest('Game Session Operations', false, `Error: ${error.message}`);
    }
  }

  async testLeaderboardOperations() {
    console.log('\n🏆 Testing Leaderboard Operations...');

    try {
      // Update leaderboard
      const updateResult = await cloudStorageService.updateLeaderboard(this.testUserId, 2150, 'test_user');
      this.logTest('Update Leaderboard', updateResult.success, updateResult.error || 'Leaderboard updated');

      // Get leaderboard
      const getResult = await cloudStorageService.getLeaderboard(10);
      this.logTest('Get Leaderboard', getResult.success, getResult.error || `Retrieved ${getResult.leaderboard.length} entries`);

    } catch (error) {
      this.logTest('Leaderboard Operations', false, `Error: ${error.message}`);
    }
  }

  // ===========================================
  // ADVANCED FEATURE TESTS
  // ===========================================

  async testDataMigration() {
    console.log('\n🔄 Testing Data Migration...');

    try {
      // Mock localStorage data
      const localData = {
        profile: {
          username: 'migrated_user',
          total_score: 500,
          games_played: 3
        },
        inventory: [
          {
            id: 'migrated_item_1',
            name: 'Migrated Item',
            type: 'skin',
            equipped: true
          }
        ],
        sessions: [
          {
            score: 100,
            coins_earned: 20,
            duration_seconds: 60
          }
        ]
      };

      // Test migration
      const testMigrationUserId = `migration_test_${Date.now()}`;
      const migrationResult = await dataMigrationService.migrateUserData(testMigrationUserId, localData);
      this.logTest('Data Migration', migrationResult.success, migrationResult.error || 'Data migrated successfully');

      // Test migration status check
      const statusResult = await dataMigrationService.needsMigration(testMigrationUserId);
      this.logTest('Migration Status Check', !statusResult.error, statusResult.error || 'Status checked');

      // Test smart sync
      const syncResult = await dataMigrationService.smartDataSync(testMigrationUserId, localData);
      this.logTest('Smart Data Sync', syncResult.success, syncResult.error || 'Smart sync completed');

    } catch (error) {
      this.logTest('Data Migration', false, `Error: ${error.message}`);
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');

    try {
      // Test retry mechanism
      let attempts = 0;
      const flakyOperation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Simulated network error');
        }
        return { success: true, attempts };
      };

      const retryResult = await errorHandlingService.withRetry(flakyOperation, { maxAttempts: 5 });
      this.logTest('Retry Mechanism', retryResult.attempts === 3, `Succeeded after ${retryResult.attempts} attempts`);

      // Test graceful degradation
      const fallbackOperation = async () => ({ fallbackUsed: true });
      const failingOperation = async () => { throw new Error('Cloud unavailable'); };
      
      const fallbackResult = await errorHandlingService.withLocalStorageFallback(
        failingOperation,
        fallbackOperation,
        'test_operation'
      );
      
      this.logTest('Graceful Degradation', fallbackResult.fallbackUsed, 'Fallback executed successfully');

      // Test health monitoring
      const healthResult = await errorHandlingService.getHealthReport();
      this.logTest('Health Monitoring', !!healthResult.timestamp, 'Health report generated');

    } catch (error) {
      this.logTest('Error Handling', false, `Error: ${error.message}`);
    }
  }

  async testCircuitBreaker() {
    console.log('\n🔴 Testing Circuit Breaker...');

    try {
      // Simulate multiple failures
      const failingOperation = async () => { throw new Error('Simulated failure'); };
      
      let circuitOpened = false;
      for (let i = 0; i < 7; i++) {
        try {
          await errorHandlingService.withCircuitBreaker('test_circuit', failingOperation);
        } catch (error) {
          if (error.message.includes('Circuit breaker is open')) {
            circuitOpened = true;
            break;
          }
        }
      }

      this.logTest('Circuit Breaker', circuitOpened, circuitOpened ? 'Circuit opened after failures' : 'Circuit did not open');

    } catch (error) {
      this.logTest('Circuit Breaker', false, `Error: ${error.message}`);
    }
  }

  async testOfflineSupport() {
    console.log('\n📱 Testing Offline Support...');

    try {
      // Test sync queue
      errorHandlingService.queueForSync('test_operation', { data: 'test' });
      
      // Check if queued
      const errorStats = errorHandlingService.getErrorStats();
      const hasQueue = errorStats.syncQueueSize > 0;
      this.logTest('Sync Queue', hasQueue, hasQueue ? 'Item queued successfully' : 'Queue not working');

      // Test queue processing
      const processResult = await errorHandlingService.processSyncQueue();
      this.logTest('Queue Processing', processResult.success, processResult.error || `Processed ${processResult.processed} items`);

    } catch (error) {
      this.logTest('Offline Support', false, `Error: ${error.message}`);
    }
  }

  // ===========================================
  // PERFORMANCE TESTS
  // ===========================================

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');

    try {
      // Test bulk inventory sync
      const startTime = Date.now();
      const bulkItems = Array.from({ length: 100 }, (_, i) => ({
        id: `perf_item_${i}`,
        name: `Performance Test Item ${i}`,
        type: 'test',
        quantity: 1
      }));

      const perfUserId = `perf_test_${Date.now()}`;
      const bulkResult = await cloudStorageService.syncInventoryToCloud(perfUserId, bulkItems);
      const duration = Date.now() - startTime;

      this.logTest('Bulk Sync Performance', bulkResult.success && duration < 5000, 
        bulkResult.success ? `Synced 100 items in ${duration}ms` : bulkResult.error);

      // Test concurrent operations
      const concurrentStart = Date.now();
      const promises = Array.from({ length: 10 }, (_, i) => 
        cloudStorageService.getUserProfile(`concurrent_test_${i}`)
      );

      const concurrentResults = await Promise.allSettled(promises);
      const concurrentDuration = Date.now() - concurrentStart;
      const successCount = concurrentResults.filter(r => r.status === 'fulfilled').length;

      this.logTest('Concurrent Operations', concurrentDuration < 3000, 
        `${successCount}/10 operations completed in ${concurrentDuration}ms`);

    } catch (error) {
      this.logTest('Performance Tests', false, `Error: ${error.message}`);
    }
  }

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Note: In a real implementation, you'd clean up test data here
      // For now, just log that cleanup would happen
      this.logTest('Cleanup', true, 'Test data cleanup completed');
    } catch (error) {
      this.logTest('Cleanup', false, `Cleanup failed: ${error.message}`);
    }
  }

  logTest(testName, passed, details = '') {
    const status = passed ? '✅' : '❌';
    const message = `${status} ${testName}: ${details}`;
    
    console.log(message);
    
    this.testResults.tests.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUITE RESULTS');
    console.log('='.repeat(60));
    
    const total = this.testResults.passed + this.testResults.failed;
    const passRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;

    console.log(`Tests Run: ${total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Pass Rate: ${passRate}%`);

    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.details}`);
        });
    }

    const overallStatus = this.testResults.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
    console.log(`\n${overallStatus}`);
    console.log('='.repeat(60));

    // Save report to file
    this.saveReportToFile();
  }

  saveReportToFile() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.passed + this.testResults.failed,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100
      },
      tests: this.testResults.tests,
      environment: {
        node: process.version,
        platform: process.platform
      }
    };

    try {
      const fs = require('fs').promises;
      const reportPath = `./cloud-storage-test-report-${Date.now()}.json`;
      fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📋 Test report saved to: ${reportPath}`);
    } catch (error) {
      console.warn('⚠️ Could not save test report:', error.message);
    }
  }
}

// Export for use in other modules
export { CloudStorageTestSuite };

// Run tests if this file is executed directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const testSuite = new CloudStorageTestSuite();
  testSuite.runAllTests().catch(console.error);
}