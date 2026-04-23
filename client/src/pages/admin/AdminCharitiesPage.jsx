import { useEffect, useState } from 'react';
import { getCharities } from '../../services/charityService.js';
import api from '../../services/api.js';
import styles from './AdminPage.module.scss';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [form,      setForm]      = useState({ name: '', description: '', website: '', image_url: '', featured: false });
  const [saving,    setSaving]    = useState(false);
  const [expanded,  setExpanded]  = useState(null); // charity id with events panel open
  const [events,    setEvents]    = useState({});   // { [charityId]: [...] }
  const [evForm,    setEvForm]    = useState({ title: '', event_date: '', location: '', description: '' });
  const [evSaving,  setEvSaving]  = useState(false);

  useEffect(() => { getCharities().then(setCharities); }, []);

  const create = async () => {
    setSaving(true);
    const data = await api.post('/charities', form).finally(() => setSaving(false));
    setCharities([...charities, data]);
    setForm({ name: '', description: '', website: '', image_url: '', featured: false });
  };

  const toggle = async (c) => {
    await api.patch(`/charities/${c.id}`, { active: !c.active });
    setCharities((prev) => prev.map((x) => x.id === c.id ? { ...x, active: !x.active } : x));
  };

  const openEvents = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!events[id]) {
      const data = await api.get(`/charities/${id}/events`).catch(() => []);
      setEvents((prev) => ({ ...prev, [id]: data }));
    }
  };

  const addEvent = async (charityId) => {
    if (!evForm.title || !evForm.event_date) return;
    setEvSaving(true);
    try {
      const data = await api.post(`/charities/${charityId}/events`, evForm);
      setEvents((prev) => ({ ...prev, [charityId]: [...(prev[charityId] ?? []), data] }));
      setEvForm({ title: '', event_date: '', location: '', description: '' });
    } finally {
      setEvSaving(false);
    }
  };

  const removeEvent = async (charityId, eventId) => {
    await api.delete(`/charities/${charityId}/events/${eventId}`).catch(() => {});
    setEvents((prev) => ({ ...prev, [charityId]: prev[charityId].filter((e) => e.id !== eventId) }));
  };

  return (
    <div className={styles.list}>
      <div className={styles.panel}>
        <p className={styles.sectionLabel}>Add Charity</p>
        <div className={styles.fieldGroup}>
          {[['Name', 'name', 'text'], ['Description', 'description', 'text'], ['Website', 'website', 'url'], ['Image URL', 'image_url', 'url']].map(([label, key, type]) => (
            <div key={key}>
              <p className={styles.fieldLabel}>{label}</p>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={styles.input}
              />
            </div>
          ))}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured charity
          </label>
          <button
            onClick={create}
            disabled={!form.name || saving}
            className={styles.btnPrimaryFit}
          >
            {saving ? 'Saving...' : '+ Add Charity'}
          </button>
        </div>
      </div>

      {charities.map((c) => (
        <div key={c.id}>
          <div
            className={styles.charityItem}
            style={{ '--charity-opacity': c.active ? 1 : 0.4 }}
          >
            <div>
              <p className={styles.charityName}>{c.name}</p>
              {c.featured && <span className={styles.charityFeatured}>★ Featured</span>}
            </div>
            <div className={styles.charityActions}>
              <button
                onClick={() => openEvents(c.id)}
                className={styles.btnEventsToggle}
                style={expanded === c.id
                  ? { '--toggle-bg': 'rgba(245,158,11,0.15)', '--toggle-border': 'rgba(245,158,11,0.4)', '--toggle-color': '#f59e0b' }
                  : { '--toggle-bg': 'rgba(255,255,255,0.05)', '--toggle-border': 'rgba(255,255,255,0.12)', '--toggle-color': 'rgba(255,255,255,0.5)' }
                }
              >
                Events {expanded === c.id ? '▲' : '▼'}
              </button>
              <button
                onClick={() => toggle(c)}
                className={styles.btnToggleCharity}
                style={
                  c.active
                    ? { '--toggle-bg': 'rgba(239,68,68,0.12)', '--toggle-border': 'rgba(239,68,68,0.3)',  '--toggle-color': '#f87171' }
                    : { '--toggle-bg': 'rgba(52,211,153,0.12)', '--toggle-border': 'rgba(52,211,153,0.3)', '--toggle-color': '#34d399' }
                }
              >
                {c.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          {expanded === c.id && (
            <div className={styles.eventsPanel}>
              <p className={styles.sectionLabel} style={{ marginBottom: 12 }}>Upcoming Events</p>

              {/* Add event form */}
              <div className={styles.evFormRow}>
                <input
                  type="text"
                  placeholder="Event title *"
                  value={evForm.title}
                  onChange={(e) => setEvForm({ ...evForm, title: e.target.value })}
                  className={styles.input}
                  style={{ flex: 2 }}
                />
                <input
                  type="date"
                  value={evForm.event_date}
                  onChange={(e) => setEvForm({ ...evForm, event_date: e.target.value })}
                  className={styles.input}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={evForm.location}
                  onChange={(e) => setEvForm({ ...evForm, location: e.target.value })}
                  className={styles.input}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => addEvent(c.id)}
                  disabled={!evForm.title || !evForm.event_date || evSaving}
                  className={styles.btnPrimaryFit}
                >
                  {evSaving ? '…' : '+ Add'}
                </button>
              </div>

              {/* Event list */}
              {(events[c.id] ?? []).length === 0 ? (
                <p className={styles.evEmpty}>No upcoming events.</p>
              ) : (
                (events[c.id] ?? []).map((ev) => (
                  <div key={ev.id} className={styles.evItem}>
                    <div>
                      <p className={styles.evTitle}>{ev.title}</p>
                      <p className={styles.evMeta}>
                        {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {ev.location && ` · ${ev.location}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeEvent(c.id, ev.id)}
                      className={styles.btnDanger}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
