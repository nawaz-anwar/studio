'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MoreHorizontal, Bot, Loader2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { extractEmployeeInfo } from '@/lib/actions';
import { Textarea } from '@/components/ui/textarea';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  designation: z.string().min(2, 'Designation is required.'),
  salary: z.coerce.number().positive('Salary must be a positive number.'),
  city: z.string().optional(),
  country: z.string().min(2, 'Country is required.'),
  mobile: z.string().optional(),
});

const extractionSchema = z.object({
  photo: z.custom<FileList>().refine(files => files?.length > 0, 'An image is required.'),
  context: z.string().optional(),
});

export default function EmployeeManagement() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
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
  
  const form = useForm<z.infer<typeof extractionSchema>>({
    resolver: zodResolver(extractionSchema),
  });

  const fileRef = form.register("photo");

  async function handleExtraction(values: z.infer<typeof extractionSchema>) {
    setIsExtracting(true);
    try {
      const file = values.photo[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const photoDataUri = reader.result as string;

        const result = await extractEmployeeInfo({
          photoDataUri,
          context: values.context || "",
        });

        if (result.success && result.data) {
          const { name, designation, salary, nationality } = result.data;
          
          const newEmployeeData = {
              name,
              designation,
              salary,
              country: nationality,
              city: "", // City is optional
              mobile: "", // Mobile is optional
          };

          // Validate with Zod before saving
          const validatedData = employeeSchema.parse(newEmployeeData);

          const docRef = await addDoc(collection(db, "employees"), validatedData);
          const newEmployee: Employee = { id: docRef.id, ...validatedData };
          setEmployees(prev => [...prev, newEmployee]);

          toast({
            title: 'Success!',
            description: 'New employee extracted and added.',
          });
          form.reset();
          setIsDialogOpen(false);
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
        setIsExtracting(false);
    }
  }

  const handleAttendanceChange = (employeeId: string, isPresent: boolean) => {
    // This is a simplified representation. A real app would use the current date.
    console.log(`Attendance for ${employeeId} marked as ${isPresent ? 'Present' : 'Absent'}`);
    toast({
      description: `Attendance marked for ${employeeId}.`
    })
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Card>
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage your company's employees.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Employee
                        </span>
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Employee with AI</DialogTitle>
                        <DialogDescription>
                            Upload an image (like an ID or resume) and provide context to automatically extract employee details.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleExtraction)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="photo"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee Document</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" {...fileRef} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="context"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Additional Context (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., 'His salary is 15,000 AED. He is a project manager from Pakistan.'" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" disabled={isExtracting}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isExtracting}>
                                {isExtracting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Extracting...
                                    </>
                                ) : (
                                    <>
                                        <Bot className="mr-2 h-4 w-4" />
                                        Extract & Add Employee
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                        </form>
                    </Form>
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
                <TableHead>Today's Attendance</TableHead>
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
                    <div className="flex items-center space-x-2">
                      <Switch id={`attendance-${employee.id}`} onCheckedChange={(checked) => handleAttendanceChange(employee.id, checked)} />
                      <Label htmlFor={`attendance-${employee.id}`}>Present</Label>
                    </div>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
