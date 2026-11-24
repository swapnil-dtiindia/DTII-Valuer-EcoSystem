/** Display metadata for case statuses and workflow actions (labels only — rules live in the API). */
export const CASE_STATUS = {
  CASE_RECEIVED: { label: 'Case received', tone: 'info' },
  INSPECTION_ASSIGNED: { label: 'Inspection assigned', tone: 'info' },
  INSPECTION_IN_PROGRESS: { label: 'Inspection in progress', tone: 'primary' },
  INSPECTION_COMPLETED: { label: 'Inspection completed', tone: 'teal' },
  PRELIMINARY_VALUATION_IN_PROGRESS: { label: 'Preliminary valuation', tone: 'violet' },
  PRELIMINARY_SUBMITTED: { label: 'Preliminary submitted', tone: 'violet' },
  FINAL_REVIEW_IN_PROGRESS: { label: 'Final review', tone: 'violet' },
  SENT_BACK_FOR_CORRECTION: { label: 'Sent back for correction', tone: 'warning' },
  FINAL_APPROVED: { label: 'Final approved – awaiting signature', tone: 'success' },
  PAYMENT_PENDING: { label: 'Report signed – payment pending', tone: 'warning' },
  // Retired steps — kept only to label older history entries.
  CLIENT_APPROVAL_PENDING: { label: 'Client approval pending', tone: 'warning' },
  CLIENT_QUERY_RAISED: { label: 'Client query raised', tone: 'warning' },
  CLIENT_APPROVED: { label: 'Client approved', tone: 'success' },
  CLIENT_SIGNED: { label: 'Client signed', tone: 'success' },
  SUBMITTED_TO_BANK: { label: 'Submitted to bank', tone: 'success' },
  LOAN_SANCTIONED: { label: 'Loan sanctioned', tone: 'success' },
  DISBURSED: { label: 'Disbursed', tone: 'success' },
  CASE_COMPLETED: { label: 'Completed – report signed', tone: 'success' },
  CASE_ON_HOLD: { label: 'On hold', tone: 'warning' },
  CASE_CANCELLED: { label: 'Cancelled', tone: 'danger' },
  CASE_REJECTED: { label: 'Rejected', tone: 'danger' },
};

export const STATUS_GROUPS = [
  ['ACTIVE', 'All active'],
  ['NEW', 'New'],
  ['INSPECTION', 'Inspection'],
  ['PRELIMINARY', 'Preliminary valuation'],
  ['SENIOR_REVIEW', 'Senior review'],
  ['AWAITING_SIGNATURE', 'Awaiting signature'],
  ['AWAITING_PAYMENT', 'Awaiting payment'],
  ['ON_HOLD', 'On hold'],
  ['CLOSED', 'Closed'],
];

export const ACTION_LABEL = {
  START_INSPECTION: 'Start inspection',
  START_PRELIMINARY: 'Start preliminary valuation',
  START_FINAL_REVIEW: 'Start final review',
  REQUEST_REINSPECTION: 'Request re-inspection',
  CLOSE_CASE: 'Close case',
  RECORD_PAYMENT: 'Payment received',
  HOLD: 'Put on hold',
  RESUME: 'Resume',
  CANCEL: 'Cancel case',
};

export const STAGE_LABEL = { MARKETING: 'Marketing', FIELD: 'Field officer', JUNIOR: 'Junior reviewer', SENIOR: 'Senior reviewer' };

export const ACTIVITY_LABEL = {
  CASE_CREATED: 'Case created',
  CASE_ID_GENERATED: 'Case ID generated',
  CASE_DETAILS_UPDATED: 'Case details updated',
  EMPLOYEE_ASSIGNED: 'Employee assigned',
  EMPLOYEE_REASSIGNED: 'Employee reassigned',
  EMPLOYEE_AUTO_ASSIGNED: 'Employee auto-assigned',
  ASSIGN_FIELD_OFFICER: 'Inspection assigned',
};

export const statusLabel = (s) => CASE_STATUS[s]?.label ?? s;
