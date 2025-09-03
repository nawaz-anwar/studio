export type Employee = {
  id: string;
  name: string;
  designation: string;
  salary: number;
  city: string;
  country: string;
  attendance?: Record<string, 'present' | 'absent' | 'leave'>;
  overtimeHours?: Record<string, number>; // month-year as key
};
