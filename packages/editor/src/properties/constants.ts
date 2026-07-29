/** Date formats offered in the properties panel, with a worked example each. */
export const DATE_FORMAT_OPTIONS = [
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy - 31/12/2024' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy - 12/31/2024' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd - 2024-12-31' },
  { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd - 2024/12/31' },
  { value: 'dd MMM yyyy', label: 'dd MMM yyyy - 31 Dec 2024' },
  { value: 'MMM dd, yyyy', label: 'MMM dd, yyyy - Dec 31, 2024' },
  { value: 'dd MMMM yyyy', label: 'dd MMMM yyyy - 31 December 2024' },
  { value: 'MMMM dd, yyyy', label: 'MMMM dd, yyyy - December 31, 2024' },
  { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy - 31-12-2024' },
  { value: 'MM-dd-yyyy', label: 'MM-dd-yyyy - 12-31-2024' }
] as const;

/** Weekdays, numbered as `Date.prototype.getDay` returns them. */
export const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
] as const;
