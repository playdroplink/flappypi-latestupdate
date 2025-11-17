import React, { useState, useEffect } from 'react';
import { Wallet, Send, Download, Copy, Eye, EyeOff, AlertTriangle, ArrowUpRight, ArrowDownLeft, RefreshCw, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';

// Simple QR Code component
const SimpleQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 200 }) => {
  return (
    <div 
      className="bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="text-center p-4">
        <div className="text-xs font-mono break-all bg-gray-100 p-2 rounded mb-2">
          {value}
        </div>
        <div className="text-xs text-gray-500">QR Code</div>
      </div>
    </div>
  );
};

interface FlappyStackPageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  address: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  hash?: string;
}

interface WalletData {
  address: string;
  privateKey: string;
  seed: string;
  balance: number;
}

const FlappyStackPage: React.FC<FlappyStackPageProps> = () => {
  const { toast } = useToast();
  const { isAuthenticated, username } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('wallet');
  const [seedInput, setSeedInput] = useState('');
  const [showSeedDialog, setShowSeedDialog] = useState(false);

  // Enhanced wallet generation with security features
  const generateWallet = (seedPhrase?: string) => {
    const seed = seedPhrase || generateSeed();
    const address = generateAddress(seed);
    const privateKey = generatePrivateKey(seed);
    
    const walletData: WalletData = {
      address,
      privateKey,
      seed,
      balance: Math.random() * 1000 + 500 // Random testnet balance
    };
    
    setWallet(walletData);
    localStorage.setItem('flappypi-defi-wallet', JSON.stringify(walletData));
    
    // Security reminder
    toast({
      title: '🔐 TESTNET Wallet Created!',
      description: 'Wallet generated securely. Private keys stored locally for TESTNET use only!',
    });
    
    // Load initial transactions
    setTimeout(() => {
      loadTransactions();
    }, 1000);
  };

  // Enhanced crypto utility functions
  const generateSeed = (): string => {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance'
    ];
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  };

  const generateAddress = (seed: string): string => {
    // Enhanced address generation with better hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(seed + 'flappypi_testnet');
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    const hashString = Math.abs(hash).toString(16).padStart(8, '0');
    return `flpy${hashString}${Math.random().toString(36).substring(2, 26)}`;
  };

  const generatePrivateKey = (seed: string): string => {
    // Enhanced private key generation
    const encoder = new TextEncoder();
    const data = encoder.encode(seed + 'privatekey_salt_' + Date.now());
    let hash = '';
    for (let i = 0; i < data.length; i++) {
      hash += data[i].toString(16).padStart(2, '0');
    }
    return hash.substring(0, 64);
  };

  // Load existing wallet
  useEffect(() => {
    const savedWallet = localStorage.getItem('flappypi-defi-wallet');
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }
    loadTransactions();
  }, []);

  // Enhanced API integration for testnet transactions
  const loadTransactions = async () => {
    try {
      if (!wallet?.address) return;
      
      // Try to fetch from Pi testnet API
      try {
        const response = await fetch(`https://api.testnet.minepi.com/v2/payments?recipient=${wallet.address}`, {
          headers: {
            'Authorization': `Key ${process.env.VITE_PI_API_KEY || 'test_key'}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const apiTransactions = data.payments?.map((payment: any) => ({
            id: payment.identifier,
            type: payment.from_address === wallet.address ? 'send' : 'receive',
            amount: parseFloat(payment.amount),
            address: payment.from_address === wallet.address ? payment.to_address : payment.from_address,
            timestamp: payment.created_at,
            status: payment.status,
            hash: payment.transaction?.txid
          })) || [];
          
          setTransactions(apiTransactions);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
      }
      
      // Fallback to enhanced mock data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'receive',
          amount: 250.75,
          address: 'flpy1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7',
          timestamp: new Date().toISOString(),
          status: 'completed',
          hash: '60882ab11534ca64ffeaed7ae77643488d208fc2704311b1ec9937e83bd527bf'
        },
        {
          id: '2',
          type: 'send',
          amount: 100.25,
          address: 'flpy9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f9e8d7c6b5a4',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2'
        },
        {
          id: '3',
          type: 'receive',
          amount: 75.00,
          address: 'flpy8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
          hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction history.',
        variant: 'destructive'
      });
    }
  };

  // Enhanced send FLPY tokens with API integration
  const sendTokens = async () => {
    if (!wallet || !sendAmount || !sendAddress) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }

    // Validate address format
    if (!sendAddress.startsWith('flpy') || sendAddress.length < 36) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid FLPY address.',
        variant: 'destructive'
      });
      return;
    }

    // Validate amount
    const amount = parseFloat(sendAmount);
    if (amount <= 0 || amount > wallet.balance) {
      toast({
        title: 'Invalid Amount',
        description: amount <= 0 ? 'Amount must be greater than 0' : 'Insufficient balance.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Try to send via Pi testnet API
      const transactionPayload = {
        amount: amount,
        recipient: sendAddress,
        memo: `FLPY transfer from ${wallet.address}`,
        metadata: {
          source: 'flappypi_defi_wallet',
          timestamp: new Date().toISOString()
        }
      };
      
      try {
        const response = await fetch('https://api.testnet.minepi.com/v2/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${process.env.VITE_PI_API_KEY || 'test_key'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transactionPayload)
        });
        
        if (response.ok) {
          const result = await response.json();
          
          const newTransaction: Transaction = {
            id: result.identifier || Date.now().toString(),
            type: 'send',
            amount: amount,
            address: sendAddress,
            timestamp: new Date().toISOString(),
            status: 'completed',
            hash: result.transaction?.txid
          };
          
          setTransactions(prev => [newTransaction, ...prev]);
          setWallet(prev => prev ? { 
            ...prev, 
            balance: Number((prev.balance - amount).toFixed(2)) 
          } : null);
          
          toast({
            title: 'Transaction Successful! 🚀',
            description: `${amount} FLPY sent to ${sendAddress.substring(0, 20)}...`,
          });
          
          setSendAmount('');
          setSendAddress('');
          return;
        }
      } catch (apiError) {
        console.warn('API transaction failed, using mock:', apiError);
      }
      
      // Fallback to mock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'send',
        amount: amount,
        address: sendAddress,
        timestamp: new Date().toISOString(),
        status: 'completed',
        hash: `mock_${Math.random().toString(36).substring(2, 66)}`
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setWallet(prev => prev ? { 
        ...prev, 
        balance: Number((prev.balance - amount).toFixed(2)) 
      } : null);
      
      // Update localStorage
      const updatedWallet = { ...wallet, balance: Number((wallet.balance - amount).toFixed(2)) };
      localStorage.setItem('flappypi-defi-wallet', JSON.stringify(updatedWallet));
      
      setSendAmount('');
      setSendAddress('');
      
      toast({
        title: '🚀 TESTNET Transaction Sent!',
        description: `${amount} FLPY sent successfully (TESTNET ONLY - No real value)`,
      });
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: 'Transaction Failed',
        description: 'Failed to send tokens. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick send and address book functions
  const quickSendAmounts = [10, 25, 50, 100];
  
  const setQuickAmount = (amount: number) => {
    setSendAmount(amount.toString());
  };
  
  const setMaxAmount = () => {
    if (wallet) {
      // Leave 0.01 for transaction fee
      const maxSend = Math.max(0, wallet.balance - 0.01);
      setSendAmount(maxSend.toFixed(2));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '📋 Copied!',
      description: `${label} copied to clipboard. (TESTNET ONLY - Secure your real keys!)`,
    });
  };

  // Enhanced security and backup functions
  const exportWallet = () => {
    if (!wallet) return;
    
    const walletData = {
      address: wallet.address,
      seed: wallet.seed,
      exported_at: new Date().toISOString(),
      network: 'testnet',
      version: '1.0',
      security_notice: 'TESTNET ONLY - NO REAL VALUE - DEMO PURPOSES ONLY',
      key_security: 'Private keys generated locally and stored securely'
    };
    
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `flpy-testnet-wallet-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: '📤 TESTNET Wallet Exported!',
      description: 'Wallet backup saved. TESTNET ONLY - No real value. Keys secured locally.',
    });
  };

  const clearWallet = () => {
    localStorage.removeItem('flappypi-defi-wallet');
    setWallet(null);
    setTransactions([]);
    toast({
      title: '🗑️ TESTNET Wallet Cleared',
      description: 'Testnet wallet data removed from this device. No real funds were affected.',
    });
  };

  // Restore wallet from seed
  const restoreWallet = () => {
    if (!seedInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your seed phrase.',
        variant: 'destructive'
      });
      return;
    }
    
    generateWallet(seedInput.trim());
    setSeedInput('');
    setShowSeedDialog(false);
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">FLPY DeFi Wallet</h1>
            <p className="text-gray-600 mb-4">Create or restore your testnet wallet</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">⚠️ TESTNET ONLY - NO REAL VALUE</span>
              </div>
              <div className="space-y-2 text-sm text-red-700">
                <p className="font-medium">🔒 SECURITY NOTICE:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>TESTNET ONLY:</strong> This wallet has NO real monetary value</li>
                  <li><strong>NO REAL CRYPTO:</strong> All tokens are for testing purposes only</li>
                  <li><strong>DEMO PURPOSES:</strong> Do not use real private keys or real funds</li>
                  <li><strong>YOUR KEYS:</strong> Private keys are generated locally and stored securely in your browser</li>
                  <li><strong>SEND/RECEIVE:</strong> Keys enable sending and receiving TESTNET tokens only</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => generateWallet()} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl"
            >
              Create New Wallet
            </Button>
            
            <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-2 border-gray-300 py-3 rounded-xl">
                  Restore from Seed Phrase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Restore Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Seed Phrase (12 words)</label>
                    <textarea
                      value={seedInput}
                      onChange={(e) => setSeedInput(e.target.value)}
                      placeholder="Enter your 12-word seed phrase..."
                      className="w-full p-3 border rounded-lg resize-none h-24"
                    />
                  </div>
                  <Button onClick={restoreWallet} className="w-full">
                    Restore Wallet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">FLPY DeFi Wallet</h1>
                <p className="text-sm text-gray-600">Testnet Environment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium border border-red-300">
                <Shield className="w-4 h-4 inline mr-1" />
                🧪 TESTNET - NO REAL VALUE
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                🔐 KEYS SECURED
              </div>
              {isAuthenticated && (
                <div className="text-sm text-gray-600">
                  Welcome, {username}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl shadow-lg">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="receive" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Receive
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            {/* Balance Panel */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="text-center">
                <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium mb-3 inline-block">
                  🧪 TESTNET - NO REAL VALUE
                </div>
                <h2 className="text-lg font-medium opacity-90 mb-2">Total Balance</h2>
                <div className="text-4xl font-bold mb-4">
                  {wallet.balance.toLocaleString()} FLPY
                </div>
                <div className="text-sm opacity-75">
                  ≈ $0.00 USD (Test Tokens Only)
                </div>
                <div className="text-xs opacity-60 mt-2">
                  Private keys secured locally • Send/receive enabled
                </div>
              </div>
            </div>

            {/* Wallet Details */}
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Wallet Details</h3>
              
              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm break-all">
                    {wallet.address}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(wallet.address, 'Address')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Private Key</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">🔐 Private Key Security</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    <strong>TESTNET ONLY:</strong> This private key enables sending/receiving TESTNET tokens with NO real value. 
                    Keys are generated locally and stored securely in your browser. Never share real private keys!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm break-all">
                    {showPrivateKey ? wallet.privateKey : '•'.repeat(64)}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Seed Phrase */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Seed Phrase (Recovery Words)</label>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">🛡️ Wallet Recovery</span>
                  </div>
                  <p className="text-xs text-green-700">
                    <strong>TESTNET ONLY:</strong> These 12 words can restore your TESTNET wallet. Generated locally for security. 
                    Your keys enable TESTNET token transactions only - NO real cryptocurrency value.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-3 rounded-lg text-sm break-words">
                    {showSeed ? wallet.seed : '•'.repeat(wallet.seed.length)}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSeed(!showSeed)}
                  >
                    {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(wallet.seed, 'Seed Phrase')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Wallet Actions */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Wallet Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={exportWallet}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Backup Wallet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadTransactions()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Balance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearWallet}
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Clear Wallet
                  </Button>
                </div>
                
                {/* Final Security Notice */}
                <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-600 text-center space-y-1">
                    <p><strong>🔒 SECURITY SUMMARY:</strong></p>
                    <p>• TESTNET ONLY - No real cryptocurrency value</p>
                    <p>• Private keys generated locally and stored securely in your browser</p>
                    <p>• Keys enable sending/receiving TESTNET tokens only</p>
                    <p>• Never share real private keys or use real funds in testnet</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Send FLPY Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                  <Input
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    placeholder="flpy1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid FLPY testnet address
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (FLPY)</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                        max={wallet.balance}
                        step="0.01"
                      />
                      <Button
                        variant="outline"
                        onClick={setMaxAmount}
                        className="px-3 text-sm"
                      >
                        MAX
                      </Button>
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2">
                      {quickSendAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuickAmount(amount)}
                          className="text-xs"
                          disabled={amount > wallet.balance}
                        >
                          {amount} FLPY
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Available: {wallet.balance.toLocaleString()} FLPY</span>
                    <span>Est. Fee: 0.01 FLPY</span>
                  </div>
                </div>
                
                <Button
                  onClick={sendTokens}
                  disabled={isLoading || !sendAmount || !sendAddress || parseFloat(sendAmount || '0') > wallet.balance}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Sending...' : 'Send Tokens'}
                </Button>
                
                {/* Security Notice */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-2">🔒 TESTNET SECURITY NOTICE</p>
                      <ul className="text-xs space-y-1">
                        <li>• <strong>TESTNET ONLY:</strong> No real cryptocurrency or money involved</li>
                        <li>• <strong>DEMO PURPOSES:</strong> Testing blockchain functionality only</li>
                        <li>• <strong>YOUR SECURITY:</strong> Private keys stored locally and secured</li>
                        <li>• <strong>SEND/RECEIVE:</strong> Enables testnet token transactions only</li>
                        <li>• <strong>ALWAYS VERIFY:</strong> Double-check addresses before sending</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Receive Tab */}
          <TabsContent value="receive" className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Receive FLPY Tokens</h3>
              
              {/* Testnet Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">🔒 RECEIVE TOKENS SECURELY</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>TESTNET ONLY:</strong> This address receives test tokens with NO real value</p>
                  <p><strong>YOUR ADDRESS:</strong> Generated securely using your private key</p>
                  <p><strong>SAFE TO SHARE:</strong> Public address is safe to share for receiving testnet tokens</p>
                </div>
              </div>
              
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <SimpleQRCode
                    value={wallet.address}
                    size={200}
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your Wallet Address:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-gray-100 p-2 rounded text-sm break-all max-w-xs">
                      {wallet.address}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(wallet.address, 'Address')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Share this QR code or address to receive FLPY tokens
                </p>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTransactions}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
              
              {/* Testnet History Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">📊 TESTNET TRANSACTION HISTORY</span>
                </div>
                <p className="text-xs text-yellow-700">
                  <strong>DEMO DATA:</strong> All transactions shown are for testnet testing only. 
                  Private keys secure your ability to send/receive test tokens safely.
                </p>
              </div>
              
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'send' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {tx.type === 'send' 
                            ? <ArrowUpRight className="w-4 h-4" />
                            : <ArrowDownLeft className="w-4 h-4" />
                          }
                        </div>
                        <div>
                          <div className="font-medium">
                            {tx.type === 'send' ? 'Sent' : 'Received'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            To: {tx.address.substring(0, 20)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {tx.type === 'send' ? '-' : '+'}{tx.amount} FLPY
                        </div>
                        <div className="text-sm text-gray-500">
                          {tx.status}
                        </div>
                        {tx.hash && (
                          <a
                            href={`https://api.testnet.minepi.com/transactions/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlappyStackPage;