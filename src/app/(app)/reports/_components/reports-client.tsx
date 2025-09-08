
'use client';

import * as React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import { useDebouncedCallback } from 'use-debounce';
import { useLoading } from '@/components/loading-provider';

export default function ReportsClient() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [year, setYear] = React.useState(new Date().getFullYear().toString());
  const [month, setMonth] = React.useState((new Date().getMonth()).toString()); // month is 0-indexed
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState<Record<string, boolean>>({});
  const { setIsLoading } = useLoading();


  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const employeesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(employeesData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch employees from the database.",
      });
    } finally {
        setIsLoading(false);
    }
  }, [toast, setIsLoading]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const getAttendanceMark = (status: 'present' | 'absent' | 'leave' | undefined) => {
    switch(status) {
        case 'present': return 'P';
        case 'absent': return 'A';
        case 'leave': return 'L';
        default: return '-';
    }
  };

  const selectedDate = startOfMonth(new Date(parseInt(year), parseInt(month)));
  const daysInMonth = getDaysInMonth(selectedDate);
  const monthKey = format(selectedDate, 'yyyy-MM');
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const calculateSalaryInfo = React.useCallback((employee: Employee) => {
    const totalPresent = Object.keys(employee.attendance || {}).filter(dateKey => {
        const d = new Date(dateKey);
        return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) && employee.attendance?.[dateKey] === 'present';
    }).length;
    
    const baseCalculatedSalary = (employee.salary / daysInMonth) * totalPresent;

    // Overtime calculation
    const hourlyRate = employee.salary / (22 * 8); // Assuming 22 working days, 8 hours/day
    const overtimeRate = hourlyRate * 1.5;
    const employeeOvertimeHours = employee.overtimeHours?.[monthKey] ?? 0;
    const overtimePay = employeeOvertimeHours * overtimeRate;

    const totalSalary = baseCalculatedSalary + overtimePay;

    return { totalPresent, baseCalculatedSalary, overtimePay, totalSalary, employeeOvertimeHours };
  }, [year, month, daysInMonth, monthKey]);


  const handleOvertimeChange = useDebouncedCallback(async (employeeId: string, value: string) => {
    const hours = parseInt(value, 10);
    if (isNaN(hours) || hours < 0) return;

    setIsSaving(prev => ({...prev, [employeeId]: true}));
    // No global loading for this debounced save
    const employeeRef = doc(db, "employees", employeeId);
    try {
        await updateDoc(employeeRef, {
            [`overtimeHours.${monthKey}`]: hours
        });

        setEmployees(prev =>
            prev.map(emp =>
                emp.id === employeeId
                ? { ...emp, overtimeHours: { ...emp.overtimeHours, [monthKey]: hours } }
                : emp
            )
        );
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to save overtime hours." });
    } finally {
        setIsSaving(prev => ({...prev, [employeeId]: false}));
    }
  }, 500);

  const handleExportAttendanceCsv = () => {
    const headers = ['Employee', 'Total Present', 'Overtime Pay (AED)', 'Total Monthly Salary (AED)', 'Total Salary (AED)'];
    
    const rows = employees.map(employee => {
        const { totalPresent, baseCalculatedSalary, overtimePay, totalSalary } = calculateSalaryInfo(employee);
        return [
            `"${employee.name.replace(/"/g, '""')}"`, 
            totalPresent, 
            overtimePay.toFixed(2), 
            baseCalculatedSalary.toFixed(2), 
            totalSalary.toFixed(2)
        ].join(',');
    });

    downloadCsv([headers.join(','), ...rows].join('\n'), `Attendance_Salary_Report_${months.find(m => m.value === month)?.label}_${year}.csv`);
  };
  
  const handleExportOvertimeCsv = () => {
    const headers = ['Employee', 'Overtime Hours', 'Overtime Pay (AED)'];
    const rows = employees.map(employee => {
        const { overtimePay, employeeOvertimeHours } = calculateSalaryInfo(employee);
        return [`"${employee.name.replace(/"/g, '""')}"`, employeeOvertimeHours, overtimePay.toFixed(2)].join(',');
    });
    downloadCsv([headers.join(','), ...rows].join('\n'), `Overtime_Report_${months.find(m => m.value === month)?.label}_${year}.csv`);
  };

  const downloadCsv = (csvContent: string, filename: string) => {
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
        description: "The report has been downloaded successfully.",
    });
  };

  const totalMonthlyPayroll = React.useMemo(() => {
    return employees.reduce((acc, employee) => acc + calculateSalaryInfo(employee).totalSalary, 0);
  }, [employees, calculateSalaryInfo]);
  
  const months = [
    { value: "0", label: "January" }, { value: "1", label: "February" }, { value: "2", label: "March" },
    { value: "3", label: "April" }, { value: "4", label: "May" }, { value: "5", label: "June" },
    { value: "6", label: "July" }, { value: "7", label: "August" }, { value: "8", label: "September" },
    { value: "9", label: "October" }, { value: "10", label: "November" }, { value: "11", label: "December" }
  ];

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <Tabs defaultValue="attendance" className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList>
                    <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
                    <TabsTrigger value="overtime">Overtime Management</TabsTrigger>
                </TabsList>
                 <div className="flex items-center gap-2 ml-auto">
                    <Select value={month} onValueChange={setMonth}>
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
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-[100px]"
                    />
                </div>
            </div>

            <TabsContent value="attendance">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Monthly Attendance & Salary Report</CardTitle>
                                <CardDescription>View and export monthly attendance and salary records for all employees.</CardDescription>
                            </div>
                            <Button onClick={handleExportAttendanceCsv}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="relative overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 z-10 bg-card whitespace-nowrap">Employee</TableHead>
                            {daysArray.map((day) => (
                            <TableHead key={day} className="text-center">{day}</TableHead>
                            ))}
                            <TableHead className="text-center font-bold whitespace-nowrap">Total Present</TableHead>
                            <TableHead className="text-center font-bold whitespace-nowrap">Overtime Pay (AED)</TableHead>
                            <TableHead className="text-center font-bold whitespace-nowrap">Total Monthly Salary (AED)</TableHead>
                            <TableHead className="text-center font-bold sticky right-0 z-10 bg-card whitespace-nowrap">Total Salary (AED)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {employees.map((employee) => {
                            const { totalPresent, baseCalculatedSalary, overtimePay, totalSalary } = calculateSalaryInfo(employee);
                            return (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium sticky left-0 z-10 bg-card whitespace-nowrap">{employee.name}</TableCell>
                                    {daysArray.map((day) => {
                                        const dateKey = format(new Date(parseInt(year), parseInt(month), day), 'yyyy-MM-dd');
                                        const attendanceStatus = employee.attendance?.[dateKey];
                                        return (
                                            <TableCell key={day} className="text-center">
                                                {getAttendanceMark(attendanceStatus)}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center font-bold">{totalPresent}</TableCell>
                                    <TableCell className="text-center font-bold">
                                        {overtimePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                        {baseCalculatedSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center font-bold sticky right-0 z-10 bg-card">
                                        {totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <div className="text-lg font-semibold">
                        Total Payroll: AED {totalMonthlyPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
            
            <TabsContent value="overtime">
                 <Card>
                    <CardHeader className="pb-3">
                         <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Overtime Management</CardTitle>
                                <CardDescription>Enter and calculate overtime hours and pay for each employee.</CardDescription>
                            </div>
                            <Button onClick={handleExportOvertimeCsv}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Overtime Data
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Monthly Salary (AED)</TableHead>
                                    <TableHead>Overtime Hours (for {months.find(m => m.value === month)?.label} {year})</TableHead>
                                    <TableHead>Overtime Pay (AED)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => {
                                    const { overtimePay, employeeOvertimeHours } = calculateSalaryInfo(employee);
                                    return (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.salary.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-24"
                                                    defaultValue={employeeOvertimeHours}
                                                    onChange={(e) => handleOvertimeChange(employee.id, e.target.value)}
                                                    min="0"
                                                />
                                                 {isSaving[employee.id] && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {overtimePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
