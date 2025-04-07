import React from 'react';
import { useAIDescription } from '../hooks/useAIDescription';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Copy, Check, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIDescription: React.FC = () => {
  const { description, updateDescription, regenerateDescription, isRegenerating, updatePromptSettings } = useAIDescription();
  const [hasCopied, setHasCopied] = React.useState(false);
  const { toast } = useToast();
  const [showPromptSettings, setShowPromptSettings] = React.useState(false);
  const [customPrompt, setCustomPrompt] = React.useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description.content)
      .then(() => {
        setHasCopied(true);
        toast({
          title: "Copied!",
          description: "Description copied to clipboard",
        });
        setTimeout(() => setHasCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        });
        console.error('Failed to copy text: ', err);
      });
  };

  const handlePromptSettingsSave = () => {
    if (customPrompt.trim()) {
      updatePromptSettings(customPrompt);
      toast({
        title: "Prompt Updated",
        description: "AI description prompt has been updated and saved",
      });
    }
    setShowPromptSettings(false);
  };

  return (
    <Card className="bg-white mt-8">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">AI-Generated Description</h2>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowPromptSettings(!showPromptSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <span className="h-2 w-2 rounded-full bg-blue-400 mr-1.5"></span>
            AI Generated
          </Badge>
        </div>
        
        {showPromptSettings && (
          <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Customize AI Prompt</h3>
            <p className="text-xs text-gray-500 mb-3">
              Customize the prompt used to generate descriptions. Use variables: {'{title}'}, {'{author}'}, {'{source}'}, and {'{content}'}.
            </p>
            <Textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Extract important sentences from {content} to create a description for article titled {title} by {author} from {source}. Include relevant hashtags."
              className="w-full mb-3 text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowPromptSettings(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                size="sm"
                onClick={handlePromptSettingsSave}
              >
                Save & Apply
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <Textarea
            id="ai-description-text"
            rows={6}
            value={description.content}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder={description.isLoading ? "Generating description..." : "AI-generated description will appear here"}
            className="w-full p-3"
            disabled={description.isLoading}
          />
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={copyToClipboard}
              disabled={!description.content || description.isLoading}
              className="text-gray-700"
            >
              {hasCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="text-primary-700 bg-primary-100 hover:bg-primary-200"
              onClick={regenerateDescription}
              disabled={isRegenerating || description.isLoading}
            >
              {isRegenerating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDescription;
