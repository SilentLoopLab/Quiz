const path = require("path");
const { readJsonFile, writeJsonFile } = require("../utils/file");
const normalizeEmail = require("../utils/normalizeEmail");
const { normalizeUser } = require("../utils/normalizeUser");

const usersFilePath = path.join(__dirname, "..", "data", "users.json");

function normalizeUsers(users) {
  return users.map((user) => normalizeUser(user));
}

async function readStoredUsers() {
  const users = await readJsonFile(usersFilePath, []);
  return Array.isArray(users) ? users : [];
}

async function readUsers() {
  const users = await readStoredUsers();
  return normalizeUsers(users);
}

async function writeUsers(users) {
  await writeJsonFile(usersFilePath, normalizeUsers(users));
}

async function syncUsersMetadata() {
  const users = await readStoredUsers();
  const normalizedUsers = normalizeUsers(users);

  if (JSON.stringify(users) !== JSON.stringify(normalizedUsers)) {
    await writeJsonFile(usersFilePath, normalizedUsers);
  }

  return normalizedUsers;
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
  const normalizedUser = normalizeUser(user);
  users.push(normalizedUser);
  await writeUsers(users);
  return normalizedUser;
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

  const normalizedUser = normalizeUser(nextUser);
  users[index] = normalizedUser;
  await writeUsers(users);

  return normalizedUser;
}

module.exports = {
  readUsers,
  writeUsers,
  syncUsersMetadata,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
};
