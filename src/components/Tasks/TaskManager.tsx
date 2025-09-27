import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckSquare, Clock, AlertCircle, Plus, Calendar, User } from 'lucide-react';
import { mockTasks, Task } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500', icon: AlertCircle },
  done: { label: 'Done', color: 'bg-green-500', icon: CheckSquare }
};

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedStatus, setSelectedStatus] = useState<'all' | Task['status']>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignee: ''
  });
  const { toast } = useToast();

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === selectedStatus);

  const taskCounts = {
    open: tasks.filter(t => t.status === 'open').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length
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
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description || null,
      status: 'open',
      due_date: formData.dueDate,
      assigned_to: formData.assignee || '1',
      created_at: new Date().toISOString(),
      related_deal: null
    };

    setTasks(prev => [...prev, newTask]);
    setFormData({ title: '', description: '', dueDate: '', assignee: '' });
    setIsDialogOpen(false);
    toast({ title: "Task created", description: `${newTask.title} has been added successfully` });
  };

  const handleEditTask = (taskId: string) => {
    toast({ title: "Edit task", description: "Task editing functionality will be implemented" });
  };

  const handleMarkDone = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'done' as const } : task
    ));
    toast({ title: "Task completed", description: "Task has been marked as done" });
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input 
                    id="due-date" 
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select value={formData.assignee} onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Sarah Chen</SelectItem>
                      <SelectItem value="2">Michael Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setFormData({ title: '', description: '', dueDate: '', assignee: '' });
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
            onClick={() => setSelectedStatus(status as Task['status'])}
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
          
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                        {config.label}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground ml-7">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 ml-7 text-xs text-muted-foreground">
                      {task.due_date && (
                        <div className={`flex items-center gap-1 ${
                          isOverdue(task.due_date) ? 'text-red-600' : ''
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date) && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {task.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned to Team Member
                        </div>
                      )}
                      
                      {task.related_deal && (
                        <Badge variant="outline" className="text-xs">
                          Deal Related
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTask(task.id)}
                    >
                      Edit
                    </Button>
                    {task.status !== 'done' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkDone(task.id)}
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No tasks found</CardTitle>
            <CardDescription className="text-center">
              {selectedStatus === 'all' 
                ? 'Create your first task to get started'
                : `No tasks with status "${statusConfig[selectedStatus as Task['status']]?.label}"`
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}