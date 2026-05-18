import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig } from './config';
import { EventBus } from './EventBus';
import { EVENTS } from '../types/events';

interface PhaserGameProps {
  onGameReady?: () => void;
}

export function PhaserGame({ onGameReady }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = createPhaserConfig(containerRef.current.id);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleReady = () => onGameReady?.();
    EventBus.on(EVENTS.GAME_READY, handleReady);

    return () => {
      EventBus.off(EVENTS.GAME_READY, handleReady);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onGameReady]);

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default PhaserGame;
