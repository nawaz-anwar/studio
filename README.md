# CreteFlow ERP

CreteFlow is a comprehensive, modern, and secure Enterprise Resource Planning (ERP) system designed for Master Crete Building Contracting LLC. Built with a powerful tech stack, it provides a centralized platform to manage employees, finances, tasks, and administrative access with ease.

## Core Features

### 1. Authentication & Security
- **Secure Login**: A dedicated login page secures the entire application.
- **Firebase Authentication**: Leverages Firebase for robust and secure user authentication.
- **Protected Routes**: All application pages are protected, automatically redirecting unauthenticated users to the login page.
- **Password Management**: Users can securely reset their own passwords after logging in.

### 2. Admin Management
- **Multi-Admin Support**: The system allows for multiple administrator accounts.
- **Centralized Admin Dashboard**: A dedicated "Admins" page allows authorized users to add, view, and delete other administrator accounts.
- **Firestore Integration**: Admin user details are securely stored and managed in a dedicated 'admins' collection in Firestore.

### 3. Dashboard
- **Financial Overview**: An interactive chart visualizes monthly expenses versus salary costs over the last six months.
- **At-a-Glance KPIs**: Key performance indicators are displayed in cards for quick insights, including:
  - Total Salary (calculated based on attendance)
  - Total Monthly Expenses
  - Total Number of Employees
  - Number of Ongoing Tasks
- **Recent Activity**: Quick-look sections for ongoing tasks and recent expenses.

### 4. Employee Management
- **Centralized Employee Records**: A complete table to view and manage all employee details, including name, designation, salary, and location.
- **AI-Powered Data Entry**: Add new employees by simply uploading a document (e.g., ID card, resume). The system uses a Genkit AI flow to automatically extract and populate the employee's information.
- **Manual & Edit Functionality**: Supports both manual entry and editing of employee records through user-friendly dialog forms.
- **Full CRUD Operations**: Create, read, update, and delete employee records.

### 5. Attendance Tracking
- **Daily Attendance**: An intuitive interface to mark daily attendance for all employees.
- **Calendar View**: Easily select any date to view or update attendance records.
- **Bulk Updates**: Select multiple employees at once to mark their attendance as 'present' or 'absent' in bulk, saving time.

### 6. Expense Management
- **Log & Track Expenses**: A simple form to log all company expenses with details like date, name, quantity, and cost.
- **History & Filtering**: Review expense history with powerful filtering options (daily or monthly).
- **CSV Export**: Export filtered expense data to a CSV file for reporting and analysis.
- **Total Cost Calculation**: Automatically calculates and displays the total cost for the filtered period.

### 7. Task Management
- **Kanban-Style Task Board**: A visual task board organizes tasks by status: 'To Do', 'In Progress', and 'Done'.
- **Task Details**: Create tasks with a title, description, priority (Low, Medium, High), status, and due date.
- **Easy Updates**: Change a task's status directly from the board using a simple dropdown.
- **Full Task Control**: Add, edit, and delete tasks through a streamlined dialog interface.

### 8. Reporting
- **Monthly Attendance & Salary Report**: A detailed, horizontally scrollable table showing each employee's daily attendance for the selected month, along with calculated salary information.
- **Overtime Management**: A separate tab to input and track overtime hours for each employee, with automatic overtime pay calculation.
- **Payroll Calculation**: Automatically calculates total salary, including base pay (adjusted for attendance) and overtime pay.
- **Export to CSV**: Download detailed attendance/salary and overtime reports as CSV files for payroll processing.

## Tech Stack

- **Frontend**: Next.js (with App Router), React, TypeScript
- **UI Framework**: ShadCN UI, Tailwind CSS
- **Backend & Database**: Firebase (Authentication, Firestore)
- **Generative AI**: Genkit (for AI-powered employee data extraction)
- **Styling**: Tailwind CSS with a custom, modern theme.
- **Forms**: React Hook Form with Zod for validation.
- **Charts**: Recharts

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Run the Genkit Flow Server** (in a separate terminal):
    ```bash
    npm run genkit:dev
    ```

4.  **Access the Application**:
    Open [http://localhost:9002](http://localhost:9002) in your browser.

5.  **Initial Login**:
    Use the following hardcoded credentials for the first-time login:
    - **Email**: ``
    - **Password**: ``

    After logging in, it is highly recommended to go to the **Admins** page and create a new, permanent administrator account for yourself.
