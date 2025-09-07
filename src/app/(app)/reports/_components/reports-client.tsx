'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';

export default function ReportsClient() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [year, setYear] = React.useState(new Date().getFullYear().toString());
  const [month, setMonth] = React.useState((new Date().getMonth()).toString()); // month is 0-indexed
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

  const handleExportPdf = () => {
    toast({
      title: "Generating PDF...",
      description: "Your attendance report is being generated and will download shortly.",
    });
    // In a real app, you would use a library like jsPDF and jsPDF-AutoTable here.
    console.log("Exporting PDF for", { month, year });
  };
  
  const selectedDate = startOfMonth(new Date(parseInt(year), parseInt(month)));
  const daysInMonth = getDaysInMonth(selectedDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const months = [
    { value: "0", label: "January" }, { value: "1", label: "February" }, { value: "2", label: "March" },
    { value: "3", label: "April" }, { value: "4", label: "May" }, { value: "5", label: "June" },
    { value: "6", label: "July" }, { value: "7", label: "August" }, { value: "8", label: "September" },
    { value: "9", label: "October" }, { value: "10", label: "November" }, { value: "11", label: "December" }
  ];

  const getAttendanceMark = (status: 'present' | 'absent' | 'leave' | undefined) => {
    switch(status) {
        case 'present': return 'P';
        case 'absent': return 'A';
        case 'leave': return 'L';
        default: return '-';
    }
  };


  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Monthly Attendance Report</CardTitle>
                    <CardDescription>View and export monthly attendance records for all employees.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                    <Button onClick={handleExportPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-card">Employee</TableHead>
                    {daysArray.map((day) => (
                    <TableHead key={day} className="text-center">{day}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {employees.map((employee) => (
                    <TableRow key={employee.id}>
                    <TableCell className="font-medium sticky left-0 z-10 bg-card">{employee.name}</TableCell>
                    {daysArray.map((day) => {
                        const dateKey = format(new Date(parseInt(year), parseInt(month), day), 'yyyy-MM-dd');
                        const attendanceStatus = employee.attendance?.[dateKey];
                        return (
                            <TableCell key={day} className="text-center">
                                {getAttendanceMark(attendanceStatus)}
                            </TableCell>
                        );
                    })}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
