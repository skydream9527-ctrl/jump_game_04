import { useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../../state/leaderboard';

interface Props {
  onClose: () => void;
}

export function LeaderboardOverlay({ onClose }: Props) {
  const [entries] = useState<LeaderboardEntry[]>(() => getLeaderboard());

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={e => e.stopPropagation()}>
        <h2>排行榜</h2>
        {entries.length === 0 ? (
          <p style={{ color: '#9e9486', textAlign: 'center' }}>暂无记录</p>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ece2d0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #3a3a4a' }}>
                  <th style={{ padding: '4px 8px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '4px 8px', textAlign: 'left' }}>名称</th>
                  <th style={{ padding: '4px 8px', textAlign: 'right' }}>分数</th>
                  <th style={{ padding: '4px 8px', textAlign: 'right' }}>章节</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #2a2a3a' }}>
                    <td style={{ padding: '4px 8px' }}>{i + 1}</td>
                    <td style={{ padding: '4px 8px' }}>{e.name}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{e.score.toLocaleString()}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{e.chapter}-{e.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          className="menu-btn"
          onClick={onClose}
          style={{ marginTop: 12 }}
        >
          关闭
        </button>
      </div>
    </div>
  );
}
