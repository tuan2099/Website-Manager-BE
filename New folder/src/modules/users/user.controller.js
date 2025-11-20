const db = require('../../database/models');

async function listUsers(req, res) {
  const users = await db.User.findAll({
    attributes: ['id', 'email', 'name', 'is_active', 'created_at'],
    include: [{ model: db.Role, as: 'roles', attributes: ['id', 'name'] }],
  });
  res.json(users);
}

async function getUser(req, res) {
  const user = await db.User.findByPk(req.params.id, {
    attributes: ['id', 'email', 'name', 'is_active', 'created_at'],
    include: [{ model: db.Role, as: 'roles', attributes: ['id', 'name'] }],
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

async function updateUser(req, res) {
  const user = await db.User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, is_active } = req.body;
  if (name !== undefined) user.name = name;
  if (is_active !== undefined) user.is_active = is_active;
  await user.save();

  res.json({ message: 'Updated', id: user.id });
}

async function assignRoles(req, res) {
  const user = await db.User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { roleIds } = req.body;
  const roles = await db.Role.findAll({ where: { id: roleIds || [] } });
  await user.setRoles(roles);

  res.json({ message: 'Roles updated' });
}

module.exports = {
  listUsers,
  getUser,
  updateUser,
  assignRoles,
};
