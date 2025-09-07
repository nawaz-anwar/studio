export type Employee = {
  id: string;
  name: string;
  designation: string;
  salary: number;
  city?: string;
  country: string;
  mobile?: string;
  attendance?: Record<string, 'present' | 'absent' | 'leave'>;
  overtimeHours?: Record<string, number>; // month-year (e.g., "2024-07") as key
};

export type Expense = {
    id: string;
    date: string;
    name: string;
    quantity?: number;
    cost: number;
};

export type Task = {
    id: string;
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
}

export type Admin = {
  id: string;
  email: string;
  createdAt: string;
};
