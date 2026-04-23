import { useEffect, useState } from 'react';
import { adminGetDraws, adminCreateDraw, adminSimulate, adminPublish } from '../../services/adminService.js';
import styles from './AdminPage.module.scss';

export default function AdminDrawsPage() {
  const [draws,   setDraws]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(null);
  const [form,    setForm]    = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), draw_type: 'random' });
  const [result,  setResult]  = useState(null);

  useEffect(() => { adminGetDraws().then(setDraws).finally(() => setLoading(false)); }, []);

  const create = async () => {
    const data = await adminCreateDraw(form);
    setDraws([data, ...draws]);
  };

  const simulate = async (id) => {
    setActing(id); setResult(null);
    const r = await adminSimulate(id).finally(() => setActing(null));
    setResult(r);
    setDraws((prev) => prev.map((d) => d.id === id ? { ...d, status: 'simulated' } : d));
  };

  const publish = async (id) => {
    setActing(id);
    await adminPublish(id).finally(() => setActing(null));
    setDraws((prev) => prev.map((d) => d.id === id ? { ...d, status: 'published' } : d));
  };

  return (
    <div className={styles.list}>
      <div className={styles.panel}>
        <p className={styles.sectionLabel}>Create Draw</p>
        <div className={styles.fieldRow}>
          {[['Month', 'month', 1, 12], ['Year', 'year', 2024, 2030]].map(([label, key, min, max]) => (
            <div key={key}>
              <p className={styles.fieldLabel}>{label}</p>
              <input
                type="number"
                min={min}
                max={max}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: +e.target.value })}
                className={styles.inputNarrow}
              />
            </div>
          ))}
          <div>
            <p className={styles.fieldLabel}>Type</p>
            <select
              value={form.draw_type}
              onChange={(e) => setForm({ ...form, draw_type: e.target.value })}
              className={styles.select}
            >
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          <button onClick={create} className={styles.btnPrimary}>
            + Create
          </button>
        </div>
      </div>

      {result && (
        <div className={styles.simResult}>
          <p className={styles.simResultTitle}>Simulation Result</p>
          <p className={styles.simResultMeta}>Numbers: {result.drawnNumbers?.join(', ')}</p>
          <p className={styles.simResultMeta}>Entries: {result.entryCount} · Pool: £{result.totalPool}</p>
          {result.results?.map((r) => (
            <p key={r.match_type} className={styles.simResultRow}>
              {r.match_type}-match: {r.winner_ids?.length ?? 0} winners · £{r.prize_per_winner} each
            </p>
          ))}
        </div>
      )}

      {loading
        ? <p className={styles.loading}>Loading...</p>
        : draws.map((d) => (
          <div key={d.id} className={styles.drawRow}>
            <div>
              <p className={styles.drawName}>
                {new Date(d.year, d.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                <span className={styles.drawType}>({d.draw_type})</span>
              </p>
              <p className={styles.drawMeta}>
                Status: {d.status} · Pool: £{d.prize_pools?.total_pool ?? '—'} · {d.prize_pools?.active_subscribers_count ?? 0} subs
              </p>
            </div>
            <div className={styles.drawActions}>
              {d.status !== 'published' && (
                <button
                  onClick={() => simulate(d.id)}
                  disabled={acting === d.id}
                  className={styles.btnSimulate}
                >
                  {acting === d.id ? '...' : 'Simulate'}
                </button>
              )}
              {d.status === 'simulated' && (
                <button
                  onClick={() => publish(d.id)}
                  disabled={acting === d.id}
                  className={styles.btnPublish}
                >
                  {acting === d.id ? '...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}
