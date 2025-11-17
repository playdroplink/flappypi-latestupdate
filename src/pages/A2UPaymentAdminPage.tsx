import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Send, 
  Users, 
  Trophy, 
  Gift, 
  Award, 
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Loader2
} from 'lucide-react';
import A2UPaymentModal from '../components/A2UPaymentModal';
import BulkA2UPaymentModal from '../components/BulkA2UPaymentModal';
import { a2uPaymentService } from '../services/a2uPaymentService';
import { useToast } from '../components/ui/use-toast';

const A2UPaymentAdminPage: React.FC = () => {
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Quick reward templates
  const quickRewards = [
    {
      name: 'Daily Login Bonus',
      icon: Calendar,
      description: 'Send daily login bonus to user',
      action: async (userUid: string) => {
        setIsLoading(true);
        try {
          const response = await a2uPaymentService.sendDailyBonus(userUid, 1);
          if (response.success) {
            toast({
              title: "Daily Bonus Sent! 🎉",
              description: `Daily bonus sent to user ${userUid}`,
            });
          } else {
            toast({
              title: "Bonus Failed",
              description: response.error || "Failed to send daily bonus",
              variant: "destructive"
            });
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to send daily bonus",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    {
      name: 'Achievement Reward',
      icon: Award,
      description: 'Send achievement reward to user',
      action: async (userUid: string) => {
        setIsLoading(true);
        try {
          const response = await a2uPaymentService.sendAchievementReward(
            userUid, 
            'First Achievement', 
            1.0
          );
          if (response.success) {
            toast({
              title: "Achievement Reward Sent! 🏆",
              description: `Achievement reward sent to user ${userUid}`,
            });
          } else {
            toast({
              title: "Reward Failed",
              description: response.error || "Failed to send achievement reward",
              variant: "destructive"
            });
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to send achievement reward",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    {
      name: 'Tournament Prize',
      icon: Trophy,
      description: 'Send tournament prize to winner',
      action: async (userUid: string) => {
        setIsLoading(true);
        try {
          const response = await a2uPaymentService.sendTournamentPrize(
            userUid, 
            'Weekly Tournament', 
            1, 
            5.0
          );
          if (response.success) {
            toast({
              title: "Tournament Prize Sent! 🏆",
              description: `Tournament prize sent to user ${userUid}`,
            });
          } else {
            toast({
              title: "Prize Failed",
              description: response.error || "Failed to send tournament prize",
              variant: "destructive"
            });
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to send tournament prize",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
  ];

  const [quickUserUid, setQuickUserUid] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            A2U Payment Admin
          </h1>
          <p className="text-gray-600">
            Manage App-to-User Pi payments and rewards
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Send common rewards and payments quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Quick User UID Input */}
              <div className="space-y-2">
                <Label htmlFor="quickUserUid">User UID for Quick Actions</Label>
                <Input
                  id="quickUserUid"
                  value={quickUserUid}
                  onChange={(e) => setQuickUserUid(e.target.value)}
                  placeholder="Enter user UID for quick rewards"
                />
              </div>

              {/* Quick Reward Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickRewards.map((reward, index) => {
                  const IconComponent = reward.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => reward.action(quickUserUid)}
                      disabled={!quickUserUid.trim() || isLoading}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                      <div className="text-center">
                        <div className="font-medium">{reward.name}</div>
                        <div className="text-sm text-gray-500">{reward.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Single Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Single Payment
              </CardTitle>
              <CardDescription>
                Send Pi to a single user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send a custom Pi payment to a specific user with custom amount and memo.
                </p>
                <Button
                  onClick={() => setShowSingleModal(true)}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Single Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Bulk Payment
              </CardTitle>
              <CardDescription>
                Send Pi to multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Send Pi payments to multiple users simultaneously. Perfect for leaderboard rewards or group bonuses.
                </p>
                <Button
                  onClick={() => setShowBulkModal(true)}
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Send Bulk Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              A2U Payment Features
            </CardTitle>
            <CardDescription>
              Comprehensive App-to-User payment system based on Pi Platform documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Send className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Single Payments</h4>
                  <p className="text-sm text-gray-600">Send Pi to individual users</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Bulk Payments</h4>
                  <p className="text-sm text-gray-600">Send Pi to multiple users</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Leaderboard Rewards</h4>
                  <p className="text-sm text-gray-600">Automated ranking rewards</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Daily Bonuses</h4>
                  <p className="text-sm text-gray-600">Streak-based rewards</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Achievement Rewards</h4>
                  <p className="text-sm text-gray-600">Milestone celebrations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-pink-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Tournament Prizes</h4>
                  <p className="text-sm text-gray-600">Competition rewards</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <A2UPaymentModal
        isOpen={showSingleModal}
        onClose={() => setShowSingleModal(false)}
      />
      
      <BulkA2UPaymentModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />
    </div>
  );
};

export default A2UPaymentAdminPage;
