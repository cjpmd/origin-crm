import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries, createEntry, updateEntry, deleteEntry, isCreating, isUpdating, isDeleting } = useJournalEntries(user?.id);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewEntry, setIsNewEntry] = useState(false);

  // Authentication check
  useEffect(() => {
    console.log('[Journal] User authentication status:', user ? 'authenticated' : 'not authenticated');
    console.log('[Journal] User ID:', user?.id);
    if (!user) {
      toast.error("Please log in to access your journal");
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('[Journal] Entries loaded:', entries?.length || 0);
  }, [entries]);

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
        toast.success("Entry saved", {
          description: `Saved at ${format(new Date(), "h:mm a")}`,
        });
        setIsNewEntry(false);
        setTitle("");
        setContent("");
      } else if (selectedEntry) {
        console.log('[Journal] Updating existing entry:', selectedEntry);
        const result = await updateEntry({ id: selectedEntry, title: title || undefined, content });
        console.log('[Journal] Entry updated successfully:', result);
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
              <div className="p-4">
                <Textarea
                  placeholder="Start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px] border-none shadow-none resize-none focus-visible:ring-0"
                />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button 
                onClick={handleSave} 
                disabled={!content.trim() || isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-lg mb-2">Loading...</p>
            </div>
          </div>
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
