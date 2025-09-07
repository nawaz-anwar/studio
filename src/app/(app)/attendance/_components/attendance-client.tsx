'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
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
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AttendanceClient() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
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

  const handleAttendanceChange = async (employeeId: string, isPresent: boolean) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const employeeRef = doc(db, "employees", employeeId);
    
    try {
      await updateDoc(employeeRef, {
        [`attendance.${dateKey}`]: isPresent ? 'present' : 'absent'
      });
      
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
          ? { ...emp, attendance: { ...emp.attendance, [dateKey]: isPresent ? 'present' : 'absent' } } 
          : emp
        )
      );

      toast({
        description: `Attendance for ${format(selectedDate, "PPP")} marked successfully.`
      });
    } catch (error) {
      console.error("Error updating attendance: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update attendance.",
      });
    }
  };
  
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Daily Attendance</CardTitle>
                    <CardDescription>Mark employee attendance for the selected date.</CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => setSelectedDate(date || new Date())}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Attendance ({format(selectedDate, "PPP")})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id={`attendance-${employee.id}`} 
                            checked={employee.attendance?.[dateKey] === 'present'}
                            onCheckedChange={(checked) => handleAttendanceChange(employee.id, checked)} 
                        />
                      <Label htmlFor={`attendance-${employee.id}`}>{employee.attendance?.[dateKey] === 'present' ? 'Present' : 'Absent'}</Label>
                    </div>
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
