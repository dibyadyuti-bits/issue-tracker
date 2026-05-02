const Issue = require('../models/Issue');
const { fetchUser } = require('../utils/helpers');

exports.getAllIssues = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const issues = await Issue.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    const token = req.headers.authorization?.split(' ')[1];
    const populatedIssues = await Promise.all(
      issues.map(async (issue) => {
        const plain = issue.toJSON();
        const createdBy = await fetchUser(plain.createdById, token);
        const assignedTo = plain.assignedToId ? await fetchUser(plain.assignedToId, token) : null;
        return { ...plain, createdBy, assignedTo };
      })
    );

    res.status(200).json({ success: true, count: populatedIssues.length, data: populatedIssues });
  } catch (error) {
    next(error);
  }
};

exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const plain = issue.toJSON();
    const createdBy = await fetchUser(plain.createdById, token);
    const assignedTo = plain.assignedToId ? await fetchUser(plain.assignedToId, token) : null;

    res.status(200).json({ success: true, data: { ...plain, createdBy, assignedTo } });
  } catch (error) {
    next(error);
  }
};

exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, priority, status, category, tags, dueDate, assignedToId } = req.body;

    const issue = await Issue.create({
      title,
      description,
      priority,
      status,
      category,
      tags,
      dueDate,
      assignedToId,
      createdById: req.user.id
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

exports.updateIssue = async (req, res, next) => {
  try {
    let issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    await issue.update(req.body);
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    await issue.destroy();
    res.status(200).json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    next(error);
  }
};
