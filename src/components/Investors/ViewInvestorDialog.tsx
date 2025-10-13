import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Mail, Phone, Globe, MapPin, TrendingUp, Calendar, Target, Activity as ActivityIcon } from 'lucide-react';
import { Investor } from '@/hooks/useInvestors';
import { useActivities } from '@/hooks/useActivities';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import { InvestorPreferencesForm } from './InvestorPreferencesForm';
import { InvestorDocumentsList } from './InvestorDocumentsList';

interface ViewInvestorDialogProps {
  investor: Investor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (investor: Investor) => void;
}

export function ViewInvestorDialog({ investor, open, onOpenChange, onContact }: ViewInvestorDialogProps) {
  if (!investor) return null;

  const { activities } = useActivities('investor', investor.id);
  const { formatCurrency } = useCurrency();

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Institutional': return 'bg-green-100 text-green-800';
      case 'Family Office': return 'bg-purple-100 text-purple-800';
      case 'Angel': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case 'Sourced': return 'bg-slate-100 text-slate-700';
      case 'Engaged': return 'bg-blue-100 text-blue-700';
      case 'Qualified': return 'bg-purple-100 text-purple-700';
      case 'Due Diligence': return 'bg-amber-100 text-amber-700';
      case 'Commitment Offered': return 'bg-cyan-100 text-cyan-700';
      case 'Committed': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-emerald-100 text-emerald-700';
      case 'Nurture': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEngagementColor = (level?: string) => {
    switch (level) {
      case 'Hot': return 'bg-red-100 text-red-700';
      case 'Warm': return 'bg-amber-100 text-amber-700';
      case 'Cold': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{investor.name}</DialogTitle>
          <DialogDescription>
            Investor Profile & Pipeline Status
          </DialogDescription>
        </DialogHeader>
        
        {/* Pipeline Status Bar */}
        {investor.pipeline_stage && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={getStageColor(investor.pipeline_stage)}>
                  {investor.pipeline_stage}
                </Badge>
                {investor.engagement_level && (
                  <Badge className={getEngagementColor(investor.engagement_level)}>
                    {investor.engagement_level}
                  </Badge>
                )}
                {investor.priority_score && (
                  <Badge variant="outline">
                    Priority: {'★'.repeat(investor.priority_score)}
                  </Badge>
                )}
              </div>
            </div>
            
            {investor.probability !== null && investor.probability !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Commitment Probability</span>
                  <span className="font-medium">{investor.probability}%</span>
                </div>
                <Progress value={investor.probability} className="h-2" />
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="commitment">Commitment</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                <Badge className={`${getTypeColor(investor.type)} mt-1`}>
                  {investor.type || 'N/A'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant="default" className="mt-1">{investor.status}</Badge>
              </div>
            </div>

            {investor.aum && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Assets Under Management</Label>
                <p className="text-lg font-semibold mt-1">{formatCurrency(investor.aum)}</p>
              </div>
            )}

            {investor.focus_sectors && investor.focus_sectors.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Focus Sectors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {investor.focus_sectors.map((sector, index) => (
                    <Badge key={index} variant="outline">{sector}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {investor.check_size && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Check Size</Label>
                  <p className="text-lg font-semibold mt-1">{investor.check_size}</p>
                </div>
              )}
              {investor.location && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {investor.location}
                  </p>
                </div>
              )}
            </div>

            {investor.fund_vintage && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fund Vintage</Label>
                <p className="text-sm mt-1">{investor.fund_vintage}</p>
              </div>
            )}

            {investor.source && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                <p className="text-sm mt-1">{investor.source}</p>
              </div>
            )}

            {investor.website && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                <a 
                  href={investor.website.startsWith('http') ? investor.website : `https://${investor.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline mt-1"
                >
                  <Globe className="h-4 w-4" />
                  {investor.website}
                </a>
              </div>
            )}

            {investor.notes && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{investor.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="commitment" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {investor.expected_commitment && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <Label className="text-sm font-medium">Expected Commitment</Label>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(investor.expected_commitment)}</p>
                </div>
              )}
              
              {investor.probability !== null && investor.probability !== undefined && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <Label className="text-sm font-medium">Weighted Value</Label>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency((investor.expected_commitment || 0) * (investor.probability / 100))}
                  </p>
                </div>
              )}
            </div>

            {investor.target_close_date && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <Label className="text-sm font-medium">Target Close Date</Label>
                </div>
                <p className="text-lg font-semibold">
                  {format(new Date(investor.target_close_date), 'PPP')}
                </p>
              </div>
            )}

            {investor.last_contact_date && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Contact</Label>
                <p className="text-sm mt-1">{format(new Date(investor.last_contact_date), 'PPP')}</p>
              </div>
            )}

            {investor.relationship_strength !== null && investor.relationship_strength !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Relationship Strength</Label>
                  <span className="text-sm font-medium">{investor.relationship_strength}%</span>
                </div>
                <Progress value={investor.relationship_strength} className="h-2" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <InvestorPreferencesForm investorId={investor.id} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <InvestorDocumentsList investorId={investor.id} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <ActivityIcon className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium text-sm">{activity.subject || activity.activity_type}</p>
                          {activity.body && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.body}</p>
                          )}
                          {activity.duration_minutes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {activity.duration_minutes} minutes
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">{activity.activity_type}</Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.activity_date), 'PPp')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ActivityIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No activities logged yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onContact(investor)}>
            <Mail className="h-4 w-4 mr-2" />
            Contact Investor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
