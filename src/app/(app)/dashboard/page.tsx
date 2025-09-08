import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, TrendingDown, Briefcase } from "lucide-react";
import DashboardClient from "./_components/dashboard-client";
import { db } from "@/lib/firebase";
import { collection, getDocs } from 'firebase/firestore';
import type { Employee, Expense, Task } from "@/lib/types";
import { format, subMonths, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {

  const now = new Date();
  
  // Fetch all data in parallel
  const [employeesSnapshot, expensesSnapshot, tasksSnapshot] = await Promise.all([
    getDocs(collection(db, "employees")),
    getDocs(collection(db, "expenses")),
    getDocs(collection(db, "tasks"))
  ]);

  // Process Employees
  const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  const totalPotentialSalary = employees.reduce((acc, emp) => acc + emp.salary, 0);
  const totalEmployees = employees.length;

  // Calculate current month's salary based on attendance
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInCurrentMonth = getDaysInMonth(now);

  const totalCalculatedSalary = employees.reduce((total, employee) => {
    const totalPresent = Object.keys(employee.attendance || {}).filter(dateKey => {
      const d = new Date(dateKey);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && employee.attendance?.[dateKey] === 'present';
    }).length;
    const calculatedSalary = (employee.salary / daysInCurrentMonth) * totalPresent;
    return total + calculatedSalary;
  }, 0);


  // Process Expenses
  const allExpenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const currentMonthExpenses = allExpenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= currentMonthStart && expDate <= currentMonthEnd;
  });
  const totalCurrentMonthExpenses = currentMonthExpenses.reduce((acc, exp) => acc + exp.cost, 0);

  // Process Tasks
  const allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  const ongoingTasks = allTasks.filter(task => task.status === 'In Progress');

  // Prepare data for chart
  const monthlyData: { month: string, expenses: number, salary: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const monthKey = format(d, 'yyyy-MM');
    const monthName = format(d, 'MMMM');
    
    const monthExpenses = allExpenses
      .filter(exp => format(new Date(exp.date), 'yyyy-MM') === monthKey)
      .reduce((sum, exp) => sum + exp.cost, 0);
      
    let salaryForMonth = totalPotentialSalary;
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      salaryForMonth = totalCalculatedSalary;
    }

    monthlyData.push({
      month: monthName,
      expenses: monthExpenses,
      salary: salaryForMonth
    });
  }
  
  const recentExpenses = allExpenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);


  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {totalCalculatedSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Based on attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (This Month)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {totalCurrentMonthExpenses.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">{currentMonthExpenses.length} transactions this month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingTasks.length}</div>
            <p className="text-xs text-muted-foreground">{allTasks.length} total tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <DashboardClient chartData={monthlyData} />
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ongoing Tasks</CardTitle>
                    <CardDescription>A quick look at tasks currently in progress.</CardDescription>
                </CardHeader>
                <CardContent>
                   {ongoingTasks.length > 0 ? (
                     <ul className="space-y-2">
                        {ongoingTasks.slice(0, 5).map(task => (
                            <li key={task.id} className="flex items-center justify-between text-sm">
                                <span>{task.title}</span>
                                <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                            </li>
                        ))}
                    </ul>
                   ) : (
                    <p className="text-sm text-muted-foreground">No tasks are currently in progress.</p>
                   )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Top 5 most recent transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentExpenses.length > 0 ? (
                        <ul className="space-y-2">
                            {recentExpenses.map(expense => (
                                <li key={expense.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium">{expense.name}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'PPP')}</p>
                                    </div>
                                    <span className="font-mono">AED {expense.cost.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
