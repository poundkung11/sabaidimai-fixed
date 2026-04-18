// ═══════════════════════════════════════════════════════════
// เพิ่ม tables ใหม่ใน db.exec(`...`) ที่มีอยู่แล้ว
// ═══════════════════════════════════════════════════════════

/*  ── เพิ่มต่อท้าย db.exec(`...`) ──
  CREATE TABLE IF NOT EXISTS friendships (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL REFERENCES mobile_users(id),
    addressee_id INTEGER NOT NULL REFERENCES mobile_users(id),
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT NOT NULL DEFAULT 'direct',
    name       TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversation_members (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    user_id         INTEGER NOT NULL REFERENCES mobile_users(id),
    joined_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    sender_id       INTEGER NOT NULL REFERENCES mobile_users(id),
    content         TEXT NOT NULL,
    sent_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_friendships_req  ON friendships(requester_id);
  CREATE INDEX IF NOT EXISTS idx_friendships_addr ON friendships(addressee_id);
  CREATE INDEX IF NOT EXISTS idx_conv_members     ON conversation_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_msgs        ON chat_messages(conversation_id);
*/

// ═══════════════════════════════════════════════════════════
// วาง routes ด้านล่างนี้ต่อจาก checkins ใน server.js
// ═══════════════════════════════════════════════════════════

// ─── ค้นหา user ───────────────────────────────────────────
app.get('/api/app/users/search', (req, res) => {
  const { q = '', requesterId } = req.query;
  if (!q.trim()) return res.json([]);
  const search = `%${q}%`;
  const rows = db.prepare(`
    SELECT mu.id, mu.display_name, mu.phone,
      CASE WHEN f.status = 'accepted' THEN 1 ELSE 0 END AS isFriend,
      CASE WHEN f.status = 'pending'  THEN 1 ELSE 0 END AS isPending
    FROM mobile_users mu
    LEFT JOIN friendships f
      ON (f.requester_id = ? AND f.addressee_id = mu.id)
      OR (f.addressee_id = ? AND f.requester_id = mu.id)
    WHERE (mu.display_name LIKE ? OR mu.phone LIKE ?)
      AND mu.id != ?
    LIMIT 20
  `).all(requesterId, requesterId, search, search, requesterId || 0);
  res.json(rows);
});

// ─── รายชื่อเพื่อน (accepted) ─────────────────────────────
app.get('/api/app/users/:userId/friends', (req, res) => {
  const uid = Number(req.params.userId);
  const rows = db.prepare(`
    SELECT
      mu.id, mu.display_name, mu.phone,
      f.id AS friendship_id
    FROM friendships f
    JOIN mobile_users mu
      ON mu.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
    WHERE (f.requester_id = ? OR f.addressee_id = ?)
      AND f.status = 'accepted'
  `).all(uid, uid, uid);
  res.json(rows);
});

// ─── คำขอเพื่อนที่รอดำเนินการ (ส่งมาหา userId) ────────────
app.get('/api/app/users/:userId/friends/pending', (req, res) => {
  const uid = Number(req.params.userId);
  const rows = db.prepare(`
    SELECT f.id, f.requester_id, mu.display_name AS requester_name, f.created_at
    FROM friendships f
    JOIN mobile_users mu ON mu.id = f.requester_id
    WHERE f.addressee_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `).all(uid);
  res.json(rows);
});

// ─── ส่งคำขอเพื่อน ────────────────────────────────────────
app.post('/api/app/users/:userId/friends', (req, res) => {
  const requesterId = Number(req.params.userId);
  const { addresseeId } = req.body || {};
  if (!addresseeId) return res.status(400).json({ message: 'addresseeId required' });
  const existing = db.prepare(`
    SELECT id FROM friendships
    WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)
  `).get(requesterId, addresseeId, addresseeId, requesterId);
  if (existing) return res.status(409).json({ message: 'friendship already exists' });
  const result = db.prepare(
    'INSERT INTO friendships (requester_id, addressee_id) VALUES (?,?)'
  ).run(requesterId, addresseeId);
  res.status(201).json({ id: result.lastInsertRowid, status: 'pending' });
});

