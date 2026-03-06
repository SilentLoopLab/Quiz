const path = require("path");
const { readJsonFile, writeJsonFile } = require("../utils/file");
const normalizeEmail = require("../utils/normalizeEmail");

const usersFilePath = path.join(__dirname, "..", "data", "users.json");

async function readUsers() {
  const users = await readJsonFile(usersFilePath, []);
  return Array.isArray(users) ? users : [];
}

async function writeUsers(users) {
  await writeJsonFile(usersFilePath, users);
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const users = await readUsers();
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

async function createUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

async function updateUserById(userId, updater) {
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return null;
  }

  const currentUser = users[index];
  const nextUser = typeof updater === "function" ? updater(currentUser) : { ...currentUser, ...updater };

  if (!nextUser) {
    return null;
  }

  users[index] = nextUser;
  await writeUsers(users);

  return nextUser;
}

module.exports = {
  readUsers,
  writeUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
};
