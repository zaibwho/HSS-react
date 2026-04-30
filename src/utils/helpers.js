// Utility functions for the application

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    return Object.values(errors).flat().join(', ');
  }
  return error.message || 'An error occurred';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      return '#10b981'; // Green
    case 'pending':
      return '#f59e0b'; // Amber
    case 'in_progress':
    case 'inprogress':
      return '#0ea5e9'; // Cyan
    default:
      return '#6b7280'; // Gray
  }
};

export const getStatusLabel = (status) => {
  switch (status?.toLowerCase()) {
    case 'in_progress':
    case 'inprogress':
      return 'In Progress';
    case 'pending':
      return 'Pending';
    case 'completed':
    case 'done':
      return 'Done';
    default:
      return status || 'Unknown';
  }
};
