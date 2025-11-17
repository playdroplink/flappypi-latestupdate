import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Data Recovery Service Component
 * Automatically recovers and syncs user data when they log back in
 */
const DataRecoveryService: React.FC = () => {
  const { isAuthenticated, piUser, isPiAuth } = useAuth();

  useEffect(() => {
    const handleDataRecovery = async () => {
      // Only run for authenticated Pi users
      if (!isAuthenticated || !isPiAuth || !piUser?.uid) {
        return;
      }

      try {
        // Check if there's data that needs recovery
        const needsRecovery = localStorage.getItem('flappypi-data-needs-recovery') === 'true';
        const lastLogout = localStorage.getItem('flappypi-last-logout');
        
        if (!needsRecovery && !lastLogout) {
          return; // No recovery needed
        }

        console.log('🔄 Data recovery needed - syncing preserved data to cloud...');

        // Import services
        const { inventoryService } = await import('../services/inventoryService');
        
        // Get preserved local data
        const localInventory = localStorage.getItem('flappypi-inventory');
        const localBalance = localStorage.getItem('flappypi-balance');
        
        let hasDataToRecover = false;
        
        // Recover inventory if available
        if (localInventory) {
          try {
            const inventory = JSON.parse(localInventory);
            if (inventory.length > 0) {
              console.log('📦 Recovering inventory data:', inventory.length, 'items');
              await inventoryService.saveInventoryToCloud(piUser.uid, inventory);
              hasDataToRecover = true;
            }
          } catch (error) {
            console.warn('⚠️ Failed to recover inventory:', error);
          }
        }
        
        // Recover wallet balance if available
        if (localBalance) {
          try {
            const balance = parseFloat(localBalance) || 0;
            if (balance > 0) {
              console.log('💰 Recovering wallet balance:', balance, 'coins');
              await inventoryService.syncWalletToCloud(piUser.uid, balance);
              hasDataToRecover = true;
            }
          } catch (error) {
            console.warn('⚠️ Failed to recover wallet balance:', error);
          }
        }
        
        if (hasDataToRecover) {
          // Perform full cloud sync to merge all data
          console.log('☁️ Performing full cloud sync after recovery...');
          await inventoryService.performFullCloudSync(piUser.uid);
          
          // Show success notification
          try {
            const { toast } = await import('../hooks/use-toast');
            toast({
              title: 'Data Recovered! 🎉',
              description: 'Your game progress has been successfully restored from your last session.',
              duration: 4000
            });
          } catch (toastError) {
            console.log('📱 Data recovery completed successfully');
          }
          
          // Dispatch recovery completion event
          window.dispatchEvent(new CustomEvent('data-recovery-complete', {
            detail: {
              userId: piUser.uid,
              username: piUser.username,
              recoveredAt: new Date().toISOString(),
              hasInventory: !!localInventory,
              hasWallet: !!localBalance
            }
          }));
        }
        
        // Clear recovery flags
        localStorage.removeItem('flappypi-data-needs-recovery');
        localStorage.removeItem('flappypi-last-logout');
        
        console.log('✅ Data recovery process completed');
        
      } catch (error) {
        console.error('❌ Data recovery failed:', error);
        
        // Clear flags even if recovery failed to prevent infinite attempts
        localStorage.removeItem('flappypi-data-needs-recovery');
        localStorage.removeItem('flappypi-last-logout');
      }
    };

    // Run recovery check after a short delay to ensure authentication is stable
    const recoveryTimeout = setTimeout(() => {
      handleDataRecovery();
    }, 2000);

    return () => clearTimeout(recoveryTimeout);
  }, [isAuthenticated, isPiAuth, piUser]);

  // This component doesn't render anything
  return null;
};

export default DataRecoveryService;