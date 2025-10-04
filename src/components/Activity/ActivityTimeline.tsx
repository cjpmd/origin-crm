import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActivities } from "@/hooks/useActivities";
import { Mail, Phone, Calendar, FileText, Linkedin, Brain, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityTimelineProps {
  entityType?: 'company' | 'contact' | 'deal' | 'fund' | 'investor';
  entityId?: string;
}

const activityIcons = {
  email: Mail,
  meeting: Calendar,
  call: Phone,
  note: FileText,
  linkedin: Linkedin,
  research: Brain,
};

const activityColors = {
  email: 'bg-blue-500',
  meeting: 'bg-green-500',
  call: 'bg-purple-500',
  note: 'bg-gray-500',
  linkedin: 'bg-sky-500',
  research: 'bg-pink-500',
};

export function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const { activities, logActivity } = useActivities(entityType, entityId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<{
    activity_type: 'email' | 'meeting' | 'call' | 'note' | 'linkedin' | 'research';
    subject: string;
    body: string;
    duration_minutes?: number;
  }>({
    activity_type: 'note',
    subject: '',
    body: '',
    duration_minutes: undefined,
  });

  const handleSubmit = async () => {
    await logActivity({
      ...formData,
      associations: entityType && entityId ? [{ entity_type: entityType, entity_id: entityId }] : [],
    });
    setShowAddDialog(false);
    setFormData({
      activity_type: 'note',
      subject: '',
      body: '',
      duration_minutes: undefined,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activities logged yet. Start tracking your interactions!
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.activity_type];
                const colorClass = activityColors[activity.activity_type];
                
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${colorClass} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 flex-1 bg-muted mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm">{activity.subject || 'Activity'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.activity_date).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {activity.activity_type === 'note' && activity.subject?.includes('Journal entry') ? 'Journal' : activity.activity_type}
                        </Badge>
                      </div>
                      {activity.body && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{activity.body}</p>
                      )}
                      {activity.duration_minutes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: {activity.duration_minutes} minutes
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Activity Type</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value: any) => setFormData({ ...formData, activity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Activity subject"
              />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Activity details..."
                rows={4}
              />
            </div>
            {(formData.activity_type === 'meeting' || formData.activity_type === 'call') && (
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || undefined })}
                  placeholder="30"
                />
              </div>
            )}
            <Button onClick={handleSubmit} className="w-full">
              Log Activity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}