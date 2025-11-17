import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, Coins, ArrowUpRight, ArrowDownLeft, QrCode, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// FLPY Token Service for wallet operations
class FLPYWalletService {
  private static instance: FLPYWalletService;
  private apiUrl = process.env.REACT_APP_BACKEND_URL || 'https://flappypi.fun/api';
  private flpyIssuer = process.env.REACT_APP_FLPY_TOKEN_ISSUER;

  static getInstance() {
    if (!FLPYWalletService.instance) {
      FLPYWalletService.instance = new FLPYWalletService();
    }
    return FLPYWalletService.instance;
  }

  async getUserFLPYBalance(piUID: string): Promise<{ balance: number; hasError: boolean }> {
    try {
      const response = await fetch(`${this.apiUrl}/flpy/balance/${piUID}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      return { balance: data.balance || 0, hasError: false };
    } catch (error) {
      console.error('Error fetching FLPY balance:', error);
      return { balance: 0, hasError: true };
    }
  }

  async checkUserTrustline(piUID: string): Promise<{ hasTrustline: boolean; balance: number }> {
    try {
      const response = await fetch(`${this.apiUrl}/flpy/check-trustline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piUID })
      });
      
      if (!response.ok) {
        throw new Error('Failed to check trustline');
      }
      
      const data = await response.json();
      return {
        hasTrustline: data.success && data.hasTrustline,
        balance: data.balance || 0
      };
    } catch (error) {
      console.error('Error checking FLPY trustline:', error);
      return { hasTrustline: false, balance: 0 };
    }
  }

  async sendFLPY(fromPiUID: string, toWalletAddress: string, amount: string, memo?: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/flpy/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPiUID,
          toWalletAddress,
          amount,
          memo: memo || `FLPY transfer from Flappy Pi app`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send FLPY');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending FLPY:', error);
      return { success: false, error: error.message };
    }
  }

  async getTransactionHistory(piUID: string): Promise<Array<{
    hash: string;
    type: 'send' | 'receive';
    amount: string;
    from?: string;
    to?: string;
    memo?: string;
    timestamp: string;
  }>> {
    try {
      const response = await fetch(`${this.apiUrl}/flpy/transactions/${piUID}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching FLPY transactions:', error);
      return [];
    }
  }
}

interface FLPYWalletComponentProps {
  className?: string;
}

const FLPYWalletComponent: React.FC<FLPYWalletComponentProps> = ({ className = '' }) => {
  const { piUser } = useAuth();
  const { toast } = useToast();
  const [flpyBalance, setFlpyBalance] = useState(0);
  const [hasTrustline, setHasTrustline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendMemo, setSendMemo] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const flpyService = FLPYWalletService.getInstance();
  const userWalletAddress = piUser?.walletAddress || '';

  // Load FLPY wallet data
  useEffect(() => {
    if (piUser?.uid) {
      loadWalletData();
    }
  }, [piUser?.uid]);

  const loadWalletData = async () => {
    if (!piUser?.uid) return;
    
    setLoading(true);
    try {
      // Check trustline and get balance
      const trustlineResult = await flpyService.checkUserTrustline(piUser.uid);
      setHasTrustline(trustlineResult.hasTrustline);
      setFlpyBalance(trustlineResult.balance);
      
      // Load transaction history
      const txHistory = await flpyService.getTransactionHistory(piUser.uid);
      setTransactions(txHistory);
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FLPY wallet data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendFLPY = async () => {
    if (!piUser?.uid || !sendAddress || !sendAmount) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(sendAmount);
    if (amount <= 0 || amount > flpyBalance) {
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0 and not exceed your balance',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const result = await flpyService.sendFLPY(
        piUser.uid,
        sendAddress,
        sendAmount,
        sendMemo
      );

      if (result.success) {
        toast({
          title: 'FLPY Sent Successfully!',
          description: `Sent ${sendAmount} FLPY to ${sendAddress.slice(0, 8)}...`,
          variant: 'default'
        });
        
        // Reset form and reload data
        setSendAddress('');
        setSendAmount('');
        setSendMemo('');
        setShowSendModal(false);
        loadWalletData();
      } else {
        throw new Error(result.error || 'Send failed');
      }
    } catch (error) {
      console.error('Error sending FLPY:', error);
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send FLPY tokens',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const copyWalletAddress = () => {
    if (userWalletAddress) {
      navigator.clipboard.writeText(userWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
        variant: 'default'
      });
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7
    });
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-xl bg-white shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!piUser?.uid) {
    return (
      <div className={`p-6 rounded-xl bg-white shadow-lg ${className}`}>
        <div className="text-center py-8">
          <Coins className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">FLPY Wallet</h3>
          <p className="text-gray-500">Please log in with Pi Network to access your FLPY wallet</p>
        </div>
      </div>
    );
  }

  if (!hasTrustline) {
    return (
      <div className={`p-6 rounded-xl bg-white shadow-lg ${className}`}>
        <div className="text-center py-8">
          <Coins className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Add FLPY to Pi Wallet</h3>
          <p className="text-gray-600 mb-4">To receive FLPY tokens, you need to add FLPY to your Pi Wallet first:</p>
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open Pi Wallet → Assets</li>
              <li>Search for "FLPY" or tap "Add Asset"</li>
              <li>Enter Asset Code: <strong>FLPY</strong></li>
              <li>Issuer: <code className="text-xs bg-gray-200 px-1 rounded">{process.env.REACT_APP_FLPY_TOKEN_ISSUER}</code></li>
              <li>Confirm trustline creation</li>
            </ol>
          </div>
          <Button 
            onClick={loadWalletData}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Refresh After Adding FLPY
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl bg-white shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img 
            src="/image-png.png" 
            alt="FLPY" 
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.src = '/flappycoins.png';
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">FLPY Wallet</h2>
            <p className="text-sm text-gray-500">Flappy Pi Tokens</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadWalletData}
          disabled={loading}
        >
          <ArrowDownLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Balance */}
      <div className="text-center py-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg mb-6">
        <div className="text-3xl font-bold text-gray-800 mb-1">
          {formatAmount(flpyBalance)} <span className="text-lg font-medium text-yellow-600">FLPY</span>
        </div>
        <p className="text-sm text-gray-600">
          Wallet: {formatAddress(userWalletAddress)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          onClick={() => setShowSendModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3"
          disabled={flpyBalance <= 0}
        >
          <Send className="w-4 h-4 mr-2" />
          Send FLPY
        </Button>
        <Button
          onClick={() => setShowReceiveModal(true)}
          variant="outline"
          className="py-3"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Receive
        </Button>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No FLPY transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.hash} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {tx.type === 'send' ? (
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {tx.type === 'send' ? 'Sent' : 'Received'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.type === 'send' ? '-' : '+'}{formatAmount(parseFloat(tx.amount))} FLPY
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.type === 'send' ? formatAddress(tx.to || '') : formatAddress(tx.from || '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send FLPY Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send FLPY Tokens</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Recipient Wallet Address
              </label>
              <Input
                placeholder="Enter Pi wallet address (G...)"
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Amount (FLPY)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                max={flpyBalance}
                step="0.0000001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatAmount(flpyBalance)} FLPY
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Memo (Optional)
              </label>
              <Input
                placeholder="Transaction memo"
                value={sendMemo}
                onChange={(e) => setSendMemo(e.target.value)}
                maxLength={28}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSendModal(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleSendFLPY}
                disabled={sending || !sendAddress || !sendAmount}
              >
                {sending ? 'Sending...' : 'Send FLPY'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive FLPY Modal */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receive FLPY Tokens</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Share your wallet address to receive FLPY tokens:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="font-mono text-sm text-gray-800 break-all mb-3">
                  {userWalletAddress}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyWalletAddress}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>⚠️ Only send FLPY tokens to this address</p>
              <p>Sending other tokens may result in loss</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FLPYWalletComponent;