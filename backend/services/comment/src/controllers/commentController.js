const Comment = require('../models/Comment');

exports.getCommentsByIssue = async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: { issueId: req.params.issueId },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await Comment.create({
      text,
      issueId: req.params.issueId,
      userId: req.user.id
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    await comment.destroy();
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
