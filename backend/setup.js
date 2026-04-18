const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'sabaidimai.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const args = process.argv.slice(2);

function getArg(flag) {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    device_info TEXT,
    first_seen TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    last_seen TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    ticket_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT NOT NULL,
    issue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    admin_id INTEGER REFERENCES admin_users(id),
    admin_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    closed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES tickets(id),
    sender TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    admin_id INTEGER REFERENCES admin_users(id),
    content TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id),
    token_jti TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    expires_at TEXT NOT NULL,
    is_revoked INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS mobile_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES mobile_users(id),
    FOREIGN KEY (addressee_id) REFERENCES mobile_users(id)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'direct',
    name TEXT,
    room_key TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversation_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (user_id) REFERENCES mobile_users(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES mobile_users(id)
  );

  CREATE TABLE IF NOT EXISTS emergency_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    chronic_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    blood_type TEXT,
    notes TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES mobile_users(id)
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES mobile_users(id)
  );

  CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES mobile_users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_ticket ON messages(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_jti ON admin_sessions(token_jti);
  CREATE INDEX IF NOT EXISTS idx_friend_requester ON friendships(requester_id);
  CREATE INDEX IF NOT EXISTS idx_friend_addressee ON friendships(addressee_id);
  CREATE INDEX IF NOT EXISTS idx_conv_member_user ON conversation_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_conv_sent ON chat_messages(conversation_id, sent_at);
  CREATE INDEX IF NOT EXISTS idx_checkins_user_created ON checkins(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_support_user_created ON support_messages(user_id, created_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_room_key
    ON conversations(room_key)
    WHERE room_key IS NOT NULL;
`);

const sampleUsers = [
  ['Pound', '0811111111'],
  ['Aom', '0822222222'],
  ['Mild', '0833333333'],
  ['Boss', '0844444444'],
  ['May', '0855555555'],
];

const mobileUsersCount = db.prepare(`SELECT COUNT(*) AS count FROM mobile_users`).get();

if (mobileUsersCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO mobile_users (display_name, phone)
    VALUES (?, ?)
  `);

  for (const [displayName, phone] of sampleUsers) {
    insertUser.run(displayName, phone);
  }
}

function listAdmins() {
  const admins = db.prepare(`
    SELECT id, username, display_name, role, is_active, created_at, last_login
    FROM admin_users
    ORDER BY id
  `).all();

  console.log('\nAdmin accounts:');
  console.log('-'.repeat(72));

  admins.forEach((admin) => {
    const status = admin.is_active ? 'active' : 'disabled';
    const lastLogin = admin.last_login || 'never logged in';
    console.log(
      `[${admin.id}] ${admin.username.padEnd(16)} ${admin.role.padEnd(12)} ${status.padEnd(10)} ${lastLogin}`
    );
  });

  console.log('-'.repeat(72));
}

async function createAdmin(username, password, displayName, role) {
  const passwordHash = bcrypt.hashSync(password, 12);

  db.prepare(`
    INSERT INTO admin_users (username, password_hash, display_name, role)
    VALUES (?, ?, ?, ?)
  `).run(username, passwordHash, displayName || username, role || 'admin');
}

async function main() {
  console.log(`Database schema created or verified: ${DB_PATH}`);

  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM admin_users`).get().count;

  if (existingCount > 0) {
    listAdmins();
  }

  const cliUser = getArg('--username');
  const cliPass = getArg('--password');
  const cliRole = getArg('--role') || 'admin';
  const cliDisplay = getArg('--display') || cliUser;

  if (cliUser && cliPass) {
    await createAdmin(cliUser, cliPass, cliDisplay, cliRole);
    console.log(`Created admin "${cliUser}"`);
    listAdmins();
    db.close();
    return;
  }

  const username = await prompt('Username (admin): ');
  if (!username) {
    console.log('Cancelled');
    db.close();
    return;
  }

  const password = await prompt('Password (min 6 chars): ');
  if (!password || password.length < 6) {
    console.log('Password must be at least 6 characters');
    db.close();
    return;
  }

  const displayName = (await prompt(`Display name (${username}): `)) || username;
  const roleInput = (await prompt('Role [admin/superadmin] (admin): ')) || 'admin';
  const role = ['admin', 'superadmin'].includes(roleInput) ? roleInput : 'admin';

  try {
    await createAdmin(username, password, displayName, role);
    console.log(`Created admin "${username}"`);
    listAdmins();
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      console.log(`Username "${username}" already exists`);
    } else {
      throw error;
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error('Setup failed:', error.message);
  db.close();
  process.exit(1);
});
