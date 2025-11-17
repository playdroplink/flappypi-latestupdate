import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Download, TrendingUp, Coins, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageWithFallback from '@/components/ImageWithFallback';
import { inventoryService, PurchaseHistory } from '@/services/inventoryService';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const PurchaseHistoryPage: React.FC = () => {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PurchaseHistory[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [statistics, setStatistics] = useState<any>(null);

  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  useEffect(() => {
    loadPurchaseHistory();
    loadStatistics();
  }, []);

  const loadPurchaseHistory = () => {
    const history = inventoryService.getPurchaseHistory();
    setPurchaseHistory(history);
    setFilteredHistory(history);
  };

  const loadStatistics = () => {
    const stats = inventoryService.getPurchaseStatistics();
    setStatistics(stats);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredHistory(purchaseHistory);
    } else {
      const filtered = purchaseHistory.filter(purchase => purchase.itemType === filter);
      setFilteredHistory(filtered);
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'pi_payment': return <Coins className="w-4 h-4" />;
      case 'coins_payment': return <Zap className="w-4 h-4" />;
      case 'subscription': return <TrendingUp className="w-4 h-4" />;
      case 'mystery_box': return <Zap className="w-4 h-4" />;
      case 'bundle': return <Zap className="w-4 h-4" />;
      case 'daily_reward': return <Zap className="w-4 h-4" />;
      case 'ad_reward': return <Zap className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
      <BackgroundDecoration />
      <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Purchase History</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Complete record of all your transactions and rewards.</p>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 w-full">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-800">{statistics.totalPurchases}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Pi Spent</p>
                    <p className="text-2xl font-bold text-green-800">{statistics.totalSpent.pi.toFixed(2)} π</p>
                  </div>
                  <Coins className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Coins Spent</p>
                    <p className="text-2xl font-bold text-yellow-800">{statistics.totalSpent.coins.toLocaleString()}</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Recent (30d)</p>
                    <p className="text-2xl font-bold text-purple-800">{statistics.recentPurchases.length}</p>
                  </div>
                  <Filter className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full" onValueChange={handleFilterChange}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="skin">Skins</TabsTrigger>
            <TabsTrigger value="powerup">Power-ups</TabsTrigger>
            <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
            <TabsTrigger value="mystery-box">Mystery Boxes</TabsTrigger>
            <TabsTrigger value="bundle">Bundles</TabsTrigger>
            <TabsTrigger value="coins">Coins</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="w-full">
            <div className="bg-white/60 rounded-xl shadow-lg p-6 w-full text-blue-900">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Filter className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No transactions found</p>
                  <p className="text-gray-600">No {activeFilter === 'all' ? '' : activeFilter} transactions in your history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((purchase) => (
                    <Card key={purchase.id} className="bg-white/80 border-blue-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {getPaymentMethodIcon(purchase.paymentMethod)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-blue-900">{purchase.itemName}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {purchase.itemType.replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Qty: {purchase.quantity}
                                </Badge>
                                {purchase.metadata?.subscriptionType && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    {purchase.metadata.subscriptionType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center justify-end space-x-2 mb-1">
                              <span className="font-bold text-lg">
                                {purchase.price > 0 ? `${purchase.price} ${purchase.currency === 'pi' ? 'π' : 'FC'}` : 'Free'}
                              </span>
                              <Badge className={`text-xs ${getStatusColor(purchase.status)}`}>
                                {purchase.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(purchase.purchasedAt).toLocaleDateString()} at {new Date(purchase.purchasedAt).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {purchase.transactionId.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                        
                        {purchase.metadata && (
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <div className="text-xs text-gray-600">
                              {purchase.metadata.bundleContents && (
                                <span>Bundle contents: {purchase.metadata.bundleContents.join(', ')}</span>
                              )}
                              {purchase.metadata.mysteryBoxType && (
                                <span>Box type: {purchase.metadata.mysteryBoxType}</span>
                              )}
                              {purchase.metadata.adProvider && (
                                <span>Ad provider: {purchase.metadata.adProvider}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PurchaseHistoryPage; 