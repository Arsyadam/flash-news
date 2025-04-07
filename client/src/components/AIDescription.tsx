import React from 'react';
import { useAIDescription } from '../hooks/useAIDescription';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

const AIDescription: React.FC = () => {
  const { description, updateDescription, regenerateDescription, isRegenerating } = useAIDescription();

  return (
    <Card className="bg-white mt-8">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">AI-Generated Description</h2>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <span className="h-2 w-2 rounded-full bg-blue-400 mr-1.5"></span>
            AI Generated
          </Badge>
        </div>
        
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
          
          <div className="flex justify-end">
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
