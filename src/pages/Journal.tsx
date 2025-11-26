import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useCompanyMentions } from "@/hooks/useCompanyMentions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompanyAvatar } from "@/components/ui/company-avatar";
import { Plus, Trash2, Search, AtSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Journal() {
  const { user } = useAuth();
  const { entries, createEntry, updateEntry, deleteEntry, isCreating, isUpdating, isDeleting } = useJournalEntries(user?.id);
  const { parseMentions, parseUserMentions, getSuggestions, createActivitiesFromMentions, createTasksFromUserMentions, isProcessing } = useCompanyMentions();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredEntries = entries.filter(entry =>
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEntry = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entryId);
      setTitle(entry.title || "");
      setContent(entry.content);
      setIsNewEntry(false);
    }
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setTitle("");
    setContent("");
    setIsNewEntry(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const position = e.target.selectionStart;
    
    setContent(newContent);
    setCursorPosition(position);

    // Check for @ mention
    const textBeforeCursor = newContent.substring(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && lastAtIndex === position - 1) {
      setShowSuggestions(true);
      setMentionQuery("");
    } else if (lastAtIndex !== -1) {
      const queryAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!queryAfterAt.includes(' ') && !queryAfterAt.includes('\n')) {
        setShowSuggestions(true);
        setMentionQuery(queryAfterAt);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (companyName: string) => {
    const textBeforeCursor = content.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = content.substring(cursorPosition);
    
    const newContent = content.substring(0, lastAtIndex) + `@${companyName} ` + textAfterCursor;
    setContent(newContent);
    setShowSuggestions(false);
    setMentionQuery("");
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = lastAtIndex + companyName.length + 2;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const suggestions = showSuggestions ? getSuggestions(mentionQuery) : [];

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to save entries");
      return;
    }

    console.log('[Journal] Saving entry...', { isNewEntry, selectedEntry, contentLength: content.length });

    try {
      if (isNewEntry) {
        console.log('[Journal] Creating new entry');
        const result = await createEntry({ title: title || undefined, content });
        console.log('[Journal] Entry created successfully:', result);
        
        // Parse and create activities for company mentions
        const mentions = parseMentions(content);
        if (mentions.length > 0) {
          await createActivitiesFromMentions(content, mentions, title);
        }

        // Parse and create tasks for user mentions
        const userMentions = parseUserMentions(content);
        if (userMentions.length > 0) {
          await createTasksFromUserMentions(content, userMentions, title);
        }

        if (mentions.length > 0 || userMentions.length > 0) {
          const parts: string[] = [];
          if (mentions.length > 0) {
            parts.push(`${mentions.length} ${mentions.length === 1 ? 'company' : 'companies'}`);
          }
          if (userMentions.length > 0) {
            parts.push(`${userMentions.length} ${userMentions.length === 1 ? 'team member' : 'team members'}`);
          }
          toast.success("Entry saved with mentions", {
            description: `Linked to ${parts.join(' and ')}`,
          });
        } else {
          toast.success("Entry saved", {
            description: `Saved at ${format(new Date(), "h:mm a")}`,
          });
        }
        
        setIsNewEntry(false);
        setTitle("");
        setContent("");
      } else if (selectedEntry) {
        console.log('[Journal] Updating existing entry:', selectedEntry);
        const result = await updateEntry({ id: selectedEntry, title: title || undefined, content });
        console.log('[Journal] Entry updated successfully:', result);
        
        // Parse and create activities for company mentions
        const mentions = parseMentions(content);
        if (mentions.length > 0) {
          await createActivitiesFromMentions(content, mentions, title);
        }

        // Parse and create tasks for user mentions
        const userMentions = parseUserMentions(content);
        if (userMentions.length > 0) {
          await createTasksFromUserMentions(content, userMentions, title);
        }
        
        toast.success("Entry updated", {
          description: `Updated at ${format(new Date(), "h:mm a")}`,
        });
      }
    } catch (error: any) {
      console.error("[Journal] Error saving entry:", error);
      toast.error("Failed to save entry", {
        description: error?.message || "Please try again",
      });
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      if (selectedEntry === entryId) {
        setSelectedEntry(null);
        setTitle("");
        setContent("");
        setIsNewEntry(false);
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Journal</h1>
            <Button onClick={handleNewEntry} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  selectedEntry === entry.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleSelectEntry(entry.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {entry.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(entry.updated_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.id);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {(selectedEntry || isNewEntry) ? (
          <>
            <div className="p-4 border-b">
              <Input
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
              />
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Start writing... Use @ to mention team members or companies"
                  value={content}
                  onChange={handleContentChange}
                  className="min-h-[500px] border-none shadow-none resize-none focus-visible:ring-0"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="absolute z-10 mt-1 p-2 min-w-[250px] max-w-md shadow-lg">
                    <div className="space-y-1">
                      {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-auto py-2"
                        onClick={() => insertMention(suggestion.name)}
                      >
                        {suggestion.entityType === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                            {suggestion.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          <CompanyAvatar 
                            name={suggestion.name} 
                            logoUrl={(suggestion as any).logoUrl}
                            size="sm"
                          />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="text-sm">{suggestion.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.label}
                          </span>
                        </div>
                      </Button>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AtSign className="h-4 w-4" />
                <span>Use @ to mention team members or companies</span>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={!content.trim() || isCreating || isUpdating || isProcessing}
              >
                {isCreating || isUpdating || isProcessing ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">No entry selected</p>
              <p className="text-sm">Create a new entry or select one from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
