exports.validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.validateIssueInput = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!['open', 'in-progress', 'resolved', 'closed'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  if (!['low', 'medium', 'high', 'critical'].includes(data.priority)) {
    errors.priority = 'Invalid priority';
  }

  return Object.keys(errors).length === 0 ? null : errors;
};
