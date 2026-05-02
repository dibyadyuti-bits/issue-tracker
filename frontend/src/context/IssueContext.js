import React, { createContext, useState, useContext } from 'react';

const IssueContext = createContext();

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    category: ''
  });

  const addIssue = (issue) => {
    setIssues([issue, ...issues]);
  };

  const updateIssue = (id, updatedIssue) => {
    setIssues(issues.map(issue => issue.id === id ? updatedIssue : issue));
  };

  const removeIssue = (id) => {
    setIssues(issues.filter(issue => issue.id !== id));
  };

  const value = {
    issues,
    setIssues,
    selectedIssue,
    setSelectedIssue,
    filter,
    setFilter,
    addIssue,
    updateIssue,
    removeIssue
  };

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  );
};
