import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PETS, PET_ELEMENT_COLORS, PET_ELEMENT_NAMES, getPetById, type PetDef, type PetInstance } from '../../constants/pets';
import { RARITY_NAMES } from '../../constants/items';

interface Props {
  ownedPets: PetInstance[];
  selectedPet: string | null;
  onSelect: (petId: string | null) => void;
  onBack: () => void;
  standalone?: boolean;
}

export function PetSelect({ ownedPets, selectedPet, onSelect, onBack, standalone }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(selectedPet);
  const [showUnowned, setShowUnowned] = useState(false);

  const hexColor = (n: number) => '#' + n.toString(16).padStart(6, '0');

  const ownedPetDefs = ownedPets
    .map(p => ({ instance: p, def: getPetById(p.petId) }))
    .filter((p): p is { instance: PetInstance; def: PetDef } => !!p.def);

  const unownedPets = PETS.filter(p => !ownedPets.some(op => op.petId === p.id));

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(10,10,18,0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Georgia','Noto Serif SC',serif",
      color: '#e0dcd4', overflow: 'auto', padding: '20px 0',
    }}>
      <h2 style={{ color: '#c8aa6e', fontSize: 20, fontWeight: 400, letterSpacing: 4, margin: '0 0 4px' }}>
        {standalone ? t('pet.standalone_title') : t('pet.select_title')}
      </h2>
      <p style={{ color: '#7a7060', fontSize: 12, margin: '0 0 20px' }}>
        {standalone ? t('pet.standalone_desc') : t('pet.select_desc')}
      </p>

      {/* 已拥有宠物 */}
      {ownedPetDefs.length > 0 && (
        <div style={{ width: '100%', maxWidth: 700, padding: '0 20px', marginBottom: 24 }}>
          <div style={{ color: '#c8aa6e', fontSize: 13, marginBottom: 10, letterSpacing: 2 }}>{t('pet.my_pets')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ownedPetDefs.map(({ instance, def }) => {
              const isSelected = selected === def.id;
              return (
                <div key={def.id}
                  onClick={() => setSelected(isSelected ? null : def.id)}
                  style={{
                    width: 160, padding: '10px 12px', borderRadius: 10,
                    border: isSelected
                      ? `2px solid ${hexColor(PET_ELEMENT_COLORS[def.element])}`
                      : '1px solid rgba(200,170,110,0.12)',
                    background: isSelected
                      ? `${hexColor(PET_ELEMENT_COLORS[def.element])}15`
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 32 }}>{def.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: hexColor(PET_ELEMENT_COLORS[def.element]) }}>
                        {t(`data.pet.${def.id}.name`, { defaultValue: def.name })}
                      </div>
                      <div style={{ fontSize: 9, color: '#7a7060' }}>
                        {t(`data.pet_element.${def.element}`, { defaultValue: PET_ELEMENT_NAMES[def.element] })}系 · Lv.{instance.level}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#a09880', marginTop: 6, lineHeight: 1.5 }}>
                    {t('pet.passive_label')}{t(`data.pet.${def.id}.passive_desc`, { defaultValue: def.passive.description })}
                  </div>
                  <div style={{ fontSize: 10, color: '#6bb8e8', marginTop: 2 }}>
                    R: {t(`data.pet.${def.id}.active_name`, { defaultValue: def.active.name })}
                  </div>
                  <div style={{ fontSize: 10, color: '#e8a06b', marginTop: 1 }}>
                    T: {t(`data.pet.${def.id}.active2_name`, { defaultValue: def.active2.name })}
                  </div>
                  <div style={{ fontSize: 10, color: '#d46bff', marginTop: 1 }}>
                    Y: {t(`data.pet.${def.id}.ultimate_name`, { defaultValue: def.ultimate.name })}
                  </div>
                  {/* EXP bar */}
                  <div style={{ marginTop: 6, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${(instance.exp / (def.evolution ? 100 : 50)) * 100}%`,
                      background: hexColor(PET_ELEMENT_COLORS[def.element]),
                    }} />
                  </div>
                  <div style={{ fontSize: 8, color: '#5a5a60', marginTop: 2 }}>
                    {t('pet.exp_label')} {instance.exp} · {t('pet.friendship_label')} {instance.friendship}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 未拥有宠物 */}
      {unownedPets.length > 0 && (
        <div style={{ width: '100%', maxWidth: 700, padding: '0 20px' }}>
          <div
            onClick={() => setShowUnowned(v => !v)}
            style={{
              color: '#7a7060', fontSize: 13, marginBottom: showUnowned ? 10 : 0,
              letterSpacing: 2, cursor: 'pointer', userSelect: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              display: 'inline-block', transition: 'transform 0.2s',
              transform: showUnowned ? 'rotate(90deg)' : 'rotate(0deg)',
              fontSize: 10,
            }}>▶</span>
            {t('pet.unowned')} ({unownedPets.length})
          </div>
          {showUnowned && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxHeight: 400, overflow: 'auto' }}>
              {unownedPets.map(def => (
                <div key={def.id} style={{
                  width: 160, padding: '10px 12px', borderRadius: 10,
                  border: '1px solid rgba(200,170,110,0.06)',
                  background: 'rgba(255,255,255,0.01)',
                  opacity: 0.5,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 32, filter: 'grayscale(1)' }}>❓</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#5a5a60' }}>???</div>
                      <div style={{ fontSize: 9, color: '#4a4a50' }}>
                        {t(`data.pet_element.${def.element}`, { defaultValue: PET_ELEMENT_NAMES[def.element] })}系 · {t(`data.rarity.${def.rarity}`, { defaultValue: RARITY_NAMES[def.rarity] })}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#4a4a50', marginTop: 6 }}>
                    {t('pet.obtain_hint')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 按钮 */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={{
          padding: '8px 24px', borderRadius: 6, border: '1px solid rgba(200,170,110,0.2)',
          background: 'rgba(255,255,255,0.05)', color: '#a09880', fontSize: 12,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>{t('common.back')}</button>
        <button onClick={() => onSelect(selected)} style={{
          padding: '8px 24px', borderRadius: 6,
          border: selected ? '1px solid rgba(107,184,232,0.4)' : '1px solid rgba(200,170,110,0.15)',
          background: selected ? 'rgba(107,184,232,0.15)' : 'rgba(255,255,255,0.03)',
          color: selected ? '#6bb8e8' : '#5a5a60', fontSize: 12,
          cursor: selected ? 'pointer' : 'default', fontFamily: 'inherit',
        }}>{standalone ? t('pet.save') : selected ? t('pet.confirm') : t('pet.no_pet')}</button>
      </div>
    </div>
  );
}
