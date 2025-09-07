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
  CardFooter,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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
import { Download, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const chartData = [
  { month: 'January', revenue: 18600, expenses: 8000 },
  { month: 'February', revenue: 30500, expenses: 12000 },
  { month: 'March', revenue: 23700, expenses: 9500 },
  { month: 'April', revenue: 7300, expenses: 4500 },
  { month: 'May', revenue: 20900, expenses: 11000 },
  { month: 'June', revenue: 21400, expenses: 13000 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const expenseSchema = z.object({
  name: z.string().min(2, 'Expense name is required.'),
  cost: z.coerce.number().positive('Cost must be a positive number.'),
});

const mockExpenses = [
    { id: 1, date: '2024-07-15', name: 'Cement', cost: 1200 },
    { id: 2, date: '2024-07-15', name: 'Car Fuel', cost: 150 },
    { id: 3, date: '2024-07-14', name: 'Bricks', cost: 2500 },
    { id: 4, date: '2024-06-20', name: 'Tiles', cost: 3200 },
    { id: 5, date: '2024-06-18', name: 'Marble', cost: 5000 },
];

export default function DashboardClient() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [expenses, setExpenses] = React.useState(mockExpenses);
  const [filterMonth, setFilterMonth] = React.useState((new Date().getMonth() + 1).toString());
  const { toast } = useToast();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      cost: 0,
    },
  });

  function onExpenseSubmit(values: z.infer<typeof expenseSchema>) {
    const newExpense = {
        id: expenses.length + 1,
        date: new Date().toISOString().split('T')[0],
        ...values
    };
    setExpenses([newExpense, ...expenses]);
    toast({
        title: "Success!",
        description: "New expense has been added."
    });
    form.reset();
  }

  const handleDownloadPdf = () => {
    // This is a placeholder for PDF generation logic
    toast({
        title: "Generating PDF...",
        description: "Your report is being generated and will be downloaded shortly."
    });
    console.log("Downloading PDF with expenses and salaries...");
  }

  const filteredExpenses = expenses.filter(exp => {
    const expenseMonth = new Date(exp.date).getMonth() + 1;
    return expenseMonth.toString() === filterMonth;
  });

  const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
    { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `AED ${Number(value) / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Daily Expense Log</CardTitle>
                <CardDescription>Enter today's company expenses.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onExpenseSubmit)} className="flex items-end gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel>Expense Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Cement, Car Fuel" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cost"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cost (AED)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="250" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
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
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Expense History</CardTitle>
                    <CardDescription>Review monthly expenses.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                     <Select value={filterMonth} onValueChange={setFilterMonth}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
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
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell className="text-right">AED {expense.cost.toLocaleString()}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">No expenses recorded for this month.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </CardContent>
      </Card>
    </div>
  );
}
