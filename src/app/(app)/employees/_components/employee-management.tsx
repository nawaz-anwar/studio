'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
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

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  designation: z.string().min(2, 'Designation is required.'),
  salary: z.coerce.number().positive('Salary must be a positive number.'),
  city: z.string().min(2, 'City is required.'),
  country: z.string().min(2, 'Country is required.'),
});

const initialEmployees: Employee[] = [
    { id: 'EMP001', name: 'John Doe', designation: 'Project Manager', salary: 15000, city: 'Dubai', country: 'UAE' },
    { id: 'EMP002', name: 'Jane Smith', designation: 'Civil Engineer', salary: 12000, city: 'Abu Dhabi', country: 'UAE' },
    { id: 'EMP003', name: 'Sam Wilson', designation: 'Foreman', salary: 8000, city: 'Sharjah', country: 'UAE' },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = React.useState<Employee[]>(initialEmployees);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      designation: '',
      salary: 0,
      city: '',
      country: '',
    },
  });

  function onSubmit(values: z.infer<typeof employeeSchema>) {
    const newEmployee: Employee = {
      id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      ...values,
    };
    setEmployees([...employees, newEmployee]);
    toast({
      title: 'Success!',
      description: 'New employee has been added.',
    });
    form.reset();
    setIsDialogOpen(false);
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
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>
                        Fill in the details below to add a new team member.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="designation"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                <Input placeholder="Project Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Salary (Monthly, AED)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="15000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Dubai" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                    <Input placeholder="UAE" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Add Employee</Button>
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
                  <TableCell>AED {employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{employee.city}, {employee.country}</TableCell>
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
