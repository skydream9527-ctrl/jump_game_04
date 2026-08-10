import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_EQUIPPED_ITEMS, RARITY_COLORS, RARITY_NAMES, getItemById, type ItemDef } from '../../constants/items';
import type { InventoryItem } from '../../types/game';

interface Props {
  inventory: InventoryItem[];
  equippedItems: string[];
  chapter: number;
  level: number;
  onConfirm: (selectedItems: string[]) => void;
  onBack: () => void;
  standalone?: boolean;
}

export function ItemSelect({ inventory, equippedItems, chapter, level, onConfirm, onBack, standalone }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(equippedItems.slice(0, MAX_EQUIPPED_ITEMS));

  const toggleItem = useCallback((itemId: string) => {
    setSelected(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      if (prev.length >= MAX_EQUIPPED_ITEMS) return prev;
      return [...prev, itemId];
    });
  }, []);

  const hexColor = (n: number) => '#' + n.toString(16).padStart(6, '0');

  const inventoryItems = inventory
    .map(inv => ({ ...inv, def: getItemById(inv.itemId) }))
    .filter((i): i is InventoryItem & { def: ItemDef } => !!i.def);

  const categories = [
    { key: 'consumable' as const, labelKey: 'item.cat_consumable' },
    { key: 'equipment' as const, labelKey: 'item.cat_equipment' },
    { key: 'relic' as const, labelKey: 'item.cat_relic' },
    { key: 'charm' as const, labelKey: 'item.cat_charm' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(10,10,18,0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Georgia','Noto Serif SC',serif",
      color: '#e0dcd4', overflow: 'auto', padding: '20px 0',
    }}>
      {/* 标题 */}
      <h2 style={{ color: '#c8aa6e', fontSize: 20, fontWeight: 400, letterSpacing: 4, margin: '0 0 4px' }}>
        {standalone ? t('item.standalone_title') : t('item.select_title')}
      </h2>
      <p style={{ color: '#7a7060', fontSize: 12, margin: '0 0 16px' }}>
        {standalone
          ? t('item.current_equipped', { n: selected.length, max: MAX_EQUIPPED_ITEMS })
          : t('item.select_desc', { chapter, level, max: MAX_EQUIPPED_ITEMS })}
      </p>

      {/* 已选道具槽 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {Array.from({ length: MAX_EQUIPPED_ITEMS }).map((_, i) => {
          const itemId = selected[i];
          const def = itemId ? getItemById(itemId) : null;
          return (
            <div key={i} style={{
              width: 72, height: 80, borderRadius: 8,
              border: def ? `2px solid ${hexColor(RARITY_COLORS[def.rarity])}` : '2px dashed rgba(200,170,110,0.2)',
              background: def ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: def ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
              onClick={() => def && toggleItem(def.id)}
            >
              {def ? (
                <>
                  <span style={{ fontSize: 28 }}>{def.icon}</span>
                  <span style={{ fontSize: 9, color: hexColor(RARITY_COLORS[def.rarity]), marginTop: 2 }}>
                    {t(`data.item.${def.id}.name`, { defaultValue: def.name })}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 10, color: '#5a5a60' }}>{t('item.empty_slot')}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 已选数量提示 */}
      <p style={{ color: selected.length > 0 ? '#6bb8e8' : '#5a5a60', fontSize: 11, margin: '0 0 16px' }}>
        {t('item.selected_count', { n: selected.length, max: MAX_EQUIPPED_ITEMS })}
      </p>

      {/* 储物袋 */}
      {inventoryItems.length === 0 ? (
        <div style={{ color: '#7a7060', fontSize: 13, marginTop: 40 }}>
          {t('item.empty_hint')}
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: 600, padding: '0 20px' }}>
          {categories.map(cat => {
            const items = inventoryItems.filter(i => i.def.category === cat.key);
            if (items.length === 0) return null;
            return (
              <div key={cat.key} style={{ marginBottom: 16 }}>
                <div style={{ color: '#c8aa6e', fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>{t(cat.labelKey)}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {items.map(item => {
                    const def = item.def;
                    const isSelected = selected.includes(def.id);
                    return (
                      <div key={def.id}
                        onClick={() => toggleItem(def.id)}
                        style={{
                          width: 140, padding: '8px 10px', borderRadius: 8,
                          border: isSelected
                            ? `2px solid ${hexColor(RARITY_COLORS[def.rarity])}`
                            : '1px solid rgba(200,170,110,0.1)',
                          background: isSelected
                            ? `${hexColor(RARITY_COLORS[def.rarity])}15`
                            : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: !isSelected && selected.length >= MAX_EQUIPPED_ITEMS ? 0.4 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 20 }}>{def.icon}</span>
                          <div>
                            <div style={{
                              fontSize: 12, fontWeight: 600,
                              color: hexColor(RARITY_COLORS[def.rarity]),
                            }}>{t(`data.item.${def.id}.name`, { defaultValue: def.name })}</div>
                            <div style={{ fontSize: 9, color: '#7a7060' }}>
                              {t(`data.rarity.${def.rarity}`, { defaultValue: RARITY_NAMES[def.rarity] })} · ×{item.quantity}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: '#a09880', marginTop: 4, lineHeight: 1.4 }}>
                          {t(`data.item.${def.id}.description`, { defaultValue: def.description })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 按钮 */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={onBack} style={{
          padding: '8px 24px', borderRadius: 6, border: '1px solid rgba(200,170,110,0.2)',
          background: 'rgba(255,255,255,0.05)', color: '#a09880', fontSize: 12,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>{t('common.back')}</button>
        <button onClick={() => onConfirm(selected)} style={{
          padding: '8px 24px', borderRadius: 6, border: '1px solid rgba(107,184,232,0.4)',
          background: 'rgba(107,184,232,0.15)', color: '#6bb8e8', fontSize: 12,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>{standalone ? t('item.save') : t('item.start')}</button>
      </div>
    </div>
  );
}
