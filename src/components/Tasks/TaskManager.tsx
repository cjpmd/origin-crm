import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckSquare, Clock, AlertCircle, Plus, Calendar, User, TrendingUp, Briefcase, Building2 } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolioCompanies } from '@/hooks/usePortfolioCompanies';
import { EditTaskDialog } from './EditTaskDialog';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  pending: { label: 'Open', color: 'bg-blue-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500', icon: AlertCircle },
  completed: { label: 'Done', color: 'bg-green-500', icon: CheckSquare }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500' },
  medium: { label: 'Medium', color: 'bg-orange-500' },
  high: { label: 'High', color: 'bg-red-500' }
};

export function TaskManager() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const { companies } = usePortfolioCompanies();
  const navigate = useNavigate();
  
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    due_date: '',
    company_id: ''
  });

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === selectedStatus);

  const taskCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) return;
    
    createTask({
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date || null,
      company_id: formData.company_id || null,
    });
    
    setFormData({ 
      title: '', 
      description: '', 
      priority: 'medium',
      status: 'pending',
      due_date: '', 
      company_id: '' 
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTask = (updates: Partial<Task> & { id: string }) => {
    updateTask(updates);
    setEditingTask(null);
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    updateTask({ id: taskId, status: newStatus });
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage tasks and reminders across deals and contacts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task and assign it to team members
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Task title" 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Task description" 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input 
                    id="due-date" 
                    type="date" 
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Related Company</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setFormData({ title: '', description: '', priority: 'medium', status: 'pending', due_date: '', company_id: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('all')}
        >
          All ({tasks.length})
        </Button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(status as any)}
            className="gap-2"
          >
            <config.icon className="h-3 w-3" />
            {config.label} ({taskCounts[status as keyof typeof taskCounts]})
          </Button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const config = statusConfig[task.status];
          const StatusIcon = config.icon;
          const priorityInfo = priorityConfig[task.priority];
          const relatedCompany = task.company_id ? companies.find(c => c.id === task.company_id) : null;
          
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <div className={`w-2 h-2 rounded-full ${priorityInfo.color}`} />
                        {priorityInfo.label}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground ml-7">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 ml-7 text-xs text-muted-foreground flex-wrap">
                      {task.due_date && (
                        <div className={`flex items-center gap-1 ${
                          isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-600' : ''
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date) && task.status !== 'completed' && (
                            <Badge variant="destructive" className="text-xs ml-1">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned to me
                        </div>
                      )}
                      
                      {relatedCompany && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs hover:underline"
                          onClick={() => navigate('/portfolio')}
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          {relatedCompany.name}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={task.status} 
                      onValueChange={(value: any) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingTask(task)}
                    >
                      Edit
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onUpdate={handleUpdateTask}
          companies={companies}
          deals={[]}
        />
      )}

      {filteredTasks.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No tasks found</CardTitle>
            <CardDescription className="text-center">
              {selectedStatus === 'all' 
                ? 'Create your first task to get started'
                : `No tasks with status "${statusConfig[selectedStatus]?.label}"`
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Loading tasks...
          </CardContent>
        </Card>
      )}
    </div>
  );
}