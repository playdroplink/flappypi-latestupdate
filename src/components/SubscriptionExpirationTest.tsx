import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

const SubscriptionExpirationTest: React.FC = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [testSubscriptionId, setTestSubscriptionId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    updateSubscriptionStatus();
    
    // Listen for subscription changes
    const handleInventoryUpdated = () => {
      updateSubscriptionStatus();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdated);
    window.addEventListener('subscription-expired', handleInventoryUpdated);

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdated);
      window.removeEventListener('subscription-expired', handleInventoryUpdated);
    };
  }, []);

  const updateSubscriptionStatus = () => {
    const status = inventoryService.getSubscriptionStatus();
    setSubscriptionStatus(status);
  };

  const createTestSubscription = () => {
    const id = inventoryService.createTestSubscription('Test Premium Pack', 30); // 30 seconds
    setTestSubscriptionId(id);
    updateSubscriptionStatus();
    
    toast({
      title: 'Test Subscription Created',
      description: 'A test subscription has been created that will expire in 30 seconds.',
    });
  };

  const expireTestSubscription = () => {
    if (testSubscriptionId) {
      const success = inventoryService.expireSubscriptionForTesting(testSubscriptionId);
      if (success) {
        setTestSubscriptionId('');
        updateSubscriptionStatus();
        
        toast({
          title: 'Test Subscription Expired',
          description: 'The test subscription has been manually expired.',
          variant: 'destructive',
        });
      }
    }
  };

  const createMultipleTestSubscriptions = () => {
    // Create multiple subscriptions with different expiration times
    const id1 = inventoryService.createTestSubscription('Starter Pack', 60); // 1 minute
    const id2 = inventoryService.createTestSubscription('Premium Pack', 120); // 2 minutes
    const id3 = inventoryService.createTestSubscription('Ultimate Pack', 180); // 3 minutes
    
    updateSubscriptionStatus();
    
    toast({
      title: 'Multiple Test Subscriptions Created',
      description: 'Created 3 test subscriptions with different expiration times.',
    });
  };

  const clearAllSubscriptions = () => {
    const inventory = inventoryService.getInventory();
    const filtered = inventory.filter(item => item.type !== 'subscription');
    localStorage.setItem('flappypi-inventory', JSON.stringify(filtered));
    
    updateSubscriptionStatus();
    setTestSubscriptionId('');
    
    toast({
      title: 'All Subscriptions Cleared',
      description: 'All subscriptions have been removed from inventory.',
      variant: 'destructive',
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <AlertTriangle className="w-6 h-6" />
          Subscription Expiration Test Panel
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold text-gray-800 mb-3">Current Subscription Status</h3>
          {subscriptionStatus ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {subscriptionStatus.hasActiveSubscription ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {subscriptionStatus.hasActiveSubscription ? 'Active' : 'No Active'} Subscription
                </span>
              </div>
              
              {subscriptionStatus.hasActiveSubscription && (
                <div className="ml-7 space-y-1">
                  <div className="text-sm text-gray-600">
                    Type: {subscriptionStatus.subscriptionType}
                  </div>
                  <div className="text-sm text-gray-600">
                    Days Remaining: {subscriptionStatus.daysRemaining}
                  </div>
                  <div className="text-sm text-gray-600">
                    Expires: {subscriptionStatus.expiresAt ? new Date(subscriptionStatus.expiresAt).toLocaleString() : 'N/A'}
                  </div>
                  
                  {subscriptionStatus.activeSubscriptions.length > 1 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-purple-600 mb-2">
                        Multiple Active Subscriptions ({subscriptionStatus.activeSubscriptions.length}):
                      </div>
                      {subscriptionStatus.activeSubscriptions.map((sub: any, index: number) => (
                        <div key={sub.id} className="text-xs text-gray-500 ml-2">
                          {index + 1}. {sub.name} - {sub.daysRemaining} days left
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading status...</div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold text-gray-800 mb-3">Test Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={createTestSubscription}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create 30s Test Subscription
            </Button>
            
            <Button
              onClick={createMultipleTestSubscriptions}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Multiple Test Subscriptions
            </Button>
            
            <Button
              onClick={expireTestSubscription}
              disabled={!testSubscriptionId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Expire Test Subscription
            </Button>
            
            <Button
              onClick={clearAllSubscriptions}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Clear All Subscriptions
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-2">How to Test</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>1. Create a test subscription (30 seconds)</div>
            <div>2. Go to the game and test premium features</div>
            <div>3. Wait for expiration or manually expire</div>
            <div>4. Verify that ads and free features are restored</div>
            <div>5. Check that the ReviveModal switches to ad-based revive</div>
          </div>
        </div>

        {/* Real-time Monitor */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-bold text-gray-800 mb-3">Real-time Monitor</h3>
          <div className="text-sm text-gray-600">
            <div>• Expiration check runs every minute</div>
            <div>• ReviveModal checks every 30 seconds</div>
            <div>• Events dispatched on expiration</div>
            <div>• Immediate UI updates when expired</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionExpirationTest; 