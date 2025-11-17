// Wallet Integration Component
// Displays mainnet wallet information and integration status

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { piMainnetWalletService, PiWalletAccount } from '@/services/piMainnetWalletService';
import { piBackendService } from '@/services/piBackendService';
import { useToast } from '@/hooks/use-toast';

const WalletIntegration: React.FC = () => {
  const { toast } = useToast();
  const [walletAccount, setWalletAccount] = useState<PiWalletAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setIsLoading(true);
      await piMainnetWalletService.refreshWalletBalance();
      const account = piMainnetWalletService.getWalletAccount();
      setWalletAccount(account);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading wallet info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
      variant: 'default',
    });
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const getWalletStatus = () => {
    if (!walletAccount) return { status: 'error', message: 'Wallet not loaded' };
    
    const balance = parseFloat(walletAccount.balances[0]?.balance || '0');
    if (balance > 100) return { status: 'excellent', message: 'Excellent balance' };
    if (balance > 50) return { status: 'good', message: 'Good balance' };
    if (balance > 10) return { status: 'low', message: 'Low balance' };
    return { status: 'critical', message: 'Critical balance' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading wallet information...</span>
      </div>
    );
  }

  if (!walletAccount) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Wallet Not Available
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to load wallet information from Pi Network mainnet.
          </p>
          <Button onClick={loadWalletInfo}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const walletStatus = getWalletStatus();
  const balance = walletAccount.balances[0]?.balance || '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Wallet Integration</h2>
          <p className="text-gray-600 mt-1">
            Pi Network mainnet wallet information and status
          </p>
        </div>
        <Button onClick={loadWalletInfo} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(walletStatus.status)}
              <span className="font-medium">Status: </span>
              <Badge className={getStatusColor(walletStatus.status)}>
                {walletStatus.message}
              </Badge>
            </div>
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Balance Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pi Balance</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                  >
                    {showPrivateInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {showPrivateInfo ? formatBalance(balance) : '••••••••'} π
                </div>
              </div>
            </div>

            {/* Wallet Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Wallet Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Account ID</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                      {showPrivateInfo ? walletAccount.account_id : '••••••••••••••••••••••••••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletAccount.account_id, 'Account ID')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Sequence</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                      {showPrivateInfo ? walletAccount.sequence : '••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletAccount.sequence, 'Sequence')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => window.open(`https://minepi.com/blockchain/accounts/${walletAccount.account_id}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on Blockchain
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(`https://api.mainnet.minepi.com/accounts/${walletAccount.account_id}/transactions`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Transactions
            </Button>
            
            <Button
              variant="outline"
              onClick={loadWalletInfo}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {walletAccount.balances.length}
              </div>
              <div className="text-sm text-gray-600">Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {walletAccount.signers.length}
              </div>
              <div className="text-sm text-gray-600">Signers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(walletAccount as any).num_sponsoring || 0}
              </div>
              <div className="text-sm text-gray-600">Sponsoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(walletAccount as any).num_sponsored || 0}
              </div>
              <div className="text-sm text-gray-600">Sponsored</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Information */}
      <Card>
        <CardHeader>
          <CardTitle>Network Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Network:</span>
              <span className="ml-2 text-gray-600">Pi Network Mainnet</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Last Modified:</span>
              <span className="ml-2 text-gray-600">
                {new Date(walletAccount.last_modified_time).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Ledger:</span>
              <span className="ml-2 text-gray-600">{(walletAccount as any).last_modified_ledger || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Subentry Count:</span>
              <span className="ml-2 text-gray-600">{(walletAccount as any).subentry_count || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletIntegration;
