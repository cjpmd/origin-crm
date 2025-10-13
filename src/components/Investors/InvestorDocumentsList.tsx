import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Eye, Download, Trash2, Plus } from "lucide-react";
import { useInvestorDocuments } from "@/hooks/useInvestorDocuments";
import { format } from "date-fns";

interface InvestorDocumentsListProps {
  investorId: string;
}

export function InvestorDocumentsList({ investorId }: InvestorDocumentsListProps) {
  const { documents, createDocument, deleteDocument } = useInvestorDocuments(investorId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({
    document_name: "",
    document_type: "Presentation",
    document_url: "",
  });

  const handleAdd = () => {
    if (!newDoc.document_name) return;
    createDocument({
      investor_id: investorId,
      ...newDoc,
    });
    setIsAddOpen(false);
    setNewDoc({ document_name: "", document_type: "Presentation", document_url: "" });
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'Presentation': return 'bg-blue-100 text-blue-800';
      case 'Due Diligence': return 'bg-purple-100 text-purple-800';
      case 'Legal': return 'bg-red-100 text-red-800';
      case 'Financial': return 'bg-green-100 text-green-800';
      case 'Report': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{documents.length} document(s)</p>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc_name">Document Name *</Label>
                <Input
                  id="doc_name"
                  value={newDoc.document_name}
                  onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
                  placeholder="e.g., Q4 Investor Presentation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc_type">Document Type</Label>
                <Select 
                  value={newDoc.document_type} 
                  onValueChange={(value) => setNewDoc({ ...newDoc, document_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Due Diligence">Due Diligence</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc_url">Document URL</Label>
                <Input
                  id="doc_url"
                  value={newDoc.document_url}
                  onChange={(e) => setNewDoc({ ...newDoc, document_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={!newDoc.document_name}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doc.document_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDocTypeColor(doc.document_type)}>
                      {doc.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.sent_date ? format(new Date(doc.sent_date), 'PP') : 'Not sent'}
                  </TableCell>
                  <TableCell>
                    {doc.viewed ? (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Viewed ({doc.view_count})</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not viewed</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {doc.document_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.document_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">No documents yet</p>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deletingId) deleteDocument(deletingId);
              setDeletingId(null);
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
