'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoading } from '@/components/loading-provider';


const taskSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  dueDate: z.date({ required_error: 'A due date is required.' }),
});

export default function TasksClient() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  const { setIsLoading } = useLoading();

  const fetchTasks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task)).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch tasks from the database.',
      });
    } finally {
        setIsLoading(false);
    }
  }, [toast, setIsLoading]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'To Do',
      dueDate: new Date(),
    },
  });

  const openFormDialog = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setIsEditing(true);
      form.reset({
        ...task,
        dueDate: new Date(task.dueDate),
      });
    } else {
      setSelectedTask(null);
      setIsEditing(false);
      form.reset({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: new Date(),
      });
    }
    setIsFormDialogOpen(true);
  };
  
  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    setIsLoading(true);
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      toast({ description: 'Task status updated.' });
    } catch (error) {
      console.error('Error updating status: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update task status.' });
    } finally {
        setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof taskSchema>) {
    setIsProcessing(true);
    setIsLoading(true);
    try {
      const taskData = {
        ...values,
        dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      };

      if (isEditing && selectedTask) {
        const docRef = doc(db, 'tasks', selectedTask.id);
        await updateDoc(docRef, taskData);
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...selectedTask, ...taskData } : t).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        toast({ title: 'Success!', description: 'Task has been updated.' });
      } else {
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        setTasks(prev => [...prev, { id: docRef.id, ...taskData }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        toast({ title: 'Success!', description: 'New task has been added.' });
      }

      setIsFormDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving task: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the task.' });
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  }

  async function onDeleteTask(taskId: string) {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: 'Success!', description: 'Task has been deleted.' });
    } catch (error) {
      console.error('Error deleting task: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the task.' });
    } finally {
        setIsLoading(false);
    }
  }

  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'default';
    }
  };

  const tasksByStatus = (status: Task['status']) => tasks.filter(t => t.status === status);

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Task Board</h1>
                <p className="text-muted-foreground">Manage your team's tasks and projects.</p>
            </div>
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => openFormDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Task' : 'Add a New Task'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update the details of your task.' : 'Fill out the form to add a new task to your board.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Finalize project proposal" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Add more details about the task..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="To Do">To Do</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Done">Done</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline" disabled={isProcessing}>Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? 'Save Changes' : 'Add Task')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      
      <Tabs defaultValue="To Do" className="w-full">
        <TabsList className="w-full grid grid-cols-1 sm:w-auto sm:inline-flex sm:grid-cols-3">
          <TabsTrigger value="To Do">To Do ({tasksByStatus('To Do').length})</TabsTrigger>
          <TabsTrigger value="In Progress">In Progress ({tasksByStatus('In Progress').length})</TabsTrigger>
          <TabsTrigger value="Done">Done ({tasksByStatus('Done').length})</TabsTrigger>
        </TabsList>
        
        {['To Do', 'In Progress', 'Done'].map((status) => (
            <TabsContent key={status} value={status}>
            <Card>
                <CardHeader>
                    <CardTitle>{status}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Task</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasksByStatus(status as Task['status']).length > 0 ? (
                             tasksByStatus(status as Task['status']).map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted-foreground break-words">{task.description}</div>
                                    </TableCell>
                                    <TableCell><Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge></TableCell>
                                    <TableCell className="whitespace-nowrap">{format(new Date(task.dueDate), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Select onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])} value={task.status}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Set status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="To Do">To Do</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openFormDialog(task)}>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete this task.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No tasks in this category.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
