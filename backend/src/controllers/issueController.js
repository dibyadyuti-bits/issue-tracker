const Issue = require('../models/Issue');
const User = require('../models/User');

// @desc    Get all issues
// @route   GET /api/v1/issues
// @access  Public
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.findAll({
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue
// @route   GET /api/v1/issues/:id
// @access  Public
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create issue
// @route   POST /api/v1/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    const { title, description, priority, status, category, tags, dueDate } = req.body;

    const issue = await Issue.create({
      title,
      description,
      priority,
      status,
      category,
      tags,
      dueDate,
      createdById: req.user.id
    });

    const populatedIssue = await Issue.findByPk(issue.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: populatedIssue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue
// @route   PUT /api/v1/issues/:id
// @access  Private
exports.updateIssue = async (req, res) => {
  try {
    let issue = await Issue.findByPk(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    await issue.update(req.body);

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete issue
// @route   DELETE /api/v1/issues/:id
// @access  Private
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    await issue.destroy();

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to issue
// @route   POST /api/v1/issues/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const issue = await Issue.findByPk(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // For comments, you'll need to create a separate Comment model
    // This is a placeholder - implement based on your needs
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
