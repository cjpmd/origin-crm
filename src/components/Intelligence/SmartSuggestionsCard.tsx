import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, X, ArrowRight, AlertCircle, Users, TrendingUp } from "lucide-react";
import { useSmartSuggestions } from "@/hooks/useSmartSuggestions";
import { useNavigate } from "react-router-dom";

const suggestionIcons = {
  next_step: ArrowRight,
  neglected_relationship: AlertCircle,
  warm_path: Users,
  deal_opportunity: TrendingUp,
};

const suggestionColors = {
  next_step: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  neglected_relationship: 'bg-red-500/10 text-red-700 dark:text-red-400',
  warm_path: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  deal_opportunity: 'bg-green-500/10 text-green-700 dark:text-green-400',
};

export function SmartSuggestionsCard() {
  const { suggestions, isLoading, dismissSuggestion } = useSmartSuggestions();
  const navigate = useNavigate();

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.entity_type === 'deal') {
      navigate('/pipeline');
    } else if (suggestion.entity_type === 'contact') {
      navigate('/contacts');
    } else if (suggestion.entity_type === 'company') {
      navigate('/portfolio');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You're all caught up! No urgent actions needed right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Suggestions
          <Badge variant="secondary">{suggestions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 5).map((suggestion) => {
          const Icon = suggestionIcons[suggestion.type];
          const colorClass = suggestionColors[suggestion.type];
          
          return (
            <div
              key={suggestion.id}
              className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissSuggestion(suggestion.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {suggestion.priority && (
                    <div className="mt-2">
                      <Badge 
                        variant={suggestion.priority > 70 ? "destructive" : suggestion.priority > 40 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {suggestion.priority > 70 ? 'High' : suggestion.priority > 40 ? 'Medium' : 'Low'} Priority
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}