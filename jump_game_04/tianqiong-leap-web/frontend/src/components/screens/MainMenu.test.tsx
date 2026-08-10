import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { type ReactElement } from 'react';
import i18n from '../../i18n';
import { MainMenu } from './MainMenu';
import type { SyncStatus } from '../../hooks/useSaveData';

interface MainMenuProps {
  totalShards: number;
  testMode: boolean;
  playerName: string;
  syncStatus: SyncStatus;
  onStartGame: () => void;
  onCharacterSelect: () => void;
  onShop: () => void;
  onLeaderboard: () => void;
  onCloudSync: () => void;
  onInventory: () => void;
  onPet: () => void;
  onAchievements: () => void;
  onToggleTestMode: () => void;
}

function renderWithI18n(ui: ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

beforeAll(async () => {
  await i18n.changeLanguage('zh');
});

describe('MainMenu', () => {
  let mockProps: MainMenuProps;

  beforeEach(() => {
    mockProps = {
      totalShards: 42,
      testMode: false,
      playerName: '测试玩家',
      syncStatus: 'idle',
      onStartGame: vi.fn(),
      onCharacterSelect: vi.fn(),
      onShop: vi.fn(),
      onLeaderboard: vi.fn(),
      onCloudSync: vi.fn(),
      onInventory: vi.fn(),
      onPet: vi.fn(),
      onAchievements: vi.fn(),
      onToggleTestMode: vi.fn(),
    };
  });

  it('渲染游戏标题', () => {
    renderWithI18n(<MainMenu {...mockProps} />);
    expect(screen.getByText('天穹跃迁')).toBeInTheDocument();
  });

  it('显示星核碎片数量', () => {
    renderWithI18n(<MainMenu {...mockProps} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('渲染主要菜单按钮', () => {
    renderWithI18n(<MainMenu {...mockProps} />);
    expect(screen.getByText('开始游戏')).toBeInTheDocument();
    expect(screen.getByText('角色选择')).toBeInTheDocument();
    expect(screen.getByText('商店')).toBeInTheDocument();
    expect(screen.getByText('排行榜')).toBeInTheDocument();
  });

  it('点击开始游戏按钮调用 onStartGame', async () => {
    const user = userEvent.setup();
    renderWithI18n(<MainMenu {...mockProps} />);
    await user.click(screen.getByText('开始游戏'));
    expect(mockProps.onStartGame).toHaveBeenCalledTimes(1);
  });

  it('点击角色选择按钮调用 onCharacterSelect', async () => {
    const user = userEvent.setup();
    renderWithI18n(<MainMenu {...mockProps} />);
    await user.click(screen.getByText('角色选择'));
    expect(mockProps.onCharacterSelect).toHaveBeenCalledTimes(1);
  });
});
