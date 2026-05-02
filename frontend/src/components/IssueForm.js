import React from 'react';
import { useForm } from '../hooks/useForm';

const IssueForm = ({ onSubmit, initialValues = {} }) => {
  const defaultValues = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    category: 'general',
    dueDate: '',
    ...initialValues
  };

  const form = useForm(defaultValues, onSubmit);

  return (
    <form onSubmit={form.handleSubmit} className="issue-form">
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={form.values.title}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={form.values.description}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          rows={5}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={form.values.priority}
            onChange={form.handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.values.status}
            onChange={form.handleChange}
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={form.values.category}
          onChange={form.handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={form.values.dueDate}
          onChange={form.handleChange}
        />
      </div>

      <button type="submit" className="btn-primary">Submit</button>
    </form>
  );
};

export default IssueForm;
