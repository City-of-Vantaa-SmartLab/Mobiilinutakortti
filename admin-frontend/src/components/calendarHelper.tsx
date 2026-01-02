import React from 'react';

/**
 * A reusable helper component that renders a clickable link to open the date picker calendar.
 * This is used with DateInput and TextField (type="date") components to provide better UX.
 */
export const CalendarHelper: React.FC = () => {
  return (
    <span
      onClick={(e) => {
        const input = e.currentTarget.closest('.MuiFormControl-root')?.querySelector('input[type="date"]') as HTMLInputElement;
        input?.showPicker?.();
      }}
      style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
    >
      Avaa kalenteri
    </span>
  );
};
