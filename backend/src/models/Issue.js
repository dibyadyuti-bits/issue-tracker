const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  assignedToId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  underscored: true
});

// Define associations
Issue.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
Issue.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

module.exports = Issue;
