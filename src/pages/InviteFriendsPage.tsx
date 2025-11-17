import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Link, Coins, ArrowLeft, Share2, DollarSign } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const InviteFriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { coins: flappyCoins, setCoins: setFlappyCoins } = useGameState(); // Use coins from gameState
  const [referralLink, setReferralLink] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<any[]>([]);
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const appBaseUrl = window.location.origin; // Dynamically get base URL

  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchReferralData = useCallback(async () => {
    if (!profile?.pi_user_id) return;

    // Fetch referral link
    if (profile.referral_code) {
      setReferralLink(`${appBaseUrl}/register?referral_code=${profile.referral_code}`);
    } else {
      setReferralLink(''); // Clear if no code
    }

    // TODO: Fetch invited friends from backend here
    // setInvitedFriends(await fetchInvitedFriends(profile.pi_user_id));
  }, [profile, appBaseUrl, toast]);

  useEffect(() => {
    fetchReferralData();
  }, [profile, fetchReferralData]);

  const generateReferralLink = useCallback(async () => {
    if (!profile?.pi_user_id) return;
    setIsGeneratingLink(true);
    try {
      const generatedCode = `REF-${profile.pi_user_id.substring(0, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6)}`;
      await updateProfile({ referral_code: generatedCode });
      setReferralLink(`${appBaseUrl}/register?referral_code=${generatedCode}`);
      toast({
        title: "Referral Link Generated!",
        description: "Your unique invite link is ready.",
      });
    } catch (error: any) {
      console.error("Error generating referral link:", error);
      toast({
        title: "Error Generating Link",
        description: error.message || "Failed to generate referral link.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingLink(false);
    }
  }, [profile, appBaseUrl, updateProfile, toast]);

  const copyReferralLink = useCallback(() => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      });
    }
  }, [referralLink, toast]);

  const shareReferralLink = useCallback(async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'Flappy Pi - Invite Friends!',
          text: 'Join Flappy Pi and earn Flappy Coins! Use my referral link:',
          url: referralLink,
        });
        console.log('Referral link shared successfully.');
      } catch (error) {
        console.error('Error sharing referral link:', error);
        toast({
          title: "Share Failed",
          description: "Could not share link. Please try copying instead.",
          variant: "destructive"
        });
      }
    } else {
      copyReferralLink(); // Fallback to copy if share API not available
      toast({
        title: "Share Not Supported",
        description: "Your browser does not support the Web Share API. Link copied to clipboard.",
      });
    }
  }, [referralLink, copyReferralLink, toast]);

  const cashOutReferralCoins = useCallback(async () => {
    if (!profile?.pi_user_id || isCashingOut) return;

    setIsCashingOut(true);
    try {
      // Simulate backend cash out
      const amountToCashOut = profile.referral_coins || 0;
      if (amountToCashOut === 0) {
        toast({
          title: "No Referral Coins",
          description: "You don't have any referral coins to cash out.",
          variant: "default"
        });
        setIsCashingOut(false);
        return;
      }

      // In a real scenario, you'd call a backend function like:
      // const result = await gameBackendService.cashOutReferralCoins(profile.pi_user_id);

      // For now, simulate success and update profile locally
      await updateProfile({
        referral_coins: 0, // Reset referral coins after cashing out
        total_coins: (profile.total_coins || 0) + amountToCashOut // Add to total coins
      });
      setFlappyCoins(flappyCoins + amountToCashOut); // Update game state

      toast({
        title: "Coins Cashed Out!",
        description: `You successfully cashed out ${amountToCashOut} Flappy Coins!`,
        variant: "default"
      });

    } catch (error: any) {
      console.error("Error cashing out coins:", error);
      toast({
        title: "Cash Out Failed",
        description: error.message || "Failed to cash out referral coins.",
        variant: "destructive"
      });
    } finally {
      setIsCashingOut(false);
    }
  }, [profile, isCashingOut, refreshProfile, toast, flappyCoins, updateProfile]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200">
      <BackgroundDecoration />
      <ScrollArea className="flex-1 w-full flex flex-col items-center p-4">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-5xl flex flex-col items-center relative mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
          <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Invite Friends & Earn!</h1>
          <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Invite your friends to Flappy Pi and earn rewards when they join.</p>

          {/* Referral Link Section */}
          <Card className="mb-6 p-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-blue-300 w-full transition-all duration-200 hover:shadow-2xl">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-blue-800">Your Invite Link</CardTitle>
              <Users className="h-7 w-7 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-4">
              {profile?.referral_code ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-grow p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono"
                  />
                  <Button onClick={copyReferralLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200">
                    <Link className="h-5 w-5 mr-2" /> Copy
                  </Button>
                  <Button onClick={shareReferralLink} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={generateReferralLink}
                  disabled={isGeneratingLink}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition-all duration-200"
                >
                  {isGeneratingLink ? 'Generating...' : 'Generate My Invite Link'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invited Friends Section */}
          <Card className="mb-6 p-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl border-2 border-green-300 w-full">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-green-800">Invited Friends ({invitedFriends.length})</CardTitle>
              <Users className="h-7 w-7 text-green-600" />
            </CardHeader>
            <CardContent className="pt-4">
              {invitedFriends.length > 0 ? (
                <ul className="space-y-3">
                  {invitedFriends.map((friend) => (
                    <li key={friend.pi_user_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                      <span className="font-semibold text-gray-800">{friend.username}</span>
                      <span className="text-sm text-gray-500">Joined: {new Date(friend.created_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">No friends invited yet. Share your link!</p>
              )}
            </CardContent>
          </Card>

          {/* Referral Rewards Section */}
          <Card className="mb-6 p-6 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl border-2 border-blue-300 w-full">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-blue-800">Referral Rewards</CardTitle>
              <Coins className="h-7 w-7 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md shadow-sm">
                <span className="font-semibold text-blue-800">Available for Cash Out:</span>
                <span className="flex items-center gap-1 text-xl font-bold text-blue-900">
                  {profile?.referral_coins || 0} <img src="/flappycoins.png" alt="Flappy Coin" className="h-5 w-5" />
                </span>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Earn {profile?.referral_bonus_per_friend || 0} Flappy Coins for each friend who joins and plays using your link!
              </p>
              <Button
                onClick={cashOutReferralCoins}
                disabled={isCashingOut || (profile?.referral_coins || 0) === 0}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 rounded-md shadow-sm"
              >
                {isCashingOut ? 'Cashing Out...' : 'Cash Out Coins'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default InviteFriendsPage; 