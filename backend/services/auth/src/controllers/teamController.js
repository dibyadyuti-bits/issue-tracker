const Team = require('../models/Team');
const User = require('../models/User');

exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      include: {
        model: User,
        as: 'members',
        attributes: { exclude: ['password'] }
      }
    });
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    next(error);
  }
};

exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: {
        model: User,
        as: 'members',
        attributes: { exclude: ['password'] }
      }
    });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

exports.createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({ name, description });
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const { name, description } = req.body;
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    await team.save();
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    // Remove team association from users
    await User.update({ teamId: null }, { where: { teamId: team.id } });
    await team.destroy();
    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignUser = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.teamId = team.id;
    await user.save();
    res.status(200).json({ success: true, message: 'User assigned to team', data: user });
  } catch (error) {
    next(error);
  }
};

exports.removeUser = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.teamId !== team.id) {
      return res.status(400).json({ message: 'User is not in this team' });
    }
    user.teamId = null;
    await user.save();
    res.status(200).json({ success: true, message: 'User removed from team', data: user });
  } catch (error) {
    next(error);
  }
};
