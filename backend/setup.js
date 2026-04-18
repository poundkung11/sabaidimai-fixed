/**
 * setup.js — รันครั้งเดียวตอนติดตั้งครั้งแรก
 * สร้าง database + admin account เริ่มต้น
 *
 * วิธีใช้:
 *   node setup.js
 *   node setup.js --username myname --password mypass --role superadmin
 */

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const readline = require('readline');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'sabaidimai.db');

// ── Parse CLI args ─────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

// ── Init DB ────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- ── Admin users ──
  CREATE TABLE IF NOT EXISTS admin_users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'admin',   -- admin | superadmin
    is_active    INTEGER NOT NULL DEFAULT 1,       -- 1=active, 0=disabled
    created_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    last_login   TEXT
  );

  -- ── App users (ผู้ใช้แอพ) ──
  CREATE TABLE IF NOT EXISTS app_users (
    id           TEXT PRIMARY KEY,    -- UUID จากแอพ (deviceId หรือ userId)
    username     TEXT NOT NULL,       -- ชื่อที่ผู้ใช้ตั้ง
    device_info  TEXT,               -- JSON: platform, version ฯลฯ
    first_seen   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    last_seen    TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    ticket_count INTEGER NOT NULL DEFAULT 0
  );

  -- ── Tickets ──
  CREATE TABLE IF NOT EXISTS tickets (
    id           TEXT PRIMARY KEY,
    user_id      TEXT,               -- FK → app_users.id (อาจ null ถ้า guest)
    username     TEXT NOT NULL,
    issue        TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'waiting',  -- waiting | active | closed
    admin_id     INTEGER REFERENCES admin_users(id),
    admin_name   TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    closed_at    TEXT
  );

  -- ── Messages ──
  CREATE TABLE IF NOT EXISTS messages (
    id           TEXT PRIMARY KEY,
    ticket_id    TEXT NOT NULL REFERENCES tickets(id),
    sender       TEXT NOT NULL,       -- 'user' | 'admin'
    sender_name  TEXT NOT NULL,
    admin_id     INTEGER REFERENCES admin_users(id),
    content      TEXT NOT NULL,
    sent_at      TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  -- ── Sessions (JWT blacklist / active sessions) ──
  CREATE TABLE IF NOT EXISTS admin_sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id     INTEGER NOT NULL REFERENCES admin_users(id),
    token_jti    TEXT UNIQUE NOT NULL,   -- JWT ID for revocation
    created_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    expires_at   TEXT NOT NULL,
    is_revoked   INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_messages_ticket ON messages(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_status  ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_user    ON tickets(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_jti    ON admin_sessions(token_jti);
`);

console.log('✅ Database schema created/verified:', DB_PATH);
console.log('');

// ── Check existing admins ──────────────────────────────
const existingCount = db.prepare('SELECT COUNT(*) as n FROM admin_users').get().n;

async function promptInput(question, isPassword = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (isPassword) {
      process.stdout.write(question);
      const stdin = process.openStdin();
      let data = '';
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', (char) => {
        char = char.toString('utf8');
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          console.log('');
          resolve(data);
        } else if (char === '\u0003') {
          process.exit();
        } else if (char === '\u007f') {
          data = data.slice(0, -1);
        } else {
          data += char;
          process.stdout.write('*');
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}
function ensureMobileUserExists(userId) {
  const user = db.prepare(`
    SELECT id, display_name, phone, created_at
    FROM mobile_users
    WHERE id = ?
  `).get(userId);

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
}

function findFriendshipBetween(userA, userB) {
  return db.prepare(`
    SELECT *
    FROM friendships
    WHERE (
      (requester_id = ? AND addressee_id = ?)
      OR
      (requester_id = ? AND addressee_id = ?)
    )
    LIMIT 1
  `).get(userA, userB, userB, userA);
}

function isFriend(userA, userB) {
  const row = db.prepare(`
    SELECT id
    FROM friendships
    WHERE (
      (requester_id = ? AND addressee_id = ?)
      OR
      (requester_id = ? AND addressee_id = ?)
    )
    AND status = 'accepted'
    LIMIT 1
  `).get(userA, userB, userB, userA);

  return !!row;
}

function isConversationMember(conversationId, userId) {
  const row = db.prepare(`
    SELECT id
    FROM conversation_members
    WHERE conversation_id = ? AND user_id = ?
    LIMIT 1
  `).get(conversationId, userId);

  return !!row;
}

function getOrCreateDirectConversation(userA, userB) {
  const existing = db.prepare(`
    SELECT c.id, c.type, c.name, c.created_at
    FROM conversations c
    JOIN conversation_members cm1
      ON cm1.conversation_id = c.id AND cm1.user_id = ?
    JOIN conversation_members cm2
      ON cm2.conversation_id = c.id AND cm2.user_id = ?
    WHERE c.type = 'direct'
    LIMIT 1
  `).get(userA, userB);

  if (existing) {
    return existing;
  }

  const insertConversation = db.prepare(`
    INSERT INTO conversations (type, name)
    VALUES ('direct', NULL)
  `).run();

  const conversationId = insertConversation.lastInsertRowid;

  const insertMember = db.prepare(`
    INSERT INTO conversation_members (conversation_id, user_id)
    VALUES (?, ?)
  `);

  insertMember.run(conversationId, userA);
  insertMember.run(conversationId, userB);

  return db.prepare(`
    SELECT id, type, name, created_at
    FROM conversations
    WHERE id = ?
  `).get(conversationId);
}
async function createAdmin(username, password, displayName, role) {
  const hash = bcrypt.hashSync(password, 12);
  try {
    db.prepare(`
      INSERT INTO admin_users (username, password_hash, display_name, role)
      VALUES (?, ?, ?, ?)
    `).run(username, hash, displayName || username, role || 'admin');
    console.log(`✅ สร้าง admin "${username}" (${role || 'admin'}) เรียบร้อย`);
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      console.log(`⚠️  Username "${username}" มีอยู่แล้ว — ข้าม`);
    } else {
      throw e;
    }
  }
}

async function main() {
  // If CLI args provided, use them directly
  const cliUser = getArg('--username');
  const cliPass = getArg('--password');
  const cliRole = getArg('--role') || 'admin';
  const cliDisplay = getArg('--display') || cliUser;

  if (cliUser && cliPass) {
    await createAdmin(cliUser, cliPass, cliDisplay, cliRole);
    listAdmins();
    db.close();
    return;
  }

  // Interactive mode
  console.log('═══════════════════════════════════════');
  console.log('  Sabaai-Dii-Mai — Admin Setup');
  console.log('═══════════════════════════════════════');

  if (existingCount > 0) {
    console.log(`\nมี admin อยู่แล้ว ${existingCount} บัญชี:`);
    listAdmins();
    console.log('');
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (q) => new Promise(r => rl.question(q, a => r(a.trim())));

  const username = await ask('Username (admin): ');
  if (!username) { console.log('ยกเลิก'); rl.close(); db.close(); return; }

  const password = await ask('Password: ');
  if (!password || password.length < 6) {
    console.log('❌ Password ต้องมีอย่างน้อย 6 ตัวอักษร');
    rl.close(); db.close(); return;
  }

  const displayName = await ask(`Display name (${username}): `) || username;
  const roleInput   = await ask('Role [admin/superadmin] (admin): ') || 'admin';
  const role = ['admin','superadmin'].includes(roleInput) ? roleInput : 'admin';

  rl.close();

  await createAdmin(username, password, displayName, role);
  console.log('');
  listAdmins();
  db.close();
}

function listAdmins() {
  const admins = db.prepare('SELECT id, username, display_name, role, is_active, created_at, last_login FROM admin_users ORDER BY id').all();
  console.log('\n📋 Admin accounts ทั้งหมด:');
  console.log('─'.repeat(70));
  admins.forEach(a => {
    const status = a.is_active ? '🟢' : '🔴';
    const lastLogin = a.last_login ? `login: ${a.last_login}` : 'ยังไม่เคย login';
    console.log(`  ${status} [${a.id}] ${a.username.padEnd(15)} ${a.role.padEnd(12)} ${lastLogin}`);
  });
  console.log('─'.repeat(70));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
