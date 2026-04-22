const STORAGE_KEYS = {
  users: "hc_users",
  messages: "hc_messages",
  chatRequests: "hc_admin_chat_requests",
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeUser(userLike) {
  if (!userLike) return null;
  const id = userLike.id || userLike._id || userLike.userId || userLike.sub;
  if (!id) return null;
  return {
    id: String(id),
    name: userLike.name || userLike.username || userLike.email || "User",
    role: userLike.role || "patient",
  };
}

function getTokenUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return normalizeUser(payload);
}

export function getAuthUser() {
  const fromCache =
    normalizeUser(readJson("user", null)) ||
    normalizeUser(readJson("authUser", null));
  return fromCache || getTokenUser();
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("authUser");
}

export function getUsers() {
  const stored = readJson(STORAGE_KEYS.users, []);
  const safeUsers = Array.isArray(stored)
    ? stored.map(normalizeUser).filter(Boolean)
    : [];
  const authUser = getAuthUser();
  if (!authUser) return safeUsers;
  if (safeUsers.some((entry) => entry.id === authUser.id)) return safeUsers;
  return [authUser, ...safeUsers];
}

export function getAllowedChatPeers(currentUserId) {
  const users = getUsers();
  return users.filter((entry) => entry.id !== String(currentUserId));
}

export function canUsersChatNow() {
  return true;
}

export function getConversation(userAId, userBId) {
  const a = String(userAId);
  const b = String(userBId);
  const messages = readJson(STORAGE_KEYS.messages, []);
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (msg) =>
        (String(msg.fromUserId) === a && String(msg.toUserId) === b) ||
        (String(msg.fromUserId) === b && String(msg.toUserId) === a)
    )
    .sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt));
}

export function sendMessage({ fromUserId, toUserId, text }) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return { ok: false, message: "Message cannot be empty." };
  const messages = readJson(STORAGE_KEYS.messages, []);
  const next = Array.isArray(messages) ? [...messages] : [];
  next.push({
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    fromUserId: String(fromUserId),
    toUserId: String(toUserId),
    text: trimmed,
    createdAt: new Date().toISOString(),
  });
  writeJson(STORAGE_KEYS.messages, next);
  return { ok: true };
}

export function createAdminChatRequest(fromUserId) {
  const requests = readJson(STORAGE_KEYS.chatRequests, []);
  const safeRequests = Array.isArray(requests) ? requests : [];
  const existingPending = safeRequests.some(
    (entry) =>
      String(entry.fromUserId) === String(fromUserId) && entry.status === "pending"
  );
  if (existingPending) {
    return { ok: false, message: "You already have a pending admin request." };
  }
  safeRequests.push({
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    fromUserId: String(fromUserId),
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  writeJson(STORAGE_KEYS.chatRequests, safeRequests);
  return { ok: true };
}

export function getPatientAdminRequestStatus(patientId) {
  const requests = readJson(STORAGE_KEYS.chatRequests, []);
  if (!Array.isArray(requests)) return "none";
  const mine = requests
    .filter((entry) => String(entry.fromUserId) === String(patientId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!mine.length) return "none";
  return mine[0].status || "none";
}

export function getAdminInboxRequests() {
  const requests = readJson(STORAGE_KEYS.chatRequests, []);
  if (!Array.isArray(requests)) return [];
  return requests.filter((entry) => entry.status === "pending");
}

export function updateChatRequestStatus(requestId, decision) {
  const requests = readJson(STORAGE_KEYS.chatRequests, []);
  if (!Array.isArray(requests)) return { ok: false };
  const next = requests.map((entry) =>
    String(entry.id) === String(requestId) ? { ...entry, status: decision } : entry
  );
  writeJson(STORAGE_KEYS.chatRequests, next);
  return { ok: true };
}
