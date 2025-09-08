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
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLoading } from '@/components/loading-provider';

export default function AttendanceClient() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedEmployees, setSelectedEmployees] = React.useState<string[]>([]);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { toast } = useToast();
  const { setIsLoading } = useLoading();
  
  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
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
    } finally {
        setIsLoading(false);
    }
  }, [toast, setIsLoading]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAttendanceChange = async (employeeId: string, isPresent: boolean) => {
    setIsLoading(true);
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const employeeRef = doc(db, "employees", employeeId);
    
    try {
      const batch = writeBatch(db);
      batch.update(employeeRef, {
        [`attendance.${dateKey}`]: isPresent ? 'present' : 'absent'
      });
      await batch.commit();
      
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
          ? { ...emp, attendance: { ...emp.attendance, [dateKey]: isPresent ? 'present' : 'absent' } } 
          : emp
        )
      );

    } catch (error) {
      console.error("Error updating attendance: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update attendance.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleBulkUpdate = async (status: 'present' | 'absent') => {
    if (selectedEmployees.length === 0) return;
    
    setIsUpdating(true);
    setIsLoading(true);
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const batch = writeBatch(db);

    selectedEmployees.forEach(employeeId => {
        const employeeRef = doc(db, "employees", employeeId);
        batch.update(employeeRef, { [`attendance.${dateKey}`]: status });
    });

    try {
        await batch.commit();

        setEmployees(prev =>
            prev.map(emp =>
                selectedEmployees.includes(emp.id)
                ? { ...emp, attendance: { ...emp.attendance, [dateKey]: status } }
                : emp
            )
        );

        toast({
            description: `Attendance marked as ${status} for ${selectedEmployees.length} employees.`
        });
        setSelectedEmployees([]);
    } catch (error) {
        console.error("Error bulk updating attendance: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not perform bulk update.",
        });
    } finally {
        setIsUpdating(false);
        setIsLoading(false);
    }
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedEmployees(employees.map(e => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };
  
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Daily Attendance</CardTitle>
                    <CardDescription>Mark employee attendance for the selected date. You can select multiple employees to mark attendance in bulk.</CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
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
                        onSelect={(date) => {
                            setSelectedDate(date || new Date());
                            setSelectedEmployees([]); // Reset selection on date change
                        }}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
            {selectedEmployees.length > 0 && (
                <div className="flex items-center gap-2 pt-4 flex-wrap">
                    <span className="text-sm text-muted-foreground">{selectedEmployees.length} employee(s) selected</span>
                    <Button size="sm" onClick={() => handleBulkUpdate('present')} disabled={isUpdating}>Mark as Present</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleBulkUpdate('absent')} disabled={isUpdating}>Mark as Absent</Button>
                </div>
            )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                   <Checkbox
                        checked={
                            selectedEmployees.length === employees.length
                              ? true
                              : selectedEmployees.length > 0
                              ? 'indeterminate'
                              : false
                          }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                    />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Attendance ({format(selectedDate, "PPP")})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} data-state={selectedEmployees.includes(employee.id) && "selected"}>
                  <TableCell>
                     <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(employee.id, !!checked)}
                        aria-label={`Select ${employee.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{employee.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{employee.designation}</TableCell>
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
