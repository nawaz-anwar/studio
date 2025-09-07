'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MoreHorizontal, Bot, Loader2, UserPlus } from 'lucide-react';
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
  DialogClose
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
  DropdownMenuSeparator,
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
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, writeBatch, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { extractEmployeeInfo } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';
import { employeeSchema, extractionSchema } from '@/lib/schema/employee';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export default function EmployeeManagement() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  
  const fetchEmployees = React.useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const employeesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch employees from the database.",
      });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  const extractionForm = useForm<z.infer<typeof extractionSchema>>({
    resolver: zodResolver(extractionSchema),
  });

  const manualForm = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
        name: "",
        designation: "",
        salary: 0,
        country: "",
        city: "",
        mobile: "",
    }
  });
  
  const editForm = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
  });

  React.useEffect(() => {
    if (selectedEmployee) {
      editForm.reset(selectedEmployee);
    }
  }, [selectedEmployee, editForm]);


  const fileRef = extractionForm.register("photo");

  async function handleExtraction(values: z.infer<typeof extractionSchema>) {
    setIsProcessing(true);
    try {
      const file = values.photo[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const photoDataUri = reader.result as string;

        const result = await extractEmployeeInfo({
          photoDataUri,
          context: values.context || "",
        });
        
        if (result.success && result.data?.employees) {
            const batch = writeBatch(db);
            const newEmployees: Employee[] = [];
            const employeesCollection = collection(db, "employees");

            for (const extracted of result.data.employees) {
                const newEmployeeData = {
                    name: extracted.name,
                    designation: extracted.designation,
                    salary: extracted.salary,
                    country: extracted.nationality,
                    city: "",
                    mobile: "",
                };

                const validatedData = employeeSchema.parse(newEmployeeData);
                const docRef = doc(employeesCollection); // Create a new doc reference
                batch.set(docRef, validatedData);
                newEmployees.push({ id: docRef.id, ...validatedData });
            }

            await batch.commit();

            setEmployees(prev => [...prev, ...newEmployees]);
            toast({
                title: 'Success!',
                description: `${newEmployees.length} employee(s) extracted and added.`,
            });
            extractionForm.reset();
            setIsAddDialogOpen(false);
        } else {
            throw new Error(result.error || "Failed to extract employee information.");
        }
      };

      reader.readAsDataURL(file);

    } catch (error: any) {
      console.error("Error during extraction or saving: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
        setIsProcessing(false);
    }
  }

  async function handleManualSubmit(values: z.infer<typeof employeeSchema>) {
    setIsProcessing(true);
    try {
        const validatedData = employeeSchema.parse(values);
        const docRef = await addDoc(collection(db, "employees"), validatedData);
        const newEmployee: Employee = { id: docRef.id, ...validatedData };
        setEmployees(prev => [...prev, newEmployee]);

        toast({
            title: 'Success!',
            description: 'New employee has been added.',
        });
        manualForm.reset();
        setIsAddDialogOpen(false);
    } catch (error: any) {
        console.error("Error saving employee: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save the employee to the database.",
        });
    } finally {
        setIsProcessing(false);
    }
  }

  async function handleEditSubmit(values: z.infer<typeof employeeSchema>) {
    if (!selectedEmployee) return;
    setIsProcessing(true);
    try {
        const validatedData = employeeSchema.parse(values);
        const docRef = doc(db, "employees", selectedEmployee.id);
        await updateDoc(docRef, validatedData);

        setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? { ...emp, ...validatedData } : emp));
        toast({
            title: 'Success!',
            description: 'Employee details have been updated.',
        });
        setIsEditDialogOpen(false);
        setSelectedEmployee(null);
    } catch (error) {
        console.error("Error updating employee: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update the employee in the database.",
        });
    } finally {
        setIsProcessing(false);
    }
  }
  
  async function handleDeleteEmployee(employeeId: string) {
    try {
        await deleteDoc(doc(db, "employees", employeeId));
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        toast({
            title: 'Success!',
            description: 'Employee has been deleted.',
        });
    } catch (error) {
        console.error("Error deleting employee: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the employee from the database.",
        });
    }
  }
  
  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Card>
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle>Employee Records</CardTitle>
                    <CardDescription>Manage your company's employee data.</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Employee
                        </span>
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Add Employee</DialogTitle>
                        <DialogDescription>
                            Add a new employee using AI extraction or manual entry.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="ai" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ai">
                                <Bot className="mr-2 h-4 w-4" />
                                Add with AI
                            </TabsTrigger>
                            <TabsTrigger value="manual">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Manual Entry
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="ai" className="pt-4">
                                <Form {...extractionForm}>
                                <form onSubmit={extractionForm.handleSubmit(handleExtraction)} className="space-y-4">
                                <FormField
                                    control={extractionForm.control}
                                    name="photo"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee Document(s)</FormLabel>
                                        <FormControl>
                                            <Input type="file" accept="image/*" {...fileRef} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={extractionForm.control}
                                    name="context"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Context (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., 'Salaries are 15000, 12000, and 8000 AED respectively.'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                    <Button variant="outline" disabled={isProcessing}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Extracting...
                                            </>
                                        ) : (
                                            <>
                                                <Bot className="mr-2 h-4 w-4" />
                                                Extract & Add
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                                </form>
                            </Form>
                        </TabsContent>
                        <TabsContent value="manual" className="pt-4">
                                <Form {...manualForm}>
                                <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={manualForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={manualForm.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="Project Manager" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={manualForm.control} name="salary" render={({ field }) => (<FormItem><FormLabel>Salary (AED)</FormLabel><FormControl><Input type="number" placeholder="15000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={manualForm.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="UAE" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={manualForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>City (Optional)</FormLabel><FormControl><Input placeholder="Dubai" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={manualForm.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>Mobile (Optional)</FormLabel><FormControl><Input placeholder="+971..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" disabled={isProcessing}>Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                        Add Employee
                                    </Button>
                                </DialogFooter>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Salary (AED)</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.mobile || 'N/A'}</TableCell>
                  <TableCell>AED {employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{employee.city ? `${employee.city}, ` : ''}{employee.country}</TableCell>
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
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the employee
                                and remove their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the details for {selectedEmployee?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={editForm.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Designation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={editForm.control} name="salary" render={({ field }) => (<FormItem><FormLabel>Salary (AED)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={editForm.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={editForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>City (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={editForm.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>Mobile (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isProcessing}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