// ─── ยืนยัน / ปฏิเสธคำขอเพื่อน ───────────────────────────
app.put('/api/app/friendships/:id/accept', (req, res) => {
  db.prepare("UPDATE friendships SET status='accepted' WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

app.put('/api/app/friendships/:id/reject', (req, res) => {
  db.prepare("UPDATE friendships SET status='rejected' WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── สร้าง / ดู conversations ─────────────────────────────
app.get('/api/app/users/:userId/conversations', (req, res) => {
  const uid = Number(req.params.userId);
  const rows = db.prepare(`
    SELECT c.id, c.type, c.name, c.created_at,
      (SELECT content FROM chat_messages WHERE conversation_id=c.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
      (SELECT COUNT(*) FROM chat_messages WHERE conversation_id=c.id) AS message_count
    FROM conversations c
    JOIN conversation_members cm ON cm.conversation_id = c.id
    WHERE cm.user_id = ?
    ORDER BY c.created_at DESC
  `).all(uid);
  res.json(rows);
});

app.post('/api/app/users/:userId/conversations', (req, res) => {
  const uid = Number(req.params.userId);
  const { type = 'direct', memberIds = [], name } = req.body || {};
  const allMembers = [...new Set([uid, ...memberIds])];
  const result = db.prepare('INSERT INTO conversations (type, name) VALUES (?,?)').run(type, name || null);
  const convId = result.lastInsertRowid;
  const insertMember = db.prepare('INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?,?)');
  allMembers.forEach(mid => insertMember.run(convId, mid));
  res.status(201).json({ id: convId, type, name: name || null, created_at: new Date().toISOString() });
});

// หา direct conversation ระหว่าง 2 user (หรือสร้างใหม่)
app.get('/api/app/users/:userId/conversations/direct/:friendId', (req, res) => {
  const uid = Number(req.params.userId);
  const fid = Number(req.params.friendId);
  const conv = db.prepare(`
    SELECT c.* FROM conversations c
    JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = ?
    JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = ?
    WHERE c.type = 'direct'
    LIMIT 1
  `).get(uid, fid);
  if (conv) return res.json(conv);
  // สร้างใหม่
  const result = db.prepare("INSERT INTO conversations (type) VALUES ('direct')").run();
  const convId = result.lastInsertRowid;
  db.prepare('INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?,?)').run(convId, uid);
  db.prepare('INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?,?)').run(convId, fid);
  res.status(201).json({ id: convId, type: 'direct', created_at: new Date().toISOString() });
});

// ─── Chat messages (REST history) ─────────────────────────
app.get('/api/app/conversations/:convId/messages', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const rows = db.prepare(`
    SELECT cm.id, cm.conversation_id, cm.sender_id, mu.display_name AS sender_name,
           cm.content, cm.sent_at
    FROM chat_messages cm
    JOIN mobile_users mu ON mu.id = cm.sender_id
    WHERE cm.conversation_id = ?
    ORDER BY cm.sent_at DESC LIMIT ?
  `).all(req.params.convId, limit);
  res.json(rows.reverse());
});

// บันทึกข้อความลง DB (optional — แอพใช้ MQTT เป็นหลัก)
app.post('/api/app/conversations/:convId/messages', (req, res) => {
  const { senderId, content } = req.body || {};
  if (!content?.trim()) return res.status(400).json({ message: 'content required' });
  const result = db.prepare(
    'INSERT INTO chat_messages (conversation_id, sender_id, content) VALUES (?,?,?)'
  ).run(req.params.convId, senderId, content.trim());
  const row = db.prepare(`
    SELECT cm.id, cm.conversation_id, cm.sender_id, mu.display_name AS sender_name, cm.content, cm.sent_at
    FROM chat_messages cm JOIN mobile_users mu ON mu.id=cm.sender_id WHERE cm.id=?
  `).get(result.lastInsertRowid);
  // Publish ไปยัง MQTT topic ด้วย
  mqttPublish(`sabaidimai/dm/${req.params.convId}`, {
    id: String(result.lastInsertRowid),
    sender: row.sender_name,
    content: row.content,
    timestamp: new Date(row.sent_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
  });
  res.status(201).json(row);
});
