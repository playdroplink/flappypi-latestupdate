import React from 'react';
import { useCloudGameData } from '../hooks/useCloudGameData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Cloud, HardDrive, Shield, RefreshCw } from 'lucide-react';

export const CloudStorageStatus: React.FC = () => {
  const { storageStatus, loadGameData, isLoading } = useCloudGameData();

  if (!storageStatus) {
    return null;
  }

  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? (
      <div className="w-2 h-2 bg-green-500 rounded-full" />
    ) : (
      <div className="w-2 h-2 bg-gray-300 rounded-full" />
    );
  };

  const getStatusText = (isAvailable: boolean) => {
    return isAvailable ? 'Available' : 'Not Available';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Data Sync Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Local Storage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Local Storage</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(storageStatus.local)}
            <Badge variant={storageStatus.local ? "default" : "secondary"}>
              {getStatusText(storageStatus.local)}
            </Badge>
          </div>
        </div>

        {/* Anonymous Cloud */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Cloud Backup</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(storageStatus.cloud)}
            <Badge variant={storageStatus.cloud ? "default" : "secondary"}>
              {getStatusText(storageStatus.cloud)}
            </Badge>
          </div>
        </div>

        {/* Pi Cloud */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Pi Cloud</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(storageStatus.piCloud)}
            <Badge variant={storageStatus.piCloud ? "default" : "secondary"}>
              {getStatusText(storageStatus.piCloud)}
            </Badge>
          </div>
        </div>

        {/* Anonymous ID */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Anonymous ID: {storageStatus.anonymousId.slice(0, 8)}...
          </p>
        </div>

        {/* Sync Button */}
        <Button 
          onClick={loadGameData} 
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Sync Now'}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          Your game data is automatically saved locally and synced to the cloud when available.
          {storageStatus.piCloud && ' Pi cloud sync is active!'}
        </p>
      </CardContent>
    </Card>
  );
};

export default CloudStorageStatus; 