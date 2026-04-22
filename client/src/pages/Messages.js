import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  canUsersChatNow,
  createAdminChatRequest,
  getAdminInboxRequests,
  getAllowedChatPeers,
  getAuthUser,
  getConversation,
  getPatientAdminRequestStatus,
  getUsers,
  logoutUser,
  sendMessage,
  updateChatRequestStatus,
} from "../utils/healthcareStore";

function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getAuthUser();
  const unauthorized = !user;

  useEffect(() => {
    if (unauthorized) navigate("/");
  }, [navigate, unauthorized]);

  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [text, setText] = useState("");
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const usersMap = (() => {
    const map = {};
    getUsers().forEach((entry) => {
      map[entry.id] = entry;
    });
    return map;
  })();

  const peers = useMemo(() => {
    if (!user) return [];
    return getAllowedChatPeers(user.id, new Date(tick)).sort(
      (a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)
    );
  }, [user, tick]);

  useEffect(() => {
    if (peers.length === 0) {
      setSelectedPeerId("");
      return;
    }
    const requestedPeer = searchParams.get("peer");
    const requestedAllowed =
      requestedPeer && peers.some((entry) => entry.id === requestedPeer);

    if (requestedAllowed) {
      setSelectedPeerId(requestedPeer);
      return;
    }

    if (!selectedPeerId || !peers.some((entry) => entry.id === selectedPeerId)) {
      setSelectedPeerId(peers[0].id);
    }
  }, [peers, searchParams, selectedPeerId]);

  const selectedPeer = peers.find((entry) => entry.id === selectedPeerId) || null;
  const conversation =
    !user || !selectedPeerId ? [] : getConversation(user.id, selectedPeerId);
  const canSendToSelected = selectedPeerId
    ? canUsersChatNow(user.id, selectedPeerId)
    : false;

  const patientRequestStatus =
    user?.role === "patient" ? getPatientAdminRequestStatus(user.id) : "none";
  const adminRequests = user?.role === "admin" ? getAdminInboxRequests() : [];

  const onSend = () => {
    if (!selectedPeerId) {
      alert("Please select a user to message.");
      return;
    }

    const result = sendMessage({
      fromUserId: user.id,
      toUserId: selectedPeerId,
      text,
    });

    if (!result.ok) {
      alert(result.message);
      return;
    }

    setText("");
    setTick(Date.now());
  };

  const sendRequestToAdmin = () => {
    const result = createAdminChatRequest(user.id);
    if (!result.ok) {
      alert(result.message);
      return;
    }
    alert("Request sent to admin.");
    setTick(Date.now());
  };

  const decideRequest = (requestId, decision) => {
    updateChatRequestStatus(requestId, decision);
    setTick(Date.now());
  };

  const getBackPath = () => {
    if (user?.role === "patient" && searchParams.get("from") === "appointments") {
      return "/patient/appointments";
    }
    if (user?.role === "patient") return "/home";
    if (user?.role === "doctor") return "/doctor/profile";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/";
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  if (unauthorized) return null;

  return (
    <div className="page-shell">
      <nav className="navbar topbar px-4 py-3">
        <h4 className="brand-title mb-0">Messages</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-light btn-soft" onClick={() => navigate(getBackPath())}>
            Back
          </button>
          <button
            className="btn btn-outline-light btn-soft"
            onClick={() => {
              logoutUser();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="soft-card p-3 mb-3">
              <label className="field-label">Select User</label>
              {peers.length === 0 ? (
                <p className="muted-note mb-0">
                  No active chat contacts right now based on appointment window/rules.
                </p>
              ) : (
                <select
                  className="form-select"
                  value={selectedPeerId}
                  onChange={(e) => setSelectedPeerId(e.target.value)}
                >
                  {peers.map((peer) => (
                    <option value={peer.id} key={peer.id}>
                      {peer.name} ({peer.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {user.role === "patient" && (
              <div className="soft-card p-3">
                <h6 className="fw-bold mb-2">Request</h6>
                <p className="muted-note mb-2">
                  Admin chat request status: <strong>{patientRequestStatus}</strong>
                </p>
                <button
                  className="btn btn-outline-primary btn-soft"
                  disabled={patientRequestStatus === "pending"}
                  onClick={sendRequestToAdmin}
                >
                  Request Admin Chat
                </button>
              </div>
            )}

            {user.role === "admin" && (
              <div className="soft-card p-3">
                <h6 className="fw-bold mb-2">Requests</h6>
                {adminRequests.length === 0 ? (
                  <p className="muted-note mb-0">No pending requests.</p>
                ) : (
                  adminRequests.map((request) => {
                    const fromUser = usersMap[request.fromUserId];
                    return (
                      <div className="border rounded p-2 mb-2" key={request.id}>
                        <p className="mb-2">
                          {fromUser?.name || request.fromUserId} requested admin chat.
                        </p>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            title="Approve"
                            onClick={() => decideRequest(request.id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Reject"
                            onClick={() => decideRequest(request.id, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="col-md-8">
            <div className="soft-card p-3 h-100 d-flex flex-column">
              <h6 className="fw-bold mb-3">
                Chat with {selectedPeer ? `${selectedPeer.name} (${selectedPeer.role})` : "-"}
              </h6>

              <div className="messages-box mb-3">
                {conversation.length === 0 && <p className="muted-note mb-0">No messages yet.</p>}
                {conversation.map((msg) => {
                  const mine = msg.fromUserId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`message-item ${mine ? "message-item-mine" : "message-item-peer"}`}
                    >
                      <p className="mb-1">{msg.text}</p>
                      <small>{formatDate(msg.createdAt)}</small>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto">
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="Type your message..."
                  value={text}
                  disabled={!selectedPeerId || !canSendToSelected}
                  onChange={(e) => setText(e.target.value)}
                />
                {!canSendToSelected && selectedPeerId && (
                  <p className="muted-note mb-2">
                    You can view messages, but sending is not allowed right now by chat rules.
                  </p>
                )}
                <button
                  className="btn btn-brand"
                  disabled={!selectedPeerId || !canSendToSelected}
                  onClick={onSend}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
