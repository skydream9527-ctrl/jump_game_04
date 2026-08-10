import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SHOP_ITEMS, type ShopItem } from '../../constants/shop';
import { isItemPurchased } from '../../state/SaveManager';
import { CHARACTERS } from '../../constants/characters';

interface ShopProps {
  totalShards: number;
  unlockedCharacters: number[];
  purchasedItems: string[];
  onBack: () => void;
  onPurchase: (item: ShopItem) => void;
}

export function Shop({ totalShards, unlockedCharacters, purchasedItems, onBack, onPurchase }: ShopProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ShopItem['type']>('character');

  const tabs: { type: ShopItem['type']; labelKey: string; icon: string }[] = [
    { type: 'character', labelKey: 'shop.tab_character', icon: '👤' },
    { type: 'weapon', labelKey: 'shop.tab_weapon', icon: '🔫' },
    { type: 'powerup', labelKey: 'shop.tab_powerup', icon: '🛡️' },
    { type: 'consumable', labelKey: 'shop.tab_consumable', icon: '💊' },
  ];

  const filteredItems = SHOP_ITEMS.filter(item => item.type === activeTab);

  const canAfford = (price: number) => totalShards >= price;

  const isOwned = (item: ShopItem): boolean => {
    if (item.type === 'character') {
      // Find character id by matching name
      const char = CHARACTERS.find(c => c.displayName === item.name.replace('char_', ''));
      if (item.id === 'char_ling') return unlockedCharacters.includes(0);
      if (item.id === 'char_zero') return unlockedCharacters.includes(1);
      if (item.id === 'char_echo') return unlockedCharacters.includes(2);
      if (item.id === 'char_gale') return unlockedCharacters.includes(3);
      return !!char && unlockedCharacters.includes(char.id);
    }
    return purchasedItems.includes(item.id) || isItemPurchased(item.id);
  };

  return (
    <div className="screen shop-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>{t('shop.back')}</button>
        <h2>{t('shop.title')}</h2>
        <div className="shard-display">
          <span className="shard-icon">★</span>
          <span>{totalShards}</span>
        </div>
      </div>

      <div className="shop-tabs">
        {tabs.map(tab => (
          <button
            key={tab.type}
            className={`tab-btn ${activeTab === tab.type ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.type)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {filteredItems.map(item => {
          const owned = isOwned(item);
          return (
            <div key={item.id} className={`shop-item-card ${owned ? 'shop-item-owned' : ''}`}>
              <div className="item-icon" style={{ color: `#${item.color.toString(16).padStart(6, '0')}` }}>
                {item.icon}
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-desc">{item.description}</p>
                {item.unlockCondition && (
                  <p className="unlock-condition">{item.unlockCondition}</p>
                )}
              </div>
              <div className="item-price">
                {item.price === 0 ? (
                  <span className="free-badge">{t('shop.free')}</span>
                ) : owned ? (
                  <span className="owned-badge">{t('shop.owned')}</span>
                ) : (
                  <button
                    className={`btn-purchase ${canAfford(item.price) ? '' : 'disabled'}`}
                    onClick={() => canAfford(item.price) && !owned && onPurchase(item)}
                    disabled={!canAfford(item.price) || owned}
                  >
                    <span className="shard-icon">★</span> {item.price}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}