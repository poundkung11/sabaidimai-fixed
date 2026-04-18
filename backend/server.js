const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'sabaidimai.db');

const db = new Database(DB_PATH);

app.use(cors());
app.use(express.json());

app.get(/^\/admin$/, (req, res) => {
  res.redirect('/admin/');
});

app.use('/admin', express.static(path.join(__dirname, 'admin')));

db.pragma('journal_mode = WAL');

function tableHasColumn(tableName, columnName) {
  return db.prepare(`
    SELECT 1
    FROM pragma_table_info('${tableName}')
    WHERE name = ?
    LIMIT 1
  `).get(columnName);
}

function renameColumnIfNeeded(tableName, oldColumnName, newColumnName) {
  const hasOldColumn = !!tableHasColumn(tableName, oldColumnName);
  const hasNewColumn = !!tableHasColumn(tableName, newColumnName);

  if (!hasOldColumn || hasNewColumn) {
    return;
  }

  db.exec(`ALTER TABLE ${tableName} RENAME COLUMN ${oldColumnName} TO ${newColumnName}`);
  console.log(`Migrated ${tableName}.${oldColumnName} -> ${newColumnName}`);
}

function ensureUniqueEmergencyCardUserId() {
  const hasUserId = !!tableHasColumn('emergency_cards', 'user_id');
  if (!hasUserId) {
    return;
  }

  const duplicate = db.prepare(`
    SELECT user_id, COUNT(*) AS total
    FROM emergency_cards
    GROUP BY user_id
    HAVING COUNT(*) > 1
    LIMIT 1
  `).get();

  if (duplicate) {
    console.warn(
      `Skipped unique emergency_cards.user_id index because duplicate user_id ${duplicate.user_id} exists`
    );
    return;
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_emergency_cards_user_id
    ON emergency_cards(user_id)
  `);
}

function runStartupMigrations() {
  renameColumnIfNeeded('checkins', 'mobile_user_id', 'user_id');
  renameColumnIfNeeded('checkins', 'checked_in_at', 'created_at');
  renameColumnIfNeeded('support_messages', 'mobile_user_id', 'user_id');
  renameColumnIfNeeded('emergency_cards', 'mobile_user_id', 'user_id');
  ensureUniqueEmergencyCardUserId();
}

runStartupMigrations();

db.exec(`
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

CREATE INDEX IF NOT EXISTS idx_friend_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_conv_member_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_sent ON chat_messages(conversation_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_checkins_user_created ON checkins(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_user_created ON support_messages(user_id, created_at);
`);

const usersCount = db.prepare(`SELECT COUNT(*) AS count FROM mobile_users`).get();

if (usersCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO mobile_users (display_name, phone)
    VALUES (?, ?)
  `);

  const sampleUsers = [
    ['Pound', '0811111111'],
    ['Aom', '0822222222'],
    ['Mild', '0833333333'],
    ['Boss', '0844444444'],
    ['May', '0855555555'],
  ];

  for (const [displayName, phone] of sampleUsers) {
    insertUser.run(displayName, phone);
  }

  console.log('Seeded sample mobile_users');
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

function formatTimeLabel(isoString) {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

function mapSupportMessage(row) {
  return {
    id: String(row.id),
    content: row.content,
    timestamp: formatTimeLabel(row.created_at),
    isOwn: row.sender_type === 'user',
    senderType: row.sender_type,
    createdAt: row.created_at,
  };
}

function getSupportMessagesForUser(userId) {
  return db.prepare(`
    SELECT id, content, sender_type, created_at
    FROM support_messages
    WHERE user_id = ?
    ORDER BY datetime(created_at) ASC, id ASC
  `).all(userId).map(mapSupportMessage);
}

function ensureSupportThreadSeeded(userId) {
  const row = db.prepare(`
    SELECT id
    FROM support_messages
    WHERE user_id = ?
    LIMIT 1
  `).get(userId);

  if (row) {
    return;
  }

  db.prepare(`
    INSERT INTO support_messages (user_id, sender_type, content)
    VALUES (?, 'support', ?)
  `).run(userId, 'สวัสดีค่ะ เจ้าหน้าที่พร้อมช่วยเหลือ หากมีปัญหาสามารถพิมพ์ข้อความมาได้เลย');
}

function normalizeEmergencyCard(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    chronicConditions: row.chronic_conditions || '',
    allergies: row.allergies || '',
    medications: row.medications || '',
    bloodType: row.blood_type || '',
    notes: row.notes || '',
    updatedAt: row.updated_at,
  };
}

function getAdminUsers() {
  return db.prepare(`
    SELECT
      mu.id,
      mu.display_name,
      mu.phone,
      mu.created_at,
      (
        SELECT COUNT(*)
        FROM friendships f
        WHERE (f.requester_id = mu.id OR f.addressee_id = mu.id)
          AND f.status = 'accepted'
      ) AS friends_count,
      (
        SELECT COUNT(*)
        FROM friendships f
        WHERE f.addressee_id = mu.id
          AND f.status = 'pending'
      ) AS pending_requests
    FROM mobile_users mu
    ORDER BY datetime(mu.created_at) DESC, mu.id DESC
  `).all();
}

function getAdminFriendships() {
  return db.prepare(`
    SELECT
      f.id,
      f.requester_id,
      f.addressee_id,
      requester.display_name AS requester_name,
      addressee.display_name AS addressee_name,
      f.status,
      f.created_at
    FROM friendships f
    JOIN mobile_users requester ON requester.id = f.requester_id
    JOIN mobile_users addressee ON addressee.id = f.addressee_id
    ORDER BY datetime(f.created_at) DESC, f.id DESC
  `).all();
}

function getAdminConversations() {
  return db.prepare(`
    SELECT
      c.id,
      c.type,
      COALESCE(c.name, 'ห้อง #' || c.id) AS name,
      c.created_at,
      (
        SELECT COUNT(*)
        FROM conversation_members cm
        WHERE cm.conversation_id = c.id
      ) AS members_count,
      (
        SELECT COUNT(*)
        FROM chat_messages msg
        WHERE msg.conversation_id = c.id
      ) AS messages_count,
      (
        SELECT msg.content
        FROM chat_messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY datetime(msg.sent_at) DESC, msg.id DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT msg.sent_at
        FROM chat_messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY datetime(msg.sent_at) DESC, msg.id DESC
        LIMIT 1
      ) AS last_message_at
    FROM conversations c
    ORDER BY COALESCE(last_message_at, c.created_at) DESC, c.id DESC
  `).all();
}

function getAdminConversationMessages(conversationId) {
  return db.prepare(`
    SELECT
      msg.id,
      msg.conversation_id,
      msg.sender_id,
      sender.display_name AS sender_name,
      msg.content,
      msg.sent_at
    FROM chat_messages msg
    JOIN mobile_users sender ON sender.id = msg.sender_id
    WHERE msg.conversation_id = ?
    ORDER BY datetime(msg.sent_at) ASC, msg.id ASC
  `).all(conversationId);
}

function getAdminRecentCheckins(limit = 20) {
  return db.prepare(`
    SELECT
      c.id,
      c.user_id,
      c.status,
      c.source,
      c.created_at,
      mu.display_name
    FROM checkins c
    JOIN mobile_users mu ON mu.id = c.user_id
    ORDER BY datetime(c.created_at) DESC, c.id DESC
    LIMIT ?
  `).all(limit);
}

function getAdminSupportThreads() {
  return db.prepare(`
    SELECT
      mu.id AS user_id,
      mu.display_name,
      mu.phone,
      COUNT(sm.id) AS messages_count,
      MAX(sm.created_at) AS last_message_at
    FROM mobile_users mu
    LEFT JOIN support_messages sm ON sm.user_id = mu.id
    GROUP BY mu.id, mu.display_name, mu.phone
    ORDER BY COALESCE(last_message_at, mu.created_at) DESC
  `).all();
}

function getAdminRecentMessages(limit = 20) {
  return db.prepare(`
    SELECT
      msg.id,
      msg.conversation_id,
      COALESCE(c.name, 'ห้อง #' || c.id) AS conversation_name,
      sender.display_name AS sender_name,
      msg.content,
      msg.sent_at
    FROM chat_messages msg
    JOIN conversations c ON c.id = msg.conversation_id
    JOIN mobile_users sender ON sender.id = msg.sender_id
    ORDER BY datetime(msg.sent_at) DESC, msg.id DESC
    LIMIT ?
  `).all(limit);
}

function getAdminStats() {
  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM mobile_users) AS users_count,
      (SELECT COUNT(*) FROM friendships WHERE status = 'accepted') AS accepted_friendships,
      (SELECT COUNT(*) FROM friendships WHERE status = 'pending') AS pending_friendships,
      (SELECT COUNT(*) FROM conversations) AS conversations_count,
      (SELECT COUNT(*) FROM chat_messages) AS messages_count,
      (SELECT COUNT(*) FROM support_messages) AS support_messages_count,
      (SELECT COUNT(*) FROM checkins) AS checkins_count,
      (
        SELECT COUNT(*)
        FROM checkins
        WHERE date(created_at, 'localtime') = date('now', 'localtime')
      ) AS today_checkins
  `).get();

  return totals;
}

function getAdminDashboard() {
  return {
    stats: getAdminStats(),
    users: getAdminUsers(),
    friendships: getAdminFriendships(),
    conversations: getAdminConversations(),
    recentMessages: getAdminRecentMessages(),
    recentCheckins: getAdminRecentCheckins(),
    supportThreads: getAdminSupportThreads(),
  };
}

app.get('/', (req, res) => {
  res.redirect('/admin/');
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    db: 'connected',
    time: new Date().toISOString(),
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  try {
    return res.json(getAdminDashboard());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/conversations/:conversationId/messages', (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    return res.json(getAdminConversationMessages(conversationId));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/api/app/users/search', (req, res) => {
  try {
    const requesterId = Number(req.query.requesterId);
    const q = String(req.query.q || '').trim();

    if (!requesterId) {
      return res.status(400).json({ message: 'requesterId is required' });
    }

    ensureMobileUserExists(requesterId);

    if (!q) {
      return res.json([]);
    }

    const rows = db.prepare(`
      SELECT
        mu.id,
        mu.display_name,
        mu.phone,
        (
          SELECT f.status
          FROM friendships f
          WHERE (
            (f.requester_id = ? AND f.addressee_id = mu.id)
            OR
            (f.requester_id = mu.id AND f.addressee_id = ?)
          )
          LIMIT 1
        ) AS friendship_status
      FROM mobile_users mu
      WHERE mu.id <> ?
        AND (
          mu.display_name LIKE ?
          OR COALESCE(mu.phone, '') LIKE ?
        )
      ORDER BY mu.display_name ASC
      LIMIT 30
    `).all(
      requesterId,
      requesterId,
      requesterId,
      `%${q}%`,
      `%${q}%`
    );

    return res.json(
      rows.map((row) => ({
        id: row.id,
        display_name: row.display_name,
        phone: row.phone,
        friendship_status: row.friendship_status || null,
        isFriend: row.friendship_status === 'accepted',
        isPending: row.friendship_status === 'pending',
      }))
    );
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = ensureMobileUserExists(userId);
    return res.json(user);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/app/users/:userId/friends', (req, res) => {
  try {
    const requesterId = Number(req.params.userId);
    const addresseeId = Number(req.body?.addresseeId);

    if (!requesterId || !addresseeId) {
      return res.status(400).json({ message: 'userId and addresseeId are required' });
    }

    if (requesterId === addresseeId) {
      return res.status(400).json({ message: 'Cannot add yourself' });
    }

    ensureMobileUserExists(requesterId);
    ensureMobileUserExists(addresseeId);

    const existing = findFriendshipBetween(requesterId, addresseeId);

    if (existing) {
      return res.json({
        ok: true,
        friendshipId: existing.id,
        status: existing.status,
        message: existing.status === 'accepted' ? 'Already friends' : 'Friend request already exists',
      });
    }

    const result = db.prepare(`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (?, ?, 'pending')
    `).run(requesterId, addresseeId);

    return res.status(201).json({
      ok: true,
      friendshipId: result.lastInsertRowid,
      status: 'pending',
      message: 'Friend request sent',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/friends', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);

    const rows = db.prepare(`
      SELECT
        f.id AS friendship_id,
        f.status,
        f.created_at,
        mu.id,
        mu.display_name,
        mu.phone
      FROM friendships f
      JOIN mobile_users mu
        ON mu.id = CASE
          WHEN f.requester_id = ? THEN f.addressee_id
          ELSE f.requester_id
        END
      WHERE (f.requester_id = ? OR f.addressee_id = ?)
        AND f.status = 'accepted'
      ORDER BY mu.display_name ASC
    `).all(userId, userId, userId);

    return res.json(rows);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/friends/pending', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);

    const rows = db.prepare(`
      SELECT
        f.id AS friendship_id,
        f.requester_id,
        mu.display_name AS requester_name,
        mu.phone AS requester_phone,
        f.status,
        f.created_at
      FROM friendships f
      JOIN mobile_users mu ON mu.id = f.requester_id
      WHERE f.addressee_id = ?
        AND f.status = 'pending'
      ORDER BY datetime(f.created_at) DESC, f.id DESC
    `).all(userId);

    return res.json(rows);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.put('/api/app/friendships/:friendshipId/accept', (req, res) => {
  try {
    const friendshipId = Number(req.params.friendshipId);
    const actorUserId = Number(req.body?.userId);

    if (!friendshipId || !actorUserId) {
      return res.status(400).json({ message: 'friendshipId and userId are required' });
    }

    ensureMobileUserExists(actorUserId);

    const friendship = db.prepare(`
      SELECT *
      FROM friendships
      WHERE id = ?
      LIMIT 1
    `).get(friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    if (friendship.addressee_id !== actorUserId) {
      return res.status(403).json({ message: 'Not allowed to accept this request' });
    }

    db.prepare(`
      UPDATE friendships
      SET status = 'accepted'
      WHERE id = ?
    `).run(friendshipId);

    const conversation = getOrCreateDirectConversation(friendship.requester_id, friendship.addressee_id);

    return res.json({
      ok: true,
      friendshipId,
      status: 'accepted',
      conversationId: conversation.id,
      message: 'Friend request accepted',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.put('/api/app/friendships/:friendshipId/reject', (req, res) => {
  try {
    const friendshipId = Number(req.params.friendshipId);
    const actorUserId = Number(req.body?.userId);

    if (!friendshipId || !actorUserId) {
      return res.status(400).json({ message: 'friendshipId and userId are required' });
    }

    ensureMobileUserExists(actorUserId);

    const friendship = db.prepare(`
      SELECT *
      FROM friendships
      WHERE id = ?
      LIMIT 1
    `).get(friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    if (friendship.addressee_id !== actorUserId) {
      return res.status(403).json({ message: 'Not allowed to reject this request' });
    }

    db.prepare(`
      DELETE FROM friendships
      WHERE id = ?
    `).run(friendshipId);

    return res.json({
      ok: true,
      friendshipId,
      status: 'rejected',
      message: 'Friend request rejected',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/conversations', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);

    const rows = db.prepare(`
      SELECT
        c.id,
        c.type,
        c.name,
        c.created_at,
        (
          SELECT cm.content
          FROM chat_messages cm
          WHERE cm.conversation_id = c.id
          ORDER BY datetime(cm.sent_at) DESC, cm.id DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT cm.sent_at
          FROM chat_messages cm
          WHERE cm.conversation_id = c.id
          ORDER BY datetime(cm.sent_at) DESC, cm.id DESC
          LIMIT 1
        ) AS last_message_at
      FROM conversations c
      JOIN conversation_members me
        ON me.conversation_id = c.id
       AND me.user_id = ?
      ORDER BY COALESCE(last_message_at, c.created_at) DESC
    `).all(userId);

    return res.json(rows);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/conversations/direct/:friendId', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const friendId = Number(req.params.friendId);

    ensureMobileUserExists(userId);
    ensureMobileUserExists(friendId);

    if (!isFriend(userId, friendId)) {
      return res.status(403).json({ message: 'Users are not friends yet' });
    }

    const conversation = getOrCreateDirectConversation(userId, friendId);

    return res.json(conversation);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/app/users/:userId/conversations', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const type = req.body?.type === 'group' ? 'group' : 'direct';
    const memberIds = Array.isArray(req.body?.memberIds)
      ? req.body.memberIds.map(Number).filter(Boolean)
      : [];
    const name = req.body?.name ? String(req.body.name).trim() : null;

    ensureMobileUserExists(userId);

    const uniqueMembers = Array.from(new Set([userId, ...memberIds]));
    uniqueMembers.forEach(ensureMobileUserExists);

    if (type === 'direct') {
      const otherUserId = uniqueMembers.find((id) => id !== userId);

      if (!otherUserId) {
        return res.status(400).json({ message: 'Direct conversation needs 2 users' });
      }

      if (!isFriend(userId, otherUserId)) {
        return res.status(403).json({ message: 'Users must be friends first' });
      }

      const conversation = getOrCreateDirectConversation(userId, otherUserId);
      return res.status(201).json(conversation);
    }

    const insertConversation = db.prepare(`
      INSERT INTO conversations (type, name)
      VALUES ('group', ?)
    `).run(name || 'New Group');

    const conversationId = insertConversation.lastInsertRowid;

    const insertMember = db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES (?, ?)
    `);

    for (const memberId of uniqueMembers) {
      insertMember.run(conversationId, memberId);
    }

    const conversation = db.prepare(`
      SELECT id, type, name, created_at
      FROM conversations
      WHERE id = ?
    `).get(conversationId);

    return res.status(201).json(conversation);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/conversations/:conversationId/messages', (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const userId = Number(req.query.userId);
    const limit = Math.min(Number(req.query.limit || 50), 200);

    if (!conversationId || !userId) {
      return res.status(400).json({ message: 'conversationId and userId are required' });
    }

    ensureMobileUserExists(userId);

    const conversation = db.prepare(`
      SELECT id, type, name, created_at
      FROM conversations
      WHERE id = ?
      LIMIT 1
    `).get(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!isConversationMember(conversationId, userId)) {
      return res.status(403).json({ message: 'You are not a member of this conversation' });
    }

    const rows = db.prepare(`
      SELECT
        cm.id,
        cm.conversation_id,
        cm.sender_id,
        mu.display_name AS sender_name,
        cm.content,
        cm.sent_at
      FROM chat_messages cm
      JOIN mobile_users mu ON mu.id = cm.sender_id
      WHERE cm.conversation_id = ?
      ORDER BY datetime(cm.sent_at) ASC, cm.id ASC
      LIMIT ?
    `).all(conversationId, limit);

    return res.json(rows);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/app/conversations/:conversationId/messages', (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const senderId = Number(req.body?.senderId);
    const content = String(req.body?.content || '').trim();

    if (!conversationId || !senderId) {
      return res.status(400).json({ message: 'conversationId and senderId are required' });
    }

    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    ensureMobileUserExists(senderId);

    const conversation = db.prepare(`
      SELECT id, type, name, created_at
      FROM conversations
      WHERE id = ?
      LIMIT 1
    `).get(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!isConversationMember(conversationId, senderId)) {
      return res.status(403).json({ message: 'Sender is not in this conversation' });
    }

    const result = db.prepare(`
      INSERT INTO chat_messages (conversation_id, sender_id, content)
      VALUES (?, ?, ?)
    `).run(conversationId, senderId, content);

    const message = db.prepare(`
      SELECT
        cm.id,
        cm.conversation_id,
        cm.sender_id,
        mu.display_name AS sender_name,
        cm.content,
        cm.sent_at
      FROM chat_messages cm
      JOIN mobile_users mu ON mu.id = cm.sender_id
      WHERE cm.id = ?
      LIMIT 1
    `).get(result.lastInsertRowid);

    return res.status(201).json(message);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/emergency-card', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);

    const row = db.prepare(`
      SELECT *
      FROM emergency_cards
      WHERE user_id = ?
      LIMIT 1
    `).get(userId);

    return res.json(normalizeEmergencyCard(row));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/app/users/:userId/emergency-card', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);

    const fullName = String(req.body?.fullName || '').trim();
    if (!fullName) {
      return res.status(400).json({ message: 'fullName is required' });
    }

    const payload = {
      userId,
      fullName,
      chronicConditions: req.body?.chronicConditions ? String(req.body.chronicConditions).trim() : null,
      allergies: req.body?.allergies ? String(req.body.allergies).trim() : null,
      medications: req.body?.medications ? String(req.body.medications).trim() : null,
      bloodType: req.body?.bloodType ? String(req.body.bloodType).trim() : null,
      notes: req.body?.notes ? String(req.body.notes).trim() : null,
    };

    db.prepare(`
      INSERT INTO emergency_cards (
        user_id, full_name, chronic_conditions, allergies, medications, blood_type, notes, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        full_name = excluded.full_name,
        chronic_conditions = excluded.chronic_conditions,
        allergies = excluded.allergies,
        medications = excluded.medications,
        blood_type = excluded.blood_type,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      payload.userId,
      payload.fullName,
      payload.chronicConditions,
      payload.allergies,
      payload.medications,
      payload.bloodType,
      payload.notes
    );

    const row = db.prepare(`
      SELECT *
      FROM emergency_cards
      WHERE user_id = ?
      LIMIT 1
    `).get(userId);

    return res.status(201).json(normalizeEmergencyCard(row));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/checkins', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);

    const rows = db.prepare(`
      SELECT id, user_id, status, source, created_at
      FROM checkins
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT 100
    `).all(userId);

    return res.json(rows);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/app/users/:userId/checkins', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const status = String(req.body?.status || '').trim();
    const source = req.body?.source ? String(req.body.source).trim() : null;

    ensureMobileUserExists(userId);

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const result = db.prepare(`
      INSERT INTO checkins (user_id, status, source)
      VALUES (?, ?, ?)
    `).run(userId, status, source);

    const row = db.prepare(`
      SELECT id, user_id, status, source, created_at
      FROM checkins
      WHERE id = ?
      LIMIT 1
    `).get(result.lastInsertRowid);

    return res.status(201).json(row);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/app/users/:userId/support-messages', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    ensureMobileUserExists(userId);
    ensureSupportThreadSeeded(userId);
    return res.json(getSupportMessagesForUser(userId));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/app/users/:userId/support-messages', (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const content = String(req.body?.content || '').trim();

    ensureMobileUserExists(userId);
    ensureSupportThreadSeeded(userId);

    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    db.prepare(`
      INSERT INTO support_messages (user_id, sender_type, content)
      VALUES (?, 'user', ?)
    `).run(userId, content);

    db.prepare(`
      INSERT INTO support_messages (user_id, sender_type, content)
      VALUES (?, 'support', ?)
    `).run(userId, 'ได้รับข้อความของคุณแล้ว หากเป็นเหตุฉุกเฉินกรุณาใช้ปุ่ม SOS ทันที');

    return res.status(201).json(getSupportMessagesForUser(userId));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin/`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
