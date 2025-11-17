import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Crown, AlertTriangle, CheckCircle, XCircle, Clock, Shield, Info } from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '@/types/gameTypes';

interface SubscriptionStatusCardProps {
  profile: UserProfile | null;
  onManageSubscription: () => void;
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ profile, onManageSubscription }) => {
  const loading = !profile;
  const hasActiveSubscription = profile?.has_active_subscription;

  const { toast } = useToast();

  const renderStatus = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-2 text-yellow-500">
          <Clock className="w-5 h-5" />
          <span>Loading subscription status...</span>
        </div>
      );
    }

    if (hasActiveSubscription) {
      const expiresAt = profile?.subscription_end ? new Date(profile.subscription_end) : null;
      return (
        <div className="flex items-center space-x-2 text-green-500">
          <CheckCircle className="w-5 h-5" />
          <span>Active Premium Subscription</span>
          {expiresAt && (
            <span className="text-sm text-gray-500 ml-2">
              (Expires: {format(expiresAt, 'PPP')})
            </span>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-red-500">
          <XCircle className="w-5 h-5" />
          <span>No Active Premium Subscription</span>
        </div>
      );
    }
  };

  const getTrialStatus = () => {
    return {
      onTrial: false,
      trialEnds: null,
      daysLeft: 0,
    };
  };

  const { onTrial, trialEnds, daysLeft } = getTrialStatus();

  return (
    <Card className="w-full max-w-lg mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className="w-6 h-6 mr-2" /> Premium Subscription
        </CardTitle>
        <CardDescription className="text-gray-200">
          Manage your ad-free gaming experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Status:</span>
          {renderStatus()}
        </div>
        {onTrial && (
          <div className="flex items-center justify-between text-yellow-300">
            <span className="font-semibold flex items-center"><Info className="w-4 h-4 mr-1" /> Trial Status:</span>
            <span>{daysLeft} days left ({format(trialEnds!, 'PPP')})</span>
          </div>
        )}
        {!hasActiveSubscription && !onTrial && !loading && (
          <div className="flex items-center space-x-2 text-yellow-300">
            <Shield className="w-5 h-5" />
            <span>Upgrade to remove ads and unlock exclusive features!</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={onManageSubscription}
          className="bg-white text-blue-600 hover:bg-gray-100"
          disabled={loading}
        >
          {hasActiveSubscription ? "Manage Subscription" : "Get Premium"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionStatusCard;
