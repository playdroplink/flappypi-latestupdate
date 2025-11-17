import React, { useState } from 'react';
import { usePiStorage, useGameData, useWalletData } from '../hooks/usePiStorage';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';

interface PiStorageExampleProps {
  userId: string;
}

const PiStorageExample: React.FC<PiStorageExampleProps> = ({ userId }) => {
  const { toast } = useToast();
  const [newScore, setNewScore] = useState('');
  const [newCoins, setNewCoins] = useState('');
  const [newSkin, setNewSkin] = useState('');

  // Use Pi storage hooks
  const { 
    userData, 
    loading, 
    error, 
    storageStats,
    saveUserData,
    syncData,
    clearData,
    isPiStorage,
    isLocalStorage
  } = usePiStorage(userId, { autoSync: true });

  const { 
    gameData, 
    saveGameData, 
    addAchievement, 
    unlockSkin 
  } = useGameData(userId);

  const { 
    wallet, 
    saveWalletData, 
    addTransaction 
  } = useWalletData(userId);

  // Initialize user data if not exists
  const initializeUser = async () => {
    if (!userData) {
      const initialData = {
        userId,
        username: `Player_${userId.slice(0, 6)}`,
        profile: {
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString()
        },
        gameData: {
          highScore: 0,
          totalGames: 0,
          totalCoins: 0,
          achievements: [],
          unlockedSkins: ['classic'],
          currentSkin: 'classic',
          settings: {
            soundEnabled: true,
            musicEnabled: true,
            vibrationEnabled: true,
            difficulty: 'medium' as const
          }
        },
        wallet: {
          balance: 0,
          transactions: []
        },
        social: {
          friends: [],
          followers: [],
          following: [],
          posts: []
        },
        preferences: {
          language: 'en',
          theme: 'auto' as const,
          notifications: {
            gameUpdates: true,
            friendRequests: true,
            achievements: true,
            rewards: true
          }
        }
      };

      const success = await saveUserData(initialData);
      if (success) {
        toast({
          title: "User Initialized",
          description: "New user data created successfully!",
        });
      }
    }
  };

  // Update game score
  const updateScore = async () => {
    if (!gameData || !newScore) return;

    const score = parseInt(newScore);
    const newGameData = {
      ...gameData,
      highScore: Math.max(gameData.highScore, score),
      totalGames: gameData.totalGames + 1
    };

    const success = await saveGameData(newGameData);
    if (success) {
      toast({
        title: "Score Updated",
        description: `New high score: ${score}`,
      });
      setNewScore('');
    }
  };

  // Add coins
  const addCoins = async () => {
    if (!gameData || !newCoins) return;

    const coins = parseInt(newCoins);
    const newGameData = {
      ...gameData,
      totalCoins: gameData.totalCoins + coins
    };

    const success = await saveGameData(newGameData);
    if (success) {
      toast({
        title: "Coins Added",
        description: `Added ${coins} coins!`,
      });
      setNewCoins('');
    }
  };

  // Unlock skin
  const unlockNewSkin = async () => {
    if (!newSkin) return;

    const success = await unlockSkin(newSkin);
    if (success) {
      toast({
        title: "Skin Unlocked",
        description: `Unlocked ${newSkin} skin!`,
      });
      setNewSkin('');
    }
  };

  // Add achievement
  const addNewAchievement = async () => {
    const achievement = `achievement_${Date.now()}`;
    const success = await addAchievement(achievement);
    if (success) {
      toast({
        title: "Achievement Unlocked",
        description: `New achievement: ${achievement}`,
      });
    }
  };

  // Add transaction
  const addNewTransaction = async () => {
    if (!wallet) return;

    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'earn' as const,
      amount: 10,
      description: 'Game reward',
      timestamp: new Date().toISOString()
    };

    const success = await addTransaction(transaction);
    if (success) {
      toast({
        title: "Transaction Added",
        description: `Earned ${transaction.amount} Pi!`,
      });
    }
  };

  // Sync data
  const handleSync = async () => {
    const success = await syncData();
    if (success) {
      toast({
        title: "Data Synced",
        description: "Data synchronized successfully!",
      });
    } else {
      toast({
        title: "Sync Failed",
        description: "No data to sync or sync failed.",
        variant: "destructive"
      });
    }
  };

  // Clear data
  const handleClear = async () => {
    const success = await clearData();
    if (success) {
      toast({
        title: "Data Cleared",
        description: "All user data has been cleared.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading user data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Pi Storage Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Storage Type:</span>
              <Badge variant={isPiStorage ? "default" : "secondary"}>
                {storageStats.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Available:</span>
              <Badge variant={storageStats.available ? "default" : "destructive"}>
                {storageStats.available ? "Yes" : "No"}
              </Badge>
            </div>
            {storageStats.size !== undefined && (
              <div className="flex items-center justify-between">
                <span>Items:</span>
                <span>{storageStats.size}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Data */}
      {userData ? (
        <>
          {/* Game Data */}
          <Card>
            <CardHeader>
              <CardTitle>Game Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>High Score</Label>
                    <p className="text-2xl font-bold">{gameData?.highScore || 0}</p>
                  </div>
                  <div>
                    <Label>Total Games</Label>
                    <p className="text-2xl font-bold">{gameData?.totalGames || 0}</p>
                  </div>
                  <div>
                    <Label>Total Coins</Label>
                    <p className="text-2xl font-bold">{gameData?.totalCoins || 0}</p>
                  </div>
                  <div>
                    <Label>Achievements</Label>
                    <p className="text-2xl font-bold">{gameData?.achievements.length || 0}</p>
                  </div>
                </div>

                {/* Update Score */}
                <div className="space-y-2">
                  <Label>Update Score</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter score"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                    />
                    <Button onClick={updateScore}>Update</Button>
                  </div>
                </div>

                {/* Add Coins */}
                <div className="space-y-2">
                  <Label>Add Coins</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter coins"
                      value={newCoins}
                      onChange={(e) => setNewCoins(e.target.value)}
                    />
                    <Button onClick={addCoins}>Add</Button>
                  </div>
                </div>

                {/* Unlock Skin */}
                <div className="space-y-2">
                  <Label>Unlock Skin</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter skin ID"
                      value={newSkin}
                      onChange={(e) => setNewSkin(e.target.value)}
                    />
                    <Button onClick={unlockNewSkin}>Unlock</Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addNewAchievement}>Add Achievement</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Data */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Balance</Label>
                  <p className="text-2xl font-bold">{wallet?.balance || 0} Pi</p>
                </div>
                <div>
                  <Label>Transactions</Label>
                  <p className="text-sm text-gray-500">{wallet?.transactions.length || 0} transactions</p>
                </div>
                <Button onClick={addNewTransaction}>Add Transaction</Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={handleSync}>Sync Data</Button>
                <Button onClick={clearData} variant="destructive">Clear Data</Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">No user data found. Initialize to get started!</p>
              <Button onClick={initializeUser}>Initialize User</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PiStorageExample; 