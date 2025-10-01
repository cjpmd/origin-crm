import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDealSources } from "@/hooks/useDealSources";
import { useIntermediaries } from "@/hooks/useIntermediaries";
import { useContacts } from "@/hooks/useContacts";
import { Plus, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface DealSourceAttributionProps {
  dealId: string;
}

export function DealSourceAttribution({ dealId }: DealSourceAttributionProps) {
  const { dealSources, isLoading, createDealSource } = useDealSources(dealId);
  const { intermediaries } = useIntermediaries();
  const { contacts } = useContacts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    source_type: "direct",
    intermediary_id: "",
    contact_id: "",
    attribution_notes: "",
    source_quality_score: 50,
    introduction_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sourceData: any = {
      deal_id: dealId,
      source_type: formData.source_type,
      attribution_notes: formData.attribution_notes,
      source_quality_score: formData.source_quality_score,
      introduction_date: formData.introduction_date,
    };

    if (formData.intermediary_id) {
      sourceData.intermediary_id = formData.intermediary_id;
    }
    if (formData.contact_id) {
      sourceData.contact_id = formData.contact_id;
    }

    createDealSource(sourceData);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      source_type: "direct",
      intermediary_id: "",
      contact_id: "",
      attribution_notes: "",
      source_quality_score: 50,
      introduction_date: new Date().toISOString().split('T')[0],
    });
  };

  const getSourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      direct: "bg-blue-500",
      referral: "bg-green-500",
      intermediary: "bg-purple-500",
      inbound: "bg-orange-500",
      event: "bg-pink-500",
      other: "bg-gray-500",
    };
    return colors[type] || colors.other;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deal Source Attribution</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Deal Source</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Source Type *</Label>
                <Select value={formData.source_type} onValueChange={(value) => setFormData({ ...formData, source_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct Outreach</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="intermediary">Intermediary Introduction</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="event">Event/Conference</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.source_type === "intermediary" || formData.source_type === "referral") && (
                <>
                  {formData.source_type === "intermediary" && (
                    <div className="space-y-2">
                      <Label>Intermediary</Label>
                      <Select value={formData.intermediary_id} onValueChange={(value) => setFormData({ ...formData, intermediary_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intermediary" />
                        </SelectTrigger>
                        <SelectContent>
                          {intermediaries.map((int) => (
                            <SelectItem key={int.id} value={int.id}>
                              {int.name} - {int.firm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.source_type === "referral" && (
                    <div className="space-y-2">
                      <Label>Referring Contact</Label>
                      <Select value={formData.contact_id} onValueChange={(value) => setFormData({ ...formData, contact_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label>Introduction Date</Label>
                <input
                  type="date"
                  value={formData.introduction_date}
                  onChange={(e) => setFormData({ ...formData, introduction_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label>Source Quality Score: {formData.source_quality_score}</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.source_quality_score}
                  onChange={(e) => setFormData({ ...formData, source_quality_score: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Attribution Notes</Label>
                <Textarea
                  value={formData.attribution_notes}
                  onChange={(e) => setFormData({ ...formData, attribution_notes: e.target.value })}
                  rows={3}
                  placeholder="How did this deal come to you?"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Source</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading sources...</p>
        ) : dealSources.length === 0 ? (
          <p className="text-muted-foreground">No sources attributed yet. Add one to track deal origination.</p>
        ) : (
          <div className="space-y-3">
            {dealSources.map((source: any) => (
              <div key={source.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSourceTypeColor(source.source_type)}>
                      {source.source_type}
                    </Badge>
                    {source.introduction_date && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(source.introduction_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {source.source_quality_score && (
                    <Badge variant="outline">
                      Quality: {source.source_quality_score}%
                    </Badge>
                  )}
                </div>

                {source.intermediary && (
                  <div className="text-sm mb-1">
                    <span className="font-semibold">Intermediary:</span> {source.intermediary.name} ({source.intermediary.firm})
                  </div>
                )}

                {source.contact && (
                  <div className="text-sm mb-1">
                    <span className="font-semibold">Referred by:</span> {source.contact.name}
                  </div>
                )}

                {source.attribution_notes && (
                  <p className="text-sm text-muted-foreground mt-2">{source.attribution_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
