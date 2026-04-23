import { useEffect, useState } from 'react';
import { adminGetUsers, adminGetUserScores, adminUpdateScore, adminUpdateUser } from '../../services/adminService.js';
import styles from './AdminPage.module.scss';

const subStatusVars = {
  active:    { '--badge-color': '#34d399', '--badge-bg': 'rgba(52,211,153,0.12)'  },
  cancelled: { '--badge-color': '#f87171', '--badge-bg': 'rgba(248,113,113,0.12)' },
  lapsed:    { '--badge-color': '#fbbf24', '--badge-bg': 'rgba(251,191,36,0.12)'  },
};

function UserScores({ userId }) {
  const [scores,    setScores]    = useState(null);
  const [editId,    setEditId]    = useState(null);
  const [editVal,   setEditVal]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    adminGetUserScores(userId).then(setScores);
  }, [userId]);

  const save = async (id) => {
    const val = parseInt(editVal, 10);
    if (isNaN(val) || val < 1 || val > 45) { setError('Score must be 1–45.'); return; }
    setSaving(true); setError('');
    try {
      const updated = await adminUpdateScore(id, val);
      setScores((prev) => prev.map((s) => s.id === id ? updated : s));
      setEditId(null);
    } catch (err) {
      setError(err.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (!scores) return <p className={styles.loading}>Loading scores…</p>;
  if (!scores.length) return <p className={styles.empty}>No scores recorded.</p>;

  return (
    <div className={styles.userScoresList}>
      {error && <p className={styles.userScoreError}>{error}</p>}
      {scores.map((s) => (
        <div key={s.id} className={styles.userScoreRow}>
          <span className={styles.userScoreDate}>
            {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {editId === s.id ? (
            <>
              <input
                type="number" min={1} max={45}
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(s.id); if (e.key === 'Escape') setEditId(null); }}
                autoFocus
                className={styles.userScoreInput}
              />
              <button onClick={() => save(s.id)} disabled={saving} className={styles.btnApprove}>
                Save
              </button>
              <button onClick={() => setEditId(null)} className={styles.btnReject}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className={styles.userScoreVal}>{s.score}</span>
              <button
                onClick={() => { setEditId(s.id); setEditVal(String(s.score)); setError(''); }}
                className={styles.btnSimulate}
              >
                Edit
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [editName, setEditName] = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { adminGetUsers().then(setUsers).finally(() => setLoading(false)); }, []);

  const filtered = search.trim()
    ? users.filter((u) =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const saveName = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await adminUpdateUser(id, { full_name: editName.trim() });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, full_name: updated.full_name } : u));
      setEditId(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.list}>
      <div className={styles.panel}>
        <div className={styles.usersHeader}>
          <p className={styles.sectionLabel}>All Users ({users.length})</p>
          <input
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filtered.length && (
        <p className={styles.empty}>{search ? 'No users match your search.' : 'No users yet.'}</p>
      )}

      {filtered.map((u) => {
        const sub  = u.subscriptions?.[0];
        const vars = subStatusVars[sub?.status] ?? { '--badge-color': 'rgba(255,255,255,0.35)', '--badge-bg': 'rgba(255,255,255,0.06)' };
        const open = expanded === u.id;

        return (
          <div key={u.id} className={styles.userRowWrap}>
            <div className={styles.userRow}>
              <div className={styles.userInfo}>
                {editId === u.id ? (
                  <div className={styles.nameEditRow}>
                    <input
                      className={styles.userScoreInput}
                      style={{ width: 180 }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName(u.id); if (e.key === 'Escape') setEditId(null); }}
                      autoFocus
                    />
                    <button onClick={() => saveName(u.id)} disabled={saving} className={styles.btnApprove}>Save</button>
                    <button onClick={() => setEditId(null)} className={styles.btnReject}>✕</button>
                  </div>
                ) : (
                  <div className={styles.nameEditRow}>
                    <p className={styles.userName}>{u.full_name || '—'}</p>
                    <button
                      onClick={() => { setEditId(u.id); setEditName(u.full_name || ''); }}
                      className={styles.btnSimulate}
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >Edit</button>
                  </div>
                )}
                <p className={styles.userEmail}>{u.email}</p>
              </div>
              <div className={styles.userMeta}>
                <span className={styles.statusBadge} style={vars}>
                  {sub?.status ?? 'no plan'}
                </span>
                {sub?.plan && <span className={styles.userPlan}>{sub.plan}</span>}
                <span className={styles.userJoined}>
                  Joined {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => toggle(u.id)}
                  className={styles.btnSimulate}
                >
                  {open ? 'Hide scores' : 'View scores'}
                </button>
              </div>
            </div>
            {open && (
              <div className={styles.userScoresPanel}>
                <p className={styles.sectionLabel}>Golf Scores</p>
                <UserScores userId={u.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
