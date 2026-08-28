export type Employee = {
  id: number;
  name: string;
  initials: string;
  role: string;
  department: string;
  status: 'Active' | 'On leave';
  payType: 'Salary' | 'Hourly';
  pay: string;
};

export type TimeOffRequest = {
  id: number;
  employee: string;
  initials: string;
  type: string;
  dates: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Declined';
};

export const company = {
  name: 'Northstar Goods Co.',
  legalName: 'Northstar Goods Company LLC',
  employeeCount: 48,
  payrollFrequency: 'Biweekly',
  nextPayDate: 'Sep 4, 2026',
  period: 'Aug 17 – Aug 30',
};

export const employees: Employee[] = [
  { id: 1, name: 'Maya Chen', initials: 'MC', role: 'Operations Manager', department: 'Operations', status: 'Active', payType: 'Salary', pay: '$82,000' },
  { id: 2, name: 'Jordan Brooks', initials: 'JB', role: 'Senior Designer', department: 'Creative', status: 'Active', payType: 'Salary', pay: '$76,500' },
  { id: 3, name: 'Priya Shah', initials: 'PS', role: 'Retail Lead', department: 'Retail', status: 'Active', payType: 'Hourly', pay: '$28.50/hr' },
  { id: 4, name: 'Luis Rivera', initials: 'LR', role: 'Warehouse Coordinator', department: 'Fulfillment', status: 'Active', payType: 'Hourly', pay: '$25.00/hr' },
  { id: 5, name: 'Avery Morgan', initials: 'AM', role: 'People Partner', department: 'People', status: 'On leave', payType: 'Salary', pay: '$70,000' },
  { id: 6, name: 'Noah Kim', initials: 'NK', role: 'Account Executive', department: 'Sales', status: 'Active', payType: 'Salary', pay: '$68,000' },
];

export const timeOffRequests: TimeOffRequest[] = [
  { id: 1, employee: 'Jordan Brooks', initials: 'JB', type: 'Vacation', dates: 'Sep 8 – Sep 11', days: 4, status: 'Pending' },
  { id: 2, employee: 'Priya Shah', initials: 'PS', type: 'Personal', dates: 'Sep 3', days: 1, status: 'Pending' },
  { id: 3, employee: 'Luis Rivera', initials: 'LR', type: 'Vacation', dates: 'Sep 18 – Sep 19', days: 2, status: 'Approved' },
];

export const payrollRows = [
  { label: 'Gross payroll', value: '$92,480.00' },
  { label: 'Employer taxes', value: '$8,236.72' },
  { label: 'Benefits & deductions', value: '$11,904.18' },
  { label: 'Net pay', value: '$72,339.10' },
];

export const payrollHistory = [
  { date: 'Aug 21', period: 'Aug 3 – Aug 16', employees: 47, total: '$88,412.52', status: 'Paid' },
  { date: 'Aug 7', period: 'Jul 20 – Aug 2', employees: 47, total: '$87,905.14', status: 'Paid' },
  { date: 'Jul 24', period: 'Jul 6 – Jul 19', employees: 46, total: '$86,773.91', status: 'Paid' },
];

export const schedule = [
  { day: 'Mon 31', shifts: 9, hours: 68, coverage: 'Good' },
  { day: 'Tue 1', shifts: 11, hours: 82, coverage: 'Good' },
  { day: 'Wed 2', shifts: 10, hours: 76, coverage: 'Good' },
  { day: 'Thu 3', shifts: 12, hours: 91, coverage: 'Tight' },
  { day: 'Fri 4', shifts: 13, hours: 96, coverage: 'Tight' },
  { day: 'Sat 5', shifts: 8, hours: 61, coverage: 'Good' },
  { day: 'Sun 6', shifts: 5, hours: 34, coverage: 'Good' },
];

export const timecards = [
  { employee: 'Priya Shah', hours: '78.5', overtime: '2.5', status: 'Ready' },
  { employee: 'Luis Rivera', hours: '80.0', overtime: '4.0', status: 'Ready' },
  { employee: 'Camille Foster', hours: '74.0', overtime: '0.0', status: 'Needs review' },
  { employee: 'Drew Walker', hours: '79.25', overtime: '1.25', status: 'Ready' },
];

export const taxItems = [
  { name: 'Federal payroll tax deposit', due: 'Sep 2, 2026', amount: '$6,214.30', status: 'Upcoming' },
  { name: 'Texas unemployment tax', due: 'Oct 31, 2026', amount: '$1,084.22', status: 'Scheduled' },
  { name: 'Form 941 — Q3', due: 'Oct 31, 2026', amount: 'Quarterly filing', status: 'In progress' },
];

export const initialDocuments = [
  { name: 'Employee Handbook 2026.pdf', type: 'Policy', updated: 'Aug 12, 2026', size: '2.4 MB' },
  { name: 'Q2 Payroll Register.csv', type: 'Payroll', updated: 'Jul 10, 2026', size: '186 KB' },
  { name: 'Workers Compensation Policy.pdf', type: 'Compliance', updated: 'Jun 28, 2026', size: '1.1 MB' },
  { name: 'New Hire Packet.docx', type: 'HR', updated: 'Jun 4, 2026', size: '740 KB' },
];

export const reportCards = [
  { label: 'Payroll cost', value: '$184.7k', change: '+3.8%', tone: 'yellow' },
  { label: 'Labor as % revenue', value: '31.4%', change: '-1.2%', tone: 'green' },
  { label: 'Overtime cost', value: '$6.9k', change: '+8.1%', tone: 'red' },
  { label: 'Headcount', value: '48', change: '+2', tone: 'green' },
];

export const monthlyLabor = [58, 63, 61, 70, 68, 76, 72, 84, 80, 88, 91, 86];
