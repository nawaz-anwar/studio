'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateSalarySummary } from '@/lib/actions';

// Mock employee data for the form
const mockEmployees: Employee[] = [
    { id: 'EMP001', name: 'John Doe', designation: 'Project Manager', salary: 15000, city: 'Dubai', country: 'UAE' },
    { id: 'EMP002', name: 'Jane Smith', designation: 'Civil Engineer', salary: 12000, city: 'Abu Dhabi', country: 'UAE' },
    { id: 'EMP003', name: 'Sam Wilson', designation: 'Foreman', salary: 8000, city: 'Sharjah', country: 'UAE' },
];

const payrollSchema = z.object({
  year: z.string().length(4, 'Enter a valid year'),
  month: z.string().min(1, 'Please select a month'),
  employees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    salary: z.number(),
    overtimeHours: z.coerce.number().min(0, 'Cannot be negative').default(0),
    // Simplified attendance: assume 22 working days
    attendance: z.coerce.number().min(0).max(31).default(22),
  }))
});

export default function PayrollClient() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof payrollSchema>>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      month: new Date().toLocaleString('default', { month: 'long' }),
      employees: mockEmployees.map(e => ({
        id: e.id,
        name: e.name,
        salary: e.salary,
        overtimeHours: 0,
        attendance: 22, // Default working days
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "employees"
  });

  async function onSubmit(values: z.infer<typeof payrollSchema>) {
    setIsLoading(true);
    setSummary(null);

    const employeeDataForAI = values.employees.map(e => ({
      ...e,
      calculatedSalary: (e.salary / 22) * e.attendance,
      overtimePay: (e.salary / 22 / 8) * 1.5 * e.overtimeHours,
    }));

    const input = {
      year: values.year,
      month: values.month,
      employeeData: JSON.stringify(employeeDataForAI),
    };

    const result = await generateSalarySummary(input);

    if (result.success && result.data) {
      setSummary(result.data.summary);
      toast({
        title: "Summary Generated",
        description: "AI analysis of the payroll is complete.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error Generating Summary",
        description: result.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  }

  const handleDownloadReport = () => {
    if (!summary) return;
    // In a real app, this would generate a PDF or CSV
    console.log("Downloading report...");
    toast({
      title: "Report Downloaded",
      description: "A PDF of the salary report has been downloaded.",
    });
  }

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payroll</CardTitle>
          <CardDescription>Calculate monthly salaries, including overtime, and generate an AI-powered summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Card>
                <CardHeader>
                    <CardTitle>Employee Data</CardTitle>
                    <CardDescription>Enter attendance and overtime hours for each employee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead className="w-[150px]">Days Worked</TableHead>
                            <TableHead className="w-[150px]">Overtime (hrs)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell>
                                <FormField
                                control={form.control}
                                name={`employees.${index}.attendance`}
                                render={({ field }) => (
                                    <Input type="number" {...field} />
                                )}
                                />
                            </TableCell>
                            <TableCell>
                                <FormField
                                control={form.control}
                                name={`employees.${index}.overtimeHours`}
                                render={({ field }) => (
                                    <Input type="number" {...field} />
                                )}
                                />
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Calculate & Summarize
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {summary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>AI-Generated Summary</CardTitle>
              <CardDescription>Analysis of the payroll data for the selected month.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                {summary.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
