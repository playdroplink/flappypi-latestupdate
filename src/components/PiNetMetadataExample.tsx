import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { piNetMetadataService, type PiNetMetadataDTO, type FlappyPiMetadata } from '@/services/piNetMetadataService';
import { 
  FileText, 
  Share2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Copy,
  Globe,
  Smartphone,
  Settings
} from 'lucide-react';

/**
 * PiNet Metadata Example Component
 * Demonstrates PiNet metadata generation and validation
 */
export const PiNetMetadataExample: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customImage, setCustomImage] = useState<string>('');
  const [generatedMetadata, setGeneratedMetadata] = useState<PiNetMetadataDTO | null>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>('new_high_score');
  const [eventScore, setEventScore] = useState<number>(100);

  // Initialize and get service status
  useEffect(() => {
    const status = piNetMetadataService.getStatus();
    setServiceStatus(status);
  }, []);

  // Generate metadata for selected page
  const handleGenerateMetadata = () => {
    try {
      setIsLoading(true);
      
      const customData: Partial<FlappyPiMetadata> = {};
      if (customTitle) customData.title = customTitle;
      if (customDescription) customData.description = customDescription;
      if (customImage) customData.image = customImage;

      const metadata = piNetMetadataService.generateMetadata(selectedPage, customData);
      setGeneratedMetadata(metadata);
      
      // Validate the generated metadata
      const validation = piNetMetadataService.validateMetadata(metadata);
      setValidationResult(validation);
      
      toast({
        title: "Metadata Generated",
        description: `Generated metadata for page: ${selectedPage}`,
      });
    } catch (error) {
      console.error('Failed to generate metadata:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate game event metadata
  const handleGenerateEventMetadata = () => {
    try {
      setIsLoading(true);
      
      const metadata = piNetMetadataService.generateGameEventMetadata(selectedEvent, eventScore);
      setGeneratedMetadata(metadata);
      
      // Validate the generated metadata
      const validation = piNetMetadataService.validateMetadata(metadata);
      setValidationResult(validation);
      
      toast({
        title: "Event Metadata Generated",
        description: `Generated metadata for event: ${selectedEvent}`,
      });
    } catch (error) {
      console.error('Failed to generate event metadata:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy metadata to clipboard
  const handleCopyMetadata = () => {
    if (!generatedMetadata) return;
    
    try {
      const metadataString = JSON.stringify(generatedMetadata, null, 2);
      navigator.clipboard.writeText(metadataString);
      
      toast({
        title: "Metadata Copied",
        description: "Metadata copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy metadata:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy metadata to clipboard",
        variant: "destructive",
      });
    }
  };

  // Validate custom metadata
  const handleValidateCustomMetadata = () => {
    if (!generatedMetadata) {
      toast({
        title: "No Metadata",
        description: "Please generate metadata first",
        variant: "destructive",
      });
      return;
    }

    const validation = piNetMetadataService.validateMetadata(generatedMetadata);
    setValidationResult(validation);
    
    toast({
      title: validation.isValid ? "Validation Passed" : "Validation Failed",
      description: validation.isValid 
        ? "Metadata is valid" 
        : `Found ${validation.errors.length} errors`,
      variant: validation.isValid ? "default" : "destructive",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PiNet Metadata Example
          </CardTitle>
          <CardDescription>
            Generate and validate PiNet metadata for social media sharing and SEO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Status */}
          {serviceStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Globe className="h-3 w-3" />
                  Base URL: {serviceStatus.baseUrl}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <FileText className="h-3 w-3" />
                  App: {serviceStatus.appName}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Eye className="h-3 w-3" />
                  Default Image: {serviceStatus.defaultImage ? 'Set' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Settings className="h-3 w-3" />
                  Pages: {serviceStatus.supportedPages.length}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Metadata Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Page Metadata Generation</CardTitle>
          <CardDescription>Generate metadata for specific pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Select Page</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/">Home Page</SelectItem>
                  <SelectItem value="/game">Game Page</SelectItem>
                  <SelectItem value="/shop">Shop Page</SelectItem>
                  <SelectItem value="/leaderboard">Leaderboard Page</SelectItem>
                  <SelectItem value="/about">About Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customTitle">Custom Title (Optional)</Label>
              <Input
                id="customTitle"
                placeholder="Enter custom title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customDescription">Custom Description (Optional)</Label>
              <Input
                id="customDescription"
                placeholder="Enter custom description..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customImage">Custom Image URL (Optional)</Label>
              <Input
                id="customImage"
                placeholder="Enter custom image URL..."
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateMetadata} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate Page Metadata
          </Button>
        </CardContent>
      </Card>

      {/* Game Event Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Game Event Metadata</CardTitle>
          <CardDescription>Generate metadata for specific game events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_high_score">New High Score</SelectItem>
                  <SelectItem value="game_over">Game Over</SelectItem>
                  <SelectItem value="achievement">Achievement Unlocked</SelectItem>
                  <SelectItem value="level_complete">Level Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventScore">Score (Optional)</Label>
              <Input
                id="eventScore"
                type="number"
                placeholder="Enter score..."
                value={eventScore}
                onChange={(e) => setEventScore(Number(e.target.value))}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateEventMetadata} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            Generate Event Metadata
          </Button>
        </CardContent>
      </Card>

      {/* Generated Metadata Display */}
      {generatedMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Metadata
              <div className="flex gap-2">
                <Button 
                  onClick={handleValidateCustomMetadata} 
                  size="sm"
                  variant="outline"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Validate
                </Button>
                <Button 
                  onClick={handleCopyMetadata} 
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(generatedMetadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.isValid ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Metadata is valid and ready for use with PiNet!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Found {validationResult.errors.length} validation errors:
                  </AlertDescription>
                </Alert>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PiNet Metadata Information */}
      <Card>
        <CardHeader>
          <CardTitle>PiNet Metadata Information</CardTitle>
          <CardDescription>How PiNet metadata works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Frontend Metadata Support</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Default for all PiNet apps</li>
              <li>• PiNet scrapes meta tags from your HTML</li>
              <li>• Use tools like <a href="https://metatags.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">metatags.io</a> for validation</li>
              <li>• Perfect for static sites and SSR apps</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Backend Metadata Support</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Custom solution for Single Page Applications</li>
              <li>• PiNet sends GET requests to <code>/pinet/meta?pathname=&lt;encoded-pathname&gt;</code></li>
              <li>• Your backend responds with <code>PiNetMetadataDTO</code></li>
              <li>• Enables dynamic metadata generation</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Supported Metadata Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Basic Meta Tags:</strong> title, description, keywords, authors</li>
              <li>• <strong>OpenGraph:</strong> Facebook sharing with rich previews</li>
              <li>• <strong>Twitter Cards:</strong> Twitter sharing with custom cards</li>
              <li>• <strong>Icons:</strong> App icons for different platforms</li>
              <li>• <strong>Format Detection:</strong> Mobile browser behavior</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Benefits</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Social Media Sharing:</strong> Rich previews on Facebook, Twitter, etc.</li>
              <li>• <strong>SEO Optimization:</strong> Better search engine visibility</li>
              <li>• <strong>App Recognition:</strong> Professional appearance when shared</li>
              <li>• <strong>User Growth:</strong> Increased engagement through better sharing</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Setup Instructions</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to Pi Developer Portal and select your app</li>
              <li>Navigate to "PiNet Settings"</li>
              <li>Choose "backend" for Metadata Support Type</li>
              <li>Provide your backend URL</li>
              <li>Implement <code>/pinet/meta</code> endpoint</li>
              <li>Use the validation tool at <a href="https://pinet.com/developer/metadata" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">pinet.com/developer/metadata</a></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiNetMetadataExample;
