export const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#FF9800',
    critical: '#F44336'
  };
  return colors[priority] || '#999';
};

export const getStatusColor = (status) => {
  const colors = {
    open: '#2196F3',
    'in-progress': '#FF9800',
    resolved: '#4CAF50',
    closed: '#9E9E9E'
  };
  return colors[status] || '#999';
};
