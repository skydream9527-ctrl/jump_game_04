import { useEffect } from 'react';
import type { Achievement } from '../../constants/achievements';

interface Props {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="achievement-toast" onClick={onDismiss}>
      <div className="achievement-toast-icon">{achievement.icon}</div>
      <div className="achievement-toast-content">
        <div className="achievement-toast-title">成就解锁！</div>
        <div className="achievement-toast-name">{achievement.name}</div>
        <div className="achievement-toast-desc">{achievement.description}</div>
      </div>
    </div>
  );
}
