
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Download, MoreHorizontal, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  } from '@/components/ui/dropdown-menu';
import type { Expense } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const expenseSchema = z.object({
  name: z.string().min(2, 'Expense name is required.'),
  quantity: z.coerce.number().positive('Quantity must be a positive number.').optional().or(z.literal('')),
  cost: z.coerce.number().positive('Cost must be a positive number.'),
  date: z.date({ required_error: "A date is required."}),
});

export default function ExpensesClient() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [filterType, setFilterType] = React.useState<'monthly' | 'daily'>('monthly');
  const [filterMonth, setFilterMonth] = React.useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = React.useState(new Date().getFullYear().toString());
  const [filterDate, setFilterDate] = React.useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);

  const { toast } = useToast();
  
  const fetchExpenses = React.useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      const expensesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch expenses from the database.",
      });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      quantity: '',
      cost: 0,
      date: new Date(),
    },
  });

  const editForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
  });

  React.useEffect(() => {
    if (selectedExpense) {
        editForm.reset({
            ...selectedExpense,
            date: new Date(selectedExpense.date)
        });
    }
  }, [selectedExpense, editForm]);


  async function onExpenseSubmit(values: z.infer<typeof expenseSchema>) {
    setIsProcessing(true);
    try {
        const newExpenseData: Omit<Expense, 'id'> = {
            name: values.name,
            cost: values.cost,
            date: format(values.date, 'yyyy-MM-dd'),
        };

        if (values.quantity) {
            newExpenseData.quantity = values.quantity;
        }

        const docRef = await addDoc(collection(db, "expenses"), newExpenseData);
        
        setExpenses(prev => [{ id: docRef.id, ...newExpenseData }, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        toast({
            title: "Success!",
            description: "New expense has been added."
        });
        form.reset();
    } catch (error) {
        console.error("Error adding expense: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add expense to the database.",
        });
    } finally {
        setIsProcessing(false);
    }
  }

  async function onEditSubmit(values: z.infer<typeof expenseSchema>) {
    if (!selectedExpense) return;
    setIsProcessing(true);
    try {
        const updatedData: Omit<Expense, 'id'> = {
            name: values.name,
            cost: values.cost,
            date: format(values.date, 'yyyy-MM-dd'),
        };

        if (values.quantity) {
            updatedData.quantity = values.quantity;
        }

        const docRef = doc(db, "expenses", selectedExpense.id);
        await updateDoc(docRef, updatedData);

        setExpenses(prev => prev.map(exp => exp.id === selectedExpense.id ? { id: selectedExpense.id, ...updatedData } : exp).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast({
            title: 'Success!',
            description: 'Expense has been updated.',
        });
        setIsEditDialogOpen(false);
        setSelectedExpense(null);
    } catch (error) {
        console.error("Error updating expense: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update the expense.",
        });
    } finally {
        setIsProcessing(false);
    }
  }

  async function onDeleteExpense(expenseId: string) {
    try {
        await deleteDoc(doc(db, "expenses", expenseId));
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
        toast({
            title: 'Success!',
            description: 'Expense has been deleted.',
        });
    } catch (error) {
        console.error("Error deleting expense: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the expense.",
        });
    }
  }
  
  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleExportCsv = (dataToExport: Expense[], filename: string) => {
    if (dataToExport.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There is no data to export for the selected period.",
      });
      return;
    }

    const headers = ['Date', 'Expense Name', 'Quantity', 'Cost (AED)'];
    const rows = dataToExport.map(expense => 
        [
            expense.date,
            `"${expense.name.replace(/"/g, '""')}"`,
            expense.quantity ?? 'N/A',
            expense.cost
        ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

     toast({
        title: "CSV Exported",
        description: "The expense report has been downloaded successfully.",
      });
  };

  const filteredExpenses = React.useMemo(() => {
    if (filterType === 'daily') {
        const formattedDate = format(filterDate, 'yyyy-MM-dd');
        return expenses.filter(exp => exp.date === formattedDate);
    } else { // monthly
        return expenses.filter(exp => {
            const expenseDate = new Date(exp.date);
            return expenseDate.getFullYear().toString() === filterYear && (expenseDate.getMonth() + 1).toString() === filterMonth;
        });
    }
  }, [expenses, filterType, filterDate, filterMonth, filterYear]);

  const onExportClick = () => {
    let filename = "expenses.csv";
    if (filterType === 'daily') {
        filename = `expenses_${format(filterDate, 'yyyy-MM-dd')}.csv`;
    } else {
        const monthName = months.find(m => m.value === filterMonth)?.label;
        filename = `expenses_${monthName}_${filterYear}.csv`;
    }
    handleExportCsv(filteredExpenses, filename);
  };


  const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
    { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }
  ];

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Expense Log</CardTitle>
                <CardDescription>Enter company expenses.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onExpenseSubmit)} className="grid grid-cols-1 md:grid-cols-5 items-end gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel>Expense Name</FormLabel><FormControl><Input placeholder="e.g., Cement, Car Fuel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="cost" render={({ field }) => ( <FormItem><FormLabel>Cost (AED)</FormLabel><FormControl><Input type="number" placeholder="250" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" size="icon" className="h-10 w-10">
                            <PlusCircle className="h-5 w-5" />
                            <span className="sr-only">Add Expense</span>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Expense History</CardTitle>
                    <CardDescription>Review and export daily or monthly expenses.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                     <RadioGroup defaultValue="monthly" value={filterType} onValueChange={(value) => setFilterType(value as any)} className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monthly" id="r-monthly" />
                            <Label htmlFor="r-monthly">Monthly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="daily" id="r-daily" />
                            <Label htmlFor="r-daily">Daily</Label>
                        </div>
                    </RadioGroup>

                    {filterType === 'monthly' ? (
                        <div className="flex items-center gap-2">
                            <Select value={filterMonth} onValueChange={setFilterMonth}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder="Year"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-[100px]"
                            />
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !filterDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={filterDate}
                                    onSelect={(date) => setFilterDate(date || new Date())}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}

                    <Button onClick={onExportClick} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Expense Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>{expense.quantity ?? 'N/A'}</TableCell>
                        <TableCell>AED {expense.cost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => openEditDialog(expense)}>Edit</DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this expense.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteExpense(expense.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No expenses recorded for this period.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the details for this expense.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField control={editForm.control} name="name" render={({ field }) => ( <FormItem className="flex-grow"><FormLabel>Expense Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={editForm.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={editForm.control} name="cost" render={({ field }) => ( <FormItem><FormLabel>Cost (AED)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isProcessing}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    