import { useState } from 'react';
import { SHOP_ITEMS, type ShopItem } from '../../constants/shop';

interface ShopProps {
  totalShards: number;
  onBack: () => void;
  onPurchase: (item: ShopItem) => void;
}

export function Shop({ totalShards, onBack, onPurchase }: ShopProps) {
  const [activeTab, setActiveTab] = useState<ShopItem['type']>('character');

  const tabs: { type: ShopItem['type']; label: string }[] = [
    { type: 'character', label: '角色' },
    { type: 'weapon', label: '武器' },
    { type: 'powerup', label: '道具' },
    { type: 'consumable', label: '消耗品' },
  ];

  const filteredItems = SHOP_ITEMS.filter(item => item.type === activeTab);

  const canAfford = (price: number) => totalShards >= price;

  return (
    <div className="screen shop-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h2>商店</h2>
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
            {tab.label}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="shop-item-card">
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
                <span className="free-badge">免费</span>
              ) : (
                <button
                  className={`btn btn-purchase ${canAfford(item.price) ? '' : 'disabled'}`}
                  onClick={() => canAfford(item.price) && onPurchase(item)}
                  disabled={!canAfford(item.price)}
                >
                  <span className="shard-icon">★</span> {item.price}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}