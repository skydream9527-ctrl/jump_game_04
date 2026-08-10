import Phaser from 'phaser';
import { PETS } from '../../constants/pets';

// ==================== Pet Textures (200x200 full-body designs) ====================
export function generatePetTextures(scene: Phaser.Scene): void {
  for (const pet of PETS) {
    const S = 200;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    const drawer = PET_DRAWERS[pet.id];
    if (drawer) {
      drawer(g, pet);
    } else {
      g.fillStyle(pet.bodyColor, 1);
      g.fillCircle(100, 110, 40);
      drawEyes(g, 100, 95, pet.eyeColor);
    }

    g.generateTexture(`pet-${pet.id}`, S, S);
    g.destroy();
  }
}

// ── Shared helpers ──
function drawEyes(g: Phaser.GameObjects.Graphics, cx: number, cy: number, eyeColor: number, size = 9): void {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 18, cy, size + 2);
  g.fillCircle(cx + 18, cy, size + 2);
  g.fillStyle(eyeColor, 1);
  g.fillCircle(cx - 16, cy + 2, size - 2);
  g.fillCircle(cx + 20, cy + 2, size - 2);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 14, cy - 2, 3);
  g.fillCircle(cx + 22, cy - 2, 3);
}

function drawSmallEyes(g: Phaser.GameObjects.Graphics, cx: number, cy: number, eyeColor: number): void {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 14, cy, 7);
  g.fillCircle(cx + 14, cy, 7);
  g.fillStyle(eyeColor, 1);
  g.fillCircle(cx - 12, cy + 2, 4.5);
  g.fillCircle(cx + 16, cy + 2, 4.5);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - 10, cy - 1, 2);
  g.fillCircle(cx + 18, cy - 1, 2);
}

function drawMouth(g: Phaser.GameObjects.Graphics, cx: number, y: number): void {
  g.lineStyle(2, 0x1a1a2e, 0.8);
  g.beginPath();
  g.moveTo(cx - 7, y);
  g.lineTo(cx + 7, y);
  g.stroke();
}

function drawBlush(g: Phaser.GameObjects.Graphics, cx: number, y: number): void {
  g.fillStyle(0xff8a80, 0.3);
  g.fillCircle(cx - 28, y, 8);
  g.fillCircle(cx + 28, y, 8);
}

// ── Per-pet drawing functions ──
type PetDrawer = (g: Phaser.GameObjects.Graphics, pet: typeof PETS[number]) => void;

const PET_DRAWERS: Record<string, PetDrawer> = {

  // ═══════════════════════════════════════════
  //  一般系 (6只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_slime': (g, pet) => {
    // 半透明果冻体 + 水滴
    g.fillStyle(pet.bodyColor, 0.85);
    g.fillEllipse(100, 130, 80, 70);
    g.fillStyle(0xffffff, 0.15);
    g.fillEllipse(85, 115, 20, 14);
    g.fillStyle(pet.bodyColor, 0.5);
    g.fillEllipse(130, 165, 14, 20);
    drawSmallEyes(g, 100, 118, pet.eyeColor);
    drawMouth(g, 100, 135);
  },

  'pet_bunny': (g, pet) => {
    // 长耳 + 圆身 + 短尾
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(80, 8, 16, 56, 8);      // 左耳
    g.fillRoundedRect(104, 8, 16, 56, 8);     // 右耳
    g.fillStyle(0xf8bbd0, 0.5);
    g.fillRoundedRect(84, 18, 8, 38, 4);
    g.fillRoundedRect(108, 18, 8, 38, 4);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 80, 26);                // 头
    g.fillEllipse(100, 130, 44, 40);          // 身体
    g.fillEllipse(100, 170, 30, 12);          // 臀部
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(78, 158, 16, 24, 8);    // 左脚
    g.fillRoundedRect(106, 158, 16, 24, 8);   // 右脚
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(115, 164, 6);                // 短尾
    drawEyes(g, 100, 74, pet.eyeColor, 6);
    g.fillStyle(0xe91e63, 0.8);
    g.fillCircle(100, 84, 3);
    drawBlush(g, 100, 82);
  },

  'pet_rock': (g, pet) => {
    // 岩石巨人：粗壮四肢
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 62, 28);                // 头
    g.fillEllipse(100, 120, 54, 46);          // 躯干
    g.fillRoundedRect(58, 100, 20, 48, 6);    // 左臂
    g.fillRoundedRect(122, 100, 20, 48, 6);   // 右臂
    g.fillRoundedRect(72, 154, 22, 34, 8);    // 左腿
    g.fillRoundedRect(106, 154, 22, 34, 8);   // 右腿
    g.lineStyle(2, 0x5d4037, 0.4);
    g.beginPath(); g.moveTo(90, 50); g.lineTo(96, 66); g.stroke();
    g.beginPath(); g.moveTo(108, 46); g.lineTo(112, 62); g.stroke();
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(86, 36, 10);
    g.fillCircle(114, 34, 8);
    drawSmallEyes(g, 100, 56, pet.eyeColor);
    g.lineStyle(3, 0x3e2723, 0.5);
    g.beginPath(); g.moveTo(88, 72); g.lineTo(112, 72); g.stroke();
  },

  'pet_fox': (g, pet) => {
    // 狐狸：尖耳 + 蓬松大尾
    g.fillStyle(pet.bodyColor, 0.8);
    g.fillCircle(148, 108, 22);               // 尾巴
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(155, 112, 12);
    g.fillStyle(pet.bodyColor, 1);
    g.fillTriangle(72, 56, 56, 14, 88, 42);   // 左耳
    g.fillTriangle(128, 56, 144, 14, 112, 42);// 右耳
    g.fillStyle(0x1a1a2e, 0.2);
    g.fillTriangle(74, 54, 62, 24, 84, 44);
    g.fillTriangle(126, 54, 138, 24, 116, 44);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 68, 26);                // 头
    g.fillEllipse(100, 122, 40, 38);          // 身体
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(100, 74, 12);                // 口鼻白色
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(80, 150, 14, 28, 6);    // 左脚
    g.fillRoundedRect(106, 150, 14, 28, 6);   // 右脚
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 68, 5);                 // 鼻子
    drawEyes(g, 100, 60, pet.eyeColor, 6);
  },

  'pet_eevee': (g, pet) => {
    // 伊布：领毛 + 大尾巴
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(100, 80, 32);                // 领毛
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 68, 26);                // 头
    g.fillTriangle(74, 52, 60, 16, 86, 40);   // 左耳
    g.fillTriangle(126, 52, 140, 16, 114, 40);// 右耳
    g.fillStyle(0x1a1a2e, 0.2);
    g.fillTriangle(76, 50, 66, 26, 84, 42);
    g.fillTriangle(124, 50, 134, 26, 116, 42);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 124, 42, 40);          // 身体
    g.fillCircle(144, 104, 18);               // 蓬松尾巴
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(150, 100, 10);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(80, 152, 14, 26, 6);    // 左脚
    g.fillRoundedRect(106, 152, 14, 26, 6);   // 右脚
    drawEyes(g, 100, 62, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 72, 4);
    drawBlush(g, 100, 76);
  },

  'pet_snorlax': (g, pet) => {
    // 卡比兽：巨大圆肚 + 小肢
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 60, 32);                // 头
    g.fillEllipse(100, 120, 70, 60);          // 巨肚
    g.fillStyle(0xcfd8dc, 0.4);
    g.fillEllipse(100, 128, 46, 38);          // 肚皮
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(48, 118, 14);                // 左臂
    g.fillCircle(152, 118, 14);               // 右臂
    g.fillEllipse(80, 176, 26, 14);           // 左脚
    g.fillEllipse(120, 176, 26, 14);          // 右脚
    g.lineStyle(3, 0x1a1a2e, 0.6);
    g.beginPath(); g.moveTo(84, 50); g.lineTo(94, 54); g.stroke();
    g.beginPath(); g.moveTo(106, 54); g.lineTo(116, 50); g.stroke();
    g.lineStyle(2.5, 0x1a1a2e, 0.5);
    g.beginPath(); g.moveTo(88, 72); g.lineTo(100, 78); g.lineTo(112, 72); g.stroke();
  },

  // ═══════════════════════════════════════════
  //  火系 (7只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_candle': (g, pet) => {
    // 蜡烛精灵：蜡身 + 头顶火焰
    g.fillStyle(0xfff9c4, 1);
    g.fillRoundedRect(78, 80, 44, 80, 8);     // 蜡身
    g.fillStyle(0xfff9c4, 0.7);
    g.fillCircle(82, 80, 8);
    g.fillCircle(118, 84, 6);
    g.lineStyle(2.5, 0x5d4037, 1);
    g.beginPath(); g.moveTo(100, 80); g.lineTo(100, 58); g.stroke();
    g.fillStyle(0xff9800, 0.9);
    g.fillCircle(100, 44, 18);
    g.fillTriangle(88, 44, 100, 16, 112, 44);
    g.fillStyle(0xffeb3b, 0.9);
    g.fillCircle(100, 46, 10);
    g.fillTriangle(93, 46, 100, 26, 107, 46);
    g.fillStyle(pet.bodyColor, 0.6);
    g.fillRoundedRect(68, 110, 12, 30, 4);    // 左臂
    g.fillRoundedRect(120, 110, 12, 30, 4);   // 右臂
    g.fillRoundedRect(82, 158, 14, 26, 6);    // 左脚
    g.fillRoundedRect(104, 158, 14, 26, 6);   // 右脚
    drawSmallEyes(g, 100, 108, pet.eyeColor);
    drawMouth(g, 100, 122);
  },

  'pet_firedrake': (g, pet) => {
    // 火蜥蜴：蜥蜴形态 + 火焰尾
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(56, 64, 22);                 // 头
    g.fillEllipse(100, 110, 60, 34);          // 身体
    g.fillRoundedRect(70, 140, 10, 28, 4);    // 左前脚
    g.fillRoundedRect(90, 142, 10, 28, 4);    // 右前脚
    g.fillRoundedRect(100, 142, 10, 28, 4);   // 左后脚
    g.fillRoundedRect(120, 140, 10, 28, 4);   // 右后脚
    g.fillStyle(0xff5722, 0.9);
    g.fillTriangle(140, 104, 172, 90, 150, 118);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillTriangle(144, 106, 168, 94, 150, 114);
    g.fillStyle(0xff8a65, 0.8);
    g.fillTriangle(86, 88, 92, 68, 98, 88);
    g.fillTriangle(102, 88, 108, 68, 114, 88);
    drawSmallEyes(g, 50, 58, pet.eyeColor);
    g.fillStyle(0xff5722, 0.6);
    g.fillCircle(38, 68, 4);
  },

  'pet_charmander': (g, pet) => {
    // 小火龙：经典造型
    g.fillStyle(0xff5722, 0.9);
    g.fillCircle(154, 100, 16);
    g.fillTriangle(144, 96, 168, 76, 158, 110);
    g.fillStyle(0xffeb3b, 0.8);
    g.fillCircle(154, 98, 8);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(72, 56, 24);                 // 头
    g.fillEllipse(100, 112, 40, 42);          // 身体
    g.fillStyle(0xffcc80, 0.4);
    g.fillEllipse(100, 120, 22, 26);          // 肚皮
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(56, 96, 10, 28, 4);     // 左臂
    g.fillRoundedRect(72, 142, 14, 26, 6);    // 左脚
    g.fillRoundedRect(108, 142, 14, 26, 6);   // 右脚
    g.fillStyle(0xff5722, 0.7);
    g.fillTriangle(66, 36, 72, 16, 78, 36);   // 头冠
    drawEyes(g, 68, 50, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(60, 62, 3);
  },

  'pet_charmeleon': (g, pet) => {
    // 火恐龙：更凶猛
    g.fillStyle(0xff3d00, 0.9);
    g.fillCircle(158, 86, 18);
    g.fillTriangle(146, 82, 172, 64, 162, 98);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillCircle(158, 84, 9);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(62, 54, 24);                 // 头
    g.fillEllipse(100, 108, 46, 44);          // 身体
    g.fillStyle(0xffab91, 0.35);
    g.fillEllipse(100, 116, 26, 28);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(48, 92, 10, 28, 4);     // 左臂
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(44, 120, 48, 114, 52, 120);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(74, 146, 14, 26, 6);    // 左脚
    g.fillRoundedRect(108, 146, 14, 26, 6);   // 右脚
    g.fillStyle(0xff3d00, 0.8);
    g.fillTriangle(56, 34, 64, 10, 72, 32);
    drawEyes(g, 58, 48, pet.eyeColor, 6);
    g.lineStyle(2.5, 0x1a1a2e, 0.7);
    g.beginPath(); g.moveTo(46, 42); g.lineTo(56, 46); g.stroke();
    g.beginPath(); g.moveTo(72, 46); g.lineTo(66, 42); g.stroke();
  },

  'pet_charizard': (g, pet) => {
    // 喷火龙：翅膀 + 龙角
    g.fillStyle(0x1565c0, 0.5);
    g.fillTriangle(98, 64, 160, 24, 138, 96);  // 右翼
    g.fillStyle(0x1565c0, 0.5);
    g.fillTriangle(40, 68, 10, 28, 30, 98);    // 左翼(简化)
    g.fillStyle(0xff5722, 0.9);
    g.fillCircle(160, 100, 14);
    g.fillStyle(0xffeb3b, 0.7);
    g.fillCircle(160, 98, 7);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(64, 52, 24);                 // 头
    g.fillEllipse(96, 110, 48, 46);           // 身体
    g.fillStyle(0xffcc80, 0.4);
    g.fillEllipse(96, 120, 28, 28);
    g.fillStyle(0xffcc80, 0.9);
    g.fillTriangle(56, 32, 50, 14, 62, 30);   // 左角
    g.fillTriangle(72, 30, 78, 12, 76, 30);   // 右角
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(46, 94, 10, 28, 4);
    g.fillRoundedRect(74, 148, 14, 26, 6);
    g.fillRoundedRect(106, 148, 14, 26, 6);
    drawEyes(g, 60, 46, pet.eyeColor, 6);
    g.fillStyle(0xff5722, 0.5);
    g.fillEllipse(48, 60, 14, 8);
  },

  'pet_flareon': (g, pet) => {
    // 火伊布：蓬松火焰鬃毛
    g.fillStyle(0xff5722, 0.5);
    g.fillCircle(100, 68, 38);                // 鬃毛
    g.fillCircle(72, 78, 18);
    g.fillCircle(128, 78, 18);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 68, 26);                // 头
    g.fillTriangle(76, 52, 62, 18, 88, 42);   // 左耳
    g.fillTriangle(124, 52, 138, 18, 112, 42);// 右耳
    g.fillEllipse(100, 124, 42, 40);          // 身体
    g.fillStyle(0xff5722, 0.8);
    g.fillCircle(148, 108, 16);               // 火焰尾
    g.fillStyle(0xffeb3b, 0.5);
    g.fillCircle(152, 104, 8);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(80, 154, 14, 26, 6);
    g.fillRoundedRect(106, 154, 14, 26, 6);
    drawEyes(g, 100, 62, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 74, 4);
  },

  'pet_moltres': (g, pet) => {
    // 火焰鸟：展翅凤凰
    g.fillStyle(0xff6d00, 0.6);
    g.fillTriangle(96, 68, 24, 28, 60, 100);  // 左翼
    g.fillTriangle(104, 68, 176, 28, 140, 100);// 右翼
    g.fillStyle(0xffab40, 0.4);
    g.fillTriangle(96, 70, 34, 36, 62, 96);
    g.fillTriangle(104, 70, 166, 36, 138, 96);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 104, 28, 48);          // 身体
    g.fillCircle(100, 56, 20);                // 头
    g.fillStyle(0xff5722, 0.9);
    g.fillTriangle(92, 40, 100, 14, 108, 40); // 头冠火焰
    g.fillStyle(0xffeb3b, 0.6);
    g.fillTriangle(94, 38, 100, 22, 106, 38);
    g.fillStyle(0xff6d00, 0.8);
    g.fillTriangle(92, 140, 100, 180, 108, 140);
    g.fillStyle(0xffab40, 0.6);
    g.fillTriangle(94, 142, 100, 172, 106, 142);
    drawSmallEyes(g, 100, 52, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //  水系 (7只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_bubble': (g, pet) => {
    // 泡泡鱼：透明身体 + 鳍
    g.fillStyle(0x90caf9, 0.25);
    g.fillCircle(150, 50, 10);
    g.fillCircle(164, 72, 7);
    g.fillCircle(42, 54, 9);
    g.fillStyle(pet.bodyColor, 0.65);
    g.fillEllipse(100, 104, 60, 56);
    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(82, 90, 18, 14);
    g.fillStyle(pet.bodyColor, 0.7);
    g.fillTriangle(42, 94, 22, 76, 30, 110);  // 左鳍
    g.fillTriangle(158, 94, 178, 76, 170, 110);// 右鳍
    g.fillTriangle(90, 50, 100, 28, 110, 50); // 背鳍
    g.fillTriangle(140, 100, 170, 82, 170, 118);// 尾鳍
    drawEyes(g, 100, 94, pet.eyeColor, 8);
    g.fillStyle(0x64b5f6, 0.5);
    g.fillCircle(100, 116, 6);
  },

  'pet_crab': (g, pet) => {
    // 螃蟹：大钳 + 腿
    g.fillStyle(0xe53935, 1);
    g.fillCircle(34, 92, 20);                 // 左钳
    g.fillCircle(166, 92, 20);                // 右钳
    g.fillStyle(0xef5350, 1);
    g.fillEllipse(18, 88, 22, 10);
    g.fillEllipse(182, 88, 22, 10);
    g.fillStyle(0xe53935, 1);
    g.fillEllipse(100, 112, 64, 44);          // 身体
    g.fillStyle(0xc62828, 0.35);
    g.fillEllipse(100, 108, 36, 24);
    g.fillStyle(0xef5350, 1);
    g.fillRoundedRect(58, 142, 8, 24, 3);     // 腿
    g.fillRoundedRect(74, 146, 8, 24, 3);
    g.fillRoundedRect(118, 146, 8, 24, 3);
    g.fillRoundedRect(134, 142, 8, 24, 3);
    g.lineStyle(4, 0xe53935, 1);
    g.beginPath(); g.moveTo(80, 88); g.lineTo(72, 62); g.stroke();
    g.beginPath(); g.moveTo(120, 88); g.lineTo(128, 62); g.stroke();
    drawSmallEyes(g, 72, 58, pet.eyeColor);
    drawSmallEyes(g, 128, 58, pet.eyeColor);
  },

  'pet_squirtle': (g, pet) => {
    // 杰尼龟：龟壳 + 短尾
    g.fillStyle(0x795548, 0.8);
    g.fillEllipse(100, 108, 56, 44);          // 壳
    g.fillStyle(0x4caf50, 0.25);
    g.fillEllipse(100, 106, 40, 30);
    g.lineStyle(2, 0x5d4037, 0.4);
    g.beginPath(); g.moveTo(100, 78); g.lineTo(100, 138); g.stroke();
    g.beginPath(); g.moveTo(72, 108); g.lineTo(128, 108); g.stroke();
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 58, 26);                // 头
    g.fillTriangle(92, 138, 82, 162, 108, 138);// 尾
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(56, 100, 14, 22, 6);    // 左臂
    g.fillRoundedRect(130, 100, 14, 22, 6);   // 右臂
    g.fillRoundedRect(72, 148, 18, 18, 8);    // 左脚
    g.fillRoundedRect(110, 148, 18, 18, 8);   // 右脚
    g.fillStyle(0xffcc80, 0.35);
    g.fillEllipse(100, 122, 22, 18);
    drawEyes(g, 100, 52, pet.eyeColor, 6);
    drawMouth(g, 100, 66);
  },

  'pet_wartortle': (g, pet) => {
    // 卡咪龟：蓬松尾巴
    g.fillStyle(0x795548, 0.8);
    g.fillEllipse(100, 106, 58, 46);
    g.fillStyle(0x2196f3, 0.2);
    g.fillEllipse(100, 104, 42, 32);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 56, 26);                // 头
    g.fillTriangle(76, 46, 60, 16, 86, 40);   // 左耳
    g.fillTriangle(124, 46, 140, 16, 114, 40);// 右耳
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(100, 164, 16);               // 蓬松尾
    g.fillStyle(0x90caf9, 0.5);
    g.fillCircle(100, 160, 8);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(54, 98, 14, 24, 6);
    g.fillRoundedRect(132, 98, 14, 24, 6);
    g.fillRoundedRect(72, 148, 18, 18, 8);
    g.fillRoundedRect(110, 148, 18, 18, 8);
    drawEyes(g, 100, 50, pet.eyeColor, 6);
    drawMouth(g, 100, 64);
  },

  'pet_blastoise': (g, pet) => {
    // 水箭龟：背炮
    g.fillStyle(0x78909c, 1);
    g.fillRoundedRect(42, 56, 18, 36, 5);     // 左炮
    g.fillRoundedRect(140, 56, 18, 36, 5);    // 右炮
    g.fillStyle(0x42a5f5, 0.7);
    g.fillCircle(51, 56, 7);
    g.fillCircle(149, 56, 7);
    g.fillStyle(0x795548, 0.8);
    g.fillEllipse(100, 108, 62, 48);
    g.fillStyle(0x1565c0, 0.2);
    g.fillEllipse(100, 106, 46, 34);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 54, 24);
    g.fillRoundedRect(50, 96, 16, 28, 6);
    g.fillRoundedRect(134, 96, 16, 28, 6);
    g.fillRoundedRect(70, 150, 22, 20, 8);
    g.fillRoundedRect(108, 150, 22, 20, 8);
    drawEyes(g, 100, 48, pet.eyeColor, 6);
    g.lineStyle(2.5, 0x1a1a2e, 0.7);
    g.beginPath(); g.moveTo(88, 60); g.lineTo(112, 60); g.stroke();
  },

  'pet_vaporeon': (g, pet) => {
    // 水伊布：鱼尾
    g.fillStyle(0x00bcd4, 0.7);
    g.fillTriangle(148, 108, 178, 86, 178, 128);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(68, 60, 22);                 // 头
    g.fillTriangle(52, 46, 36, 16, 62, 40);   // 左耳
    g.fillTriangle(84, 42, 92, 12, 86, 40);   // 右耳
    g.fillStyle(0x80deea, 0.5);
    g.fillTriangle(58, 62, 68, 48, 78, 62);   // 领鳍
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 118, 42, 40);          // 身体
    g.fillRoundedRect(80, 150, 14, 26, 6);
    g.fillRoundedRect(106, 150, 14, 26, 6);
    g.fillStyle(0xb2ebf2, 0.35);
    g.fillEllipse(100, 126, 22, 18);
    drawEyes(g, 64, 54, pet.eyeColor, 6);
    drawMouth(g, 66, 68);
  },

  'pet_articuno': (g, pet) => {
    // 急冻鸟：冰晶翅膀
    g.fillStyle(0x4fc3f7, 0.45);
    g.fillTriangle(96, 68, 16, 30, 58, 100);
    g.fillTriangle(104, 68, 184, 30, 142, 100);
    g.fillStyle(0xb3e5fc, 0.3);
    g.fillTriangle(96, 70, 26, 38, 60, 96);
    g.fillTriangle(104, 70, 174, 38, 140, 96);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 104, 26, 46);          // 身体
    g.fillCircle(100, 56, 18);                // 头
    g.fillStyle(0x81d4fa, 0.7);
    g.fillTriangle(94, 40, 100, 18, 106, 40); // 冠
    g.fillStyle(0x4fc3f7, 0.6);
    g.fillTriangle(90, 138, 100, 178, 110, 138);
    g.fillTriangle(84, 134, 94, 174, 104, 134);
    drawSmallEyes(g, 100, 52, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //  草系 (6只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_seed': (g, pet) => {
    // 种子精灵：头顶嫩芽
    g.fillStyle(0x4caf50, 0.9);
    g.fillRoundedRect(96, 22, 8, 32, 4);      // 茎
    g.fillEllipse(84, 22, 20, 10);            // 左叶
    g.fillEllipse(116, 22, 20, 10);           // 右叶
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 92, 40);                // 种子体
    g.fillStyle(0x66bb6a, 0.3);
    g.beginPath(); g.moveTo(100, 58); g.lineTo(78, 92); g.lineTo(100, 126); g.lineTo(122, 92); g.closePath(); g.fill();
    g.fillStyle(0x795548, 0.6);
    g.fillRoundedRect(82, 128, 12, 24, 5);    // 左根
    g.fillRoundedRect(106, 128, 12, 24, 5);   // 右根
    drawSmallEyes(g, 100, 84, pet.eyeColor);
    drawMouth(g, 100, 100);
  },

  'pet_mushroom': (g, pet) => {
    // 蘑菇：大帽子 + 短腿
    g.fillStyle(0xe53935, 0.9);
    g.fillCircle(100, 62, 48);
    g.fillRect(52, 62, 96, 16);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(80, 42, 12);
    g.fillCircle(116, 48, 10);
    g.fillCircle(96, 30, 8);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(76, 78, 48, 60, 16);    // 菌柄
    g.lineStyle(1.5, 0xd7ccc8, 0.35);
    for (let i = 0; i < 7; i++) {
      g.beginPath(); g.moveTo(78 + i * 7, 78); g.lineTo(78 + i * 7, 90); g.stroke();
    }
    g.fillRoundedRect(78, 134, 18, 28, 8);    // 左脚
    g.fillRoundedRect(104, 134, 18, 28, 8);   // 右脚
    drawSmallEyes(g, 100, 104, pet.eyeColor);
    drawMouth(g, 100, 118);
  },

  'pet_bulbasaur': (g, pet) => {
    // 妙蛙种子：背上的种子苞
    g.fillStyle(0x4caf50, 0.8);
    g.fillCircle(102, 54, 30);                // 种子苞
    g.fillStyle(0x2e7d32, 0.35);
    g.fillCircle(102, 48, 16);
    g.fillStyle(0x81c784, 0.45);
    g.fillCircle(92, 42, 6);
    g.fillCircle(114, 46, 5);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 116, 60, 44);          // 身体
    g.fillCircle(64, 78, 24);                 // 头
    g.fillTriangle(50, 66, 38, 40, 58, 60);   // 左耳
    g.fillTriangle(78, 62, 82, 36, 76, 60);   // 右耳
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(68, 148, 22, 22, 8);    // 左脚
    g.fillRoundedRect(110, 148, 22, 22, 8);   // 右脚
    g.fillStyle(0x2e7d32, 0.3);
    g.fillCircle(90, 112, 7);
    g.fillCircle(114, 118, 5);
    drawEyes(g, 60, 72, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(48, 84, 3);
  },

  'pet_ivysaur': (g, pet) => {
    // 妙蛙草：花苞
    g.fillStyle(0xe91e63, 0.65);
    g.fillCircle(102, 40, 24);                // 花苞
    g.fillStyle(0x4caf50, 0.8);
    g.fillCircle(102, 34, 14);
    g.lineStyle(3, 0x4caf50, 0.7);
    g.beginPath(); g.moveTo(102, 62); g.lineTo(110, 50); g.lineTo(102, 40); g.stroke();
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 114, 64, 48);
    g.fillCircle(60, 76, 24);
    g.fillTriangle(46, 64, 32, 38, 54, 58);
    g.fillTriangle(74, 60, 78, 34, 72, 58);
    g.fillRoundedRect(66, 150, 24, 24, 8);
    g.fillRoundedRect(110, 150, 24, 24, 8);
    drawEyes(g, 56, 70, pet.eyeColor, 6);
    drawMouth(g, 56, 84);
  },

  'pet_venusaur': (g, pet) => {
    // 妙蛙花：巨花
    g.fillStyle(0xe91e63, 0.5);
    g.fillCircle(100, 26, 18);
    g.fillCircle(80, 36, 18);
    g.fillCircle(120, 36, 18);
    g.fillCircle(86, 18, 14);
    g.fillCircle(114, 18, 14);
    g.fillStyle(0xffeb3b, 0.8);
    g.fillCircle(100, 28, 14);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 110, 72, 52);
    g.fillCircle(56, 74, 24);
    g.fillTriangle(42, 62, 28, 36, 50, 56);
    g.fillTriangle(70, 58, 74, 32, 68, 56);
    g.fillRoundedRect(62, 150, 26, 26, 10);
    g.fillRoundedRect(112, 150, 26, 26, 10);
    g.fillStyle(0x2e7d32, 0.3);
    g.fillCircle(86, 106, 9);
    g.fillCircle(118, 112, 7);
    drawEyes(g, 52, 68, pet.eyeColor, 6);
    drawMouth(g, 52, 82);
  },

  'pet_celebi': (g, pet) => {
    // 时拉比：精灵 + 洋葱头
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillCircle(100, 44, 24);                // 洋葱头
    g.fillStyle(0x4caf50, 0.6);
    g.fillTriangle(90, 28, 100, 8, 110, 28);
    g.fillStyle(0xc8e6c9, 0.35);
    g.fillEllipse(64, 84, 24, 36);            // 左翅
    g.fillEllipse(136, 84, 24, 36);           // 右翅
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 106, 28, 40);          // 身体
    g.fillRoundedRect(66, 92, 14, 28, 6);     // 左臂
    g.fillRoundedRect(120, 92, 14, 28, 6);    // 右臂
    g.fillRoundedRect(82, 140, 14, 28, 6);    // 左脚
    g.fillRoundedRect(104, 140, 14, 28, 6);   // 右脚
    g.lineStyle(2, 0x81c784, 0.65);
    g.beginPath(); g.moveTo(90, 24); g.lineTo(78, 10); g.stroke();
    g.beginPath(); g.moveTo(110, 24); g.lineTo(122, 10); g.stroke();
    g.fillStyle(0x81c784, 0.8);
    g.fillCircle(78, 10, 5);
    g.fillCircle(122, 10, 5);
    drawSmallEyes(g, 100, 40, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //  电系 (6只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_spark': (g, pet) => {
    // 电火花：发光球体 + 电弧
    g.lineStyle(3, 0xffeb3b, 0.6);
    g.beginPath(); g.moveTo(52, 76); g.lineTo(28, 64); g.stroke();
    g.beginPath(); g.moveTo(148, 76); g.lineTo(172, 64); g.stroke();
    g.beginPath(); g.moveTo(100, 42); g.lineTo(100, 22); g.stroke();
    g.beginPath(); g.moveTo(68, 56); g.lineTo(48, 38); g.stroke();
    g.beginPath(); g.moveTo(132, 56); g.lineTo(152, 38); g.stroke();
    g.fillStyle(0xfff9c4, 0.35);
    g.fillCircle(100, 96, 40);
    g.fillStyle(pet.bodyColor, 0.9);
    g.fillCircle(100, 96, 28);
    g.fillStyle(0xffeb3b, 0.8);
    g.fillCircle(100, 96, 14);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(88, 90, 5);
    g.fillCircle(112, 90, 5);
    g.lineStyle(2, 0x1a1a2e, 0.6);
    g.beginPath(); g.moveTo(92, 106); g.lineTo(100, 102); g.lineTo(108, 106); g.stroke();
    g.fillStyle(pet.bodyColor, 0.5);
    g.fillRoundedRect(84, 132, 10, 22, 4);
    g.fillRoundedRect(106, 132, 10, 22, 4);
  },

  'pet_pikachu': (g, pet) => {
    // 皮卡丘：经典造型
    g.fillStyle(pet.bodyColor, 1);
    g.fillTriangle(68, 62, 48, 10, 82, 50);   // 左耳
    g.fillTriangle(132, 62, 152, 10, 118, 50);// 右耳
    g.fillStyle(0x1a1a2e, 0.75);
    g.fillTriangle(64, 34, 48, 10, 74, 38);
    g.fillTriangle(136, 34, 152, 10, 126, 38);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 68, 28);                // 头
    g.fillEllipse(100, 120, 46, 40);          // 身体
    g.fillStyle(0xe53935, 0.65);
    g.fillCircle(68, 76, 10);                 // 左腮
    g.fillCircle(132, 76, 10);                // 右腮
    g.fillStyle(0xffeb3b, 0.9);
    g.fillTriangle(136, 108, 164, 88, 148, 118);
    g.fillTriangle(148, 102, 172, 80, 164, 112);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(64, 102, 14, 20, 6);    // 左臂
    g.fillRoundedRect(122, 102, 14, 20, 6);   // 右臂
    g.fillRoundedRect(78, 154, 16, 16, 6);    // 左脚
    g.fillRoundedRect(106, 154, 16, 16, 6);   // 右脚
    drawEyes(g, 100, 62, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 72, 3);
    g.lineStyle(2, 0x1a1a2e, 0.6);
    g.beginPath(); g.moveTo(94, 78); g.lineTo(100, 80); g.lineTo(106, 78); g.stroke();
  },

  'pet_raichu': (g, pet) => {
    // 雷丘：橙色 + 长尾
    g.fillStyle(pet.bodyColor, 1);
    g.fillTriangle(66, 58, 44, 8, 80, 46);
    g.fillTriangle(134, 58, 156, 8, 120, 46);
    g.fillCircle(100, 66, 28);
    g.fillEllipse(100, 120, 48, 42);
    g.fillStyle(0xe53935, 0.6);
    g.fillCircle(66, 74, 11);
    g.fillCircle(134, 74, 11);
    g.fillStyle(0xffcc80, 0.9);
    g.fillEllipse(162, 106, 28, 10);
    g.fillTriangle(174, 102, 192, 90, 192, 112);
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(62, 100, 14, 22, 6);
    g.fillRoundedRect(124, 100, 14, 22, 6);
    g.fillRoundedRect(76, 156, 18, 16, 6);
    g.fillRoundedRect(106, 156, 18, 16, 6);
    drawEyes(g, 100, 60, pet.eyeColor, 6);
    drawMouth(g, 100, 76);
  },

  'pet_magnemite': (g, pet) => {
    // 小磁怪：U型磁铁 + 螺丝
    g.fillStyle(0x78909c, 1);
    g.fillRoundedRect(28, 60, 20, 52, 6);     // 左磁臂
    g.fillRoundedRect(152, 60, 20, 52, 6);    // 右磁臂
    g.fillStyle(0xe53935, 1);
    g.fillCircle(38, 60, 10);
    g.fillCircle(162, 60, 10);
    g.fillStyle(0x1565c0, 1);
    g.fillCircle(38, 112, 10);
    g.fillCircle(162, 112, 10);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 86, 36);
    g.fillStyle(0xffffff, 0.18);
    g.fillCircle(86, 76, 14);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(100, 82, 18);
    g.fillStyle(pet.eyeColor, 1);
    g.fillCircle(100, 82, 11);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(96, 78, 3.5);
    g.fillStyle(0x90a4ae, 1);
    g.fillCircle(80, 102, 5);
    g.fillCircle(120, 102, 5);
    g.lineStyle(1.5, 0x546e7a, 0.8);
    g.beginPath(); g.moveTo(76, 102); g.lineTo(84, 102); g.stroke();
    g.beginPath(); g.moveTo(80, 98); g.lineTo(80, 106); g.stroke();
    g.beginPath(); g.moveTo(116, 102); g.lineTo(124, 102); g.stroke();
    g.beginPath(); g.moveTo(120, 98); g.lineTo(120, 106); g.stroke();
    g.fillStyle(0x90a4ae, 0.45);
    g.fillCircle(58, 148, 5);
    g.fillCircle(142, 150, 5);
  },

  'pet_jolteon': (g, pet) => {
    // 雷伊布：全身尖刺
    g.fillStyle(pet.bodyColor, 1);
    for (let a = 0; a < 10; a++) {
      const angle = (a / 10) * Math.PI * 2 - Math.PI / 2;
      const x1 = 100 + Math.cos(angle) * 36;
      const y1 = 100 + Math.sin(angle) * 36;
      const x2 = 100 + Math.cos(angle) * 62;
      const y2 = 100 + Math.sin(angle) * 62;
      g.fillTriangle(
        x1 + Math.cos(angle + 0.3) * 8, y1 + Math.sin(angle + 0.3) * 8,
        x2, y2,
        x1 + Math.cos(angle - 0.3) * 8, y1 + Math.sin(angle - 0.3) * 8,
      );
    }
    g.fillCircle(100, 100, 32);               // 身体
    g.fillCircle(100, 68, 24);                // 头
    g.fillTriangle(80, 54, 66, 20, 90, 48);   // 左耳
    g.fillTriangle(120, 54, 134, 20, 110, 48);// 右耳
    g.fillRoundedRect(82, 128, 14, 28, 6);
    g.fillRoundedRect(104, 128, 14, 28, 6);
    drawEyes(g, 100, 62, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 76, 3);
  },

  'pet_zapdos': (g, pet) => {
    // 闪电鸟：雷电翅膀
    g.fillStyle(0xffd600, 0.5);
    g.fillTriangle(96, 66, 14, 28, 54, 100);
    g.fillTriangle(104, 66, 186, 28, 146, 100);
    g.fillStyle(0xffeb3b, 0.35);
    g.fillTriangle(96, 68, 24, 36, 56, 96);
    g.fillTriangle(104, 68, 176, 36, 144, 96);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 102, 26, 44);
    g.fillCircle(100, 54, 18);
    g.fillStyle(0xffd600, 0.8);
    g.fillTriangle(92, 40, 82, 16, 98, 36);
    g.fillTriangle(100, 38, 100, 10, 106, 36);
    g.fillTriangle(108, 40, 118, 16, 102, 36);
    g.fillStyle(0xffd600, 0.7);
    g.fillTriangle(86, 134, 74, 172, 100, 138);
    g.fillTriangle(100, 136, 100, 178, 114, 136);
    g.fillTriangle(114, 134, 126, 172, 100, 138);
    drawSmallEyes(g, 100, 50, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //  冰系 (6只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_snowman': (g) => {
    // 雪人三球
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(100, 152, 38);               // 底球
    g.fillCircle(100, 92, 28);                // 中球
    g.fillCircle(100, 48, 22);                // 头
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(90, 42, 5);                  // 左眼
    g.fillCircle(110, 42, 5);                 // 右眼
    g.fillStyle(0xff9800, 1);
    g.fillTriangle(100, 48, 100, 52, 122, 52);// 胡萝卜鼻
    g.fillCircle(100, 84, 4);                 // 纽扣
    g.fillCircle(100, 98, 4);
    g.fillCircle(100, 112, 4);
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(78, 24, 44, 6);               // 帽檐
    g.fillRoundedRect(86, 4, 28, 22, 4);     // 帽顶
    g.fillStyle(0xe53935, 0.8);
    g.fillRect(78, 62, 44, 6);               // 围巾
    g.fillRect(118, 62, 6, 24);
    g.lineStyle(3, 0x795548, 0.8);
    g.beginPath(); g.moveTo(66, 92); g.lineTo(38, 74); g.stroke();
    g.beginPath(); g.moveTo(134, 92); g.lineTo(162, 74); g.stroke();
  },

  'pet_seal': (g, pet) => {
    // 海豹球：圆滚身体 + 鳍足
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 112, 72, 52);          // 身体
    g.fillCircle(100, 62, 28);                // 头
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillTriangle(38, 104, 18, 120, 44, 130);// 左鳍
    g.fillTriangle(162, 104, 182, 120, 156, 130);
    g.fillTriangle(86, 152, 100, 178, 114, 152);// 尾
    g.fillStyle(0xbbdefb, 0.35);
    g.fillEllipse(100, 120, 42, 28);
    g.lineStyle(1.5, 0x1a1a2e, 0.4);
    g.beginPath(); g.moveTo(80, 72); g.lineTo(58, 68); g.stroke();
    g.beginPath(); g.moveTo(80, 76); g.lineTo(58, 76); g.stroke();
    g.beginPath(); g.moveTo(120, 72); g.lineTo(142, 68); g.stroke();
    g.beginPath(); g.moveTo(120, 76); g.lineTo(142, 76); g.stroke();
    drawEyes(g, 100, 56, pet.eyeColor, 8);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 68, 5);
  },

  'pet_cubchoo': (g, pet) => {
    // 冻冻熊：圆身 + 鼻涕
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 56, 42);                // 头
    g.fillCircle(74, 32, 16);                 // 左耳
    g.fillCircle(126, 32, 16);                // 右耳
    g.fillStyle(0x1a1a2e, 0.18);
    g.fillCircle(74, 32, 8);
    g.fillCircle(126, 32, 8);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 118, 52, 46);          // 身体
    g.fillRoundedRect(50, 104, 18, 32, 8);    // 左臂
    g.fillRoundedRect(132, 104, 18, 32, 8);   // 右臂
    g.fillEllipse(80, 162, 24, 14);           // 左脚
    g.fillEllipse(120, 162, 24, 14);          // 右脚
    g.fillStyle(0xe3f2fd, 0.35);
    g.fillCircle(100, 124, 24);
    drawEyes(g, 100, 46, pet.eyeColor, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(100, 58, 5);
    g.fillStyle(0x90caf9, 0.6);
    g.fillCircle(100, 68, 5);
    g.fillEllipse(100, 80, 4, 12);
  },

  'pet_glalie': (g, pet) => {
    // 冰鬼护：冰刺球 + 裂纹脸
    g.fillStyle(0xb0bec5, 0.65);
    g.fillTriangle(100, 12, 88, 34, 112, 34);
    g.fillTriangle(42, 42, 56, 58, 44, 58);
    g.fillTriangle(158, 42, 144, 58, 156, 58);
    g.fillTriangle(50, 132, 64, 118, 54, 118);
    g.fillTriangle(150, 132, 136, 118, 146, 118);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 82, 48);
    g.fillStyle(0xcfd8dc, 0.28);
    g.fillCircle(100, 78, 38);
    g.lineStyle(2.5, 0x455a64, 0.45);
    g.beginPath(); g.moveTo(100, 56); g.lineTo(96, 82); g.lineTo(104, 106); g.stroke();
    g.fillStyle(0xc62828, 0.9);
    g.fillEllipse(82, 74, 14, 8);
    g.fillEllipse(118, 74, 14, 8);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(82, 74, 5);
    g.fillCircle(118, 74, 5);
    g.lineStyle(2.5, 0x37474f, 0.7);
    g.beginPath();
    g.moveTo(78, 98); g.lineTo(86, 92); g.lineTo(94, 98); g.lineTo(100, 92); g.lineTo(106, 98); g.lineTo(114, 92); g.lineTo(122, 98);
    g.stroke();
  },

  'pet_frosmoth': (g, pet) => {
    // 雪绒蛾：冰晶翅膀
    g.fillStyle(0xb3e5fc, 0.45);
    g.fillEllipse(62, 86, 40, 64);            // 左翅
    g.fillEllipse(138, 86, 40, 64);           // 右翅
    g.fillStyle(0xe1f5fe, 0.28);
    g.fillCircle(56, 74, 12);
    g.fillCircle(68, 102, 10);
    g.fillCircle(144, 74, 12);
    g.fillCircle(132, 102, 10);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 108, 28, 48);          // 身体
    g.fillCircle(100, 58, 18);                // 头
    g.lineStyle(2, 0xb3e5fc, 0.65);
    g.beginPath(); g.moveTo(88, 42); g.lineTo(72, 22); g.stroke();
    g.beginPath(); g.moveTo(112, 42); g.lineTo(128, 22); g.stroke();
    g.fillStyle(0xe1f5fe, 0.8);
    g.fillCircle(72, 22, 5);
    g.fillCircle(128, 22, 5);
    g.lineStyle(2, 0x90caf9, 0.4);
    g.beginPath(); g.moveTo(86, 132); g.lineTo(74, 160); g.stroke();
    g.beginPath(); g.moveTo(100, 134); g.lineTo(100, 162); g.stroke();
    g.beginPath(); g.moveTo(114, 132); g.lineTo(126, 160); g.stroke();
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(42, 128, 5);
    g.fillCircle(158, 122, 5);
    drawSmallEyes(g, 100, 54, pet.eyeColor);
  },

  'pet_articuno2': (g, pet) => {
    // 冰晶凤凰
    g.fillStyle(0x4fc3f7, 0.45);
    g.fillTriangle(96, 66, 8, 26, 50, 104);
    g.fillTriangle(104, 66, 192, 26, 150, 104);
    g.fillStyle(0xb3e5fc, 0.3);
    g.fillTriangle(96, 68, 18, 34, 52, 100);
    g.fillTriangle(104, 68, 182, 34, 148, 100);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 102, 26, 46);
    g.fillCircle(100, 54, 18);
    g.fillStyle(0x4fc3f7, 0.9);
    g.fillTriangle(92, 40, 100, 14, 108, 40);
    g.fillStyle(0xe1f5fe, 0.6);
    g.fillTriangle(94, 38, 100, 20, 106, 38);
    g.fillStyle(0x4fc3f7, 0.6);
    g.fillTriangle(88, 136, 78, 178, 100, 140);
    g.fillTriangle(100, 138, 100, 180, 112, 138);
    g.fillTriangle(112, 136, 122, 178, 100, 140);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(38, 56, 5);
    g.fillCircle(162, 52, 5);
    g.fillCircle(56, 120, 4);
    g.fillCircle(144, 116, 4);
    drawSmallEyes(g, 100, 50, pet.eyeColor);
  },

  // ═══════════════════════════════════════════
  //  暗系 (6只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_bat': (g, pet) => {
    // 蝙蝠：展翅 + 獠牙
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillTriangle(84, 88, 14, 56, 44, 116);  // 左翼
    g.fillTriangle(116, 88, 186, 56, 156, 116);
    g.fillStyle(0x424242, 0.35);
    g.fillTriangle(84, 90, 24, 62, 46, 112);
    g.fillTriangle(116, 90, 176, 62, 154, 112);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 110, 30, 38);          // 身体
    g.fillCircle(100, 70, 22);                // 头
    g.fillTriangle(82, 56, 68, 24, 90, 52);   // 左耳
    g.fillTriangle(118, 56, 132, 24, 110, 52);// 右耳
    g.fillStyle(0x1a1a2e, 0.25);
    g.fillTriangle(83, 55, 74, 32, 88, 52);
    g.fillTriangle(117, 55, 126, 32, 112, 52);
    g.fillStyle(0xffffff, 0.85);
    g.fillTriangle(92, 82, 88, 92, 96, 82);   // 左牙
    g.fillTriangle(108, 82, 112, 92, 104, 82);// 右牙
    g.fillStyle(0xe53935, 0.85);
    g.fillCircle(90, 66, 6);
    g.fillCircle(110, 66, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(90, 66, 3);
    g.fillCircle(110, 66, 3);
    g.fillStyle(pet.bodyColor, 0.65);
    g.fillCircle(88, 148, 5);
    g.fillCircle(112, 148, 5);
  },

  'pet_ghost': (g, pet) => {
    // 幽灵仔：波浪底部 + 空洞眼
    g.fillStyle(pet.color, 0.12);
    g.fillCircle(100, 96, 56);
    g.fillStyle(pet.bodyColor, 0.82);
    g.fillCircle(100, 76, 42);
    g.fillRect(58, 76, 84, 56);
    g.fillCircle(70, 132, 18);
    g.fillCircle(100, 136, 18);
    g.fillCircle(130, 132, 18);
    g.fillCircle(46, 98, 14);
    g.fillCircle(154, 98, 14);
    g.fillStyle(0xffffff, 0.88);
    g.fillEllipse(82, 72, 22, 26);
    g.fillEllipse(118, 72, 22, 26);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(86, 76, 7);
    g.fillCircle(114, 76, 7);
    g.fillStyle(0x1a1a2e, 0.55);
    g.fillEllipse(100, 104, 14, 18);
  },

  'pet_murkrow': (g, pet) => {
    // 黑暗鸦：巫师帽 + 翅膀
    g.fillStyle(pet.bodyColor, 0.85);
    g.fillTriangle(84, 92, 18, 70, 50, 120);
    g.fillTriangle(116, 92, 182, 70, 150, 120);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 110, 34, 42);          // 身体
    g.fillCircle(100, 66, 24);                // 头
    g.fillStyle(0x1a1a2e, 0.88);
    g.fillTriangle(88, 50, 100, 14, 112, 50); // 帽尖
    g.fillRect(74, 50, 52, 7);               // 帽檐
    g.fillStyle(0xe53935, 0.65);
    g.fillTriangle(116, 46, 130, 30, 124, 50);// 帽羽
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillTriangle(88, 140, 74, 172, 100, 144);
    g.fillTriangle(100, 142, 100, 176, 112, 142);
    g.fillStyle(0xff9800, 1);
    g.fillTriangle(100, 74, 92, 82, 108, 82);
    g.fillTriangle(100, 82, 96, 90, 104, 90);
    g.fillStyle(0xffd600, 0.88);
    g.fillCircle(90, 62, 6);
    g.fillCircle(110, 62, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(90, 62, 3);
    g.fillCircle(110, 62, 3);
  },

  'pet_umbreon': (g, pet) => {
    // 月伊布：黑狐 + 发光环纹
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 66, 28);                // 头
    g.fillTriangle(76, 52, 58, 14, 88, 44);   // 左耳
    g.fillTriangle(124, 52, 142, 14, 112, 44);// 右耳
    g.fillEllipse(100, 122, 44, 42);          // 身体
    g.fillCircle(150, 114, 14);               // 尾
    g.fillRoundedRect(80, 156, 16, 24, 6);
    g.fillRoundedRect(104, 156, 16, 24, 6);
    g.fillStyle(0xffd600, 0.8);
    g.fillCircle(100, 52, 7);                 // 额环
    g.fillCircle(74, 26, 5);                  // 左耳环
    g.fillCircle(126, 26, 5);                 // 右耳环
    g.fillCircle(72, 116, 5);                 // 左肩环
    g.fillCircle(128, 116, 5);                // 右肩环
    g.fillCircle(150, 108, 5);                // 尾环
    g.fillStyle(0xe53935, 0.88);
    g.fillCircle(88, 62, 8);
    g.fillCircle(112, 62, 8);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(88, 62, 3.5);
    g.fillCircle(112, 62, 3.5);
  },

  'pet_darkrai': (g, pet) => {
    // 达克莱伊：暗影触须
    g.fillStyle(pet.bodyColor, 0.45);
    g.fillCircle(72, 156, 14);
    g.fillCircle(100, 162, 14);
    g.fillCircle(128, 156, 14);
    g.fillCircle(56, 142, 10);
    g.fillCircle(144, 142, 10);
    g.fillStyle(pet.bodyColor, 0.78);
    g.fillEllipse(100, 92, 48, 66);          // 身体
    g.fillCircle(100, 50, 28);                // 头
    g.fillStyle(0x0d0d1a, 0.55);
    g.fillTriangle(72, 58, 56, 96, 84, 76);
    g.fillTriangle(128, 58, 144, 96, 116, 76);
    g.fillStyle(0xc62828, 0.88);
    g.fillEllipse(86, 46, 14, 8);
    g.fillEllipse(114, 46, 14, 8);
    g.fillStyle(0xff1744, 0.55);
    g.fillCircle(86, 46, 5);
    g.fillCircle(114, 46, 5);
    g.fillStyle(0x000000, 0.65);
    g.fillEllipse(100, 66, 18, 10);
  },

  'pet_spiritomb': (g, pet) => {
    // 花岩怪：石面 + 独眼
    g.fillStyle(pet.bodyColor, 0.35);
    g.fillCircle(58, 56, 14);
    g.fillCircle(142, 58, 14);
    g.fillCircle(46, 96, 10);
    g.fillCircle(154, 98, 10);
    g.fillStyle(0x616161, 0.88);
    g.fillCircle(100, 98, 52);
    g.lineStyle(2.5, 0x424242, 0.55);
    g.beginPath(); g.moveTo(100, 48); g.lineTo(96, 72); g.lineTo(104, 102); g.stroke();
    g.fillStyle(0x1a1a2e, 0.88);
    g.fillEllipse(100, 92, 40, 50);
    g.fillStyle(0x76ff03, 0.88);
    g.fillCircle(100, 86, 11);
    g.fillStyle(0x000000, 0.78);
    g.fillCircle(100, 86, 5.5);
    g.fillStyle(0x76ff03, 0.55);
    g.fillCircle(78, 74, 5);
    g.fillCircle(122, 74, 5);
    g.lineStyle(2.5, 0x76ff03, 0.45);
    g.beginPath(); g.moveTo(82, 108); g.lineTo(118, 108); g.stroke();
  },

  // ═══════════════════════════════════════════
  //  光系 (6只) — 200×200 全身像
  // ═══════════════════════════════════════════

  'pet_pixie': (g, pet) => {
    // 小精灵：光翼 + 星尘
    g.fillStyle(pet.color, 0.12);
    g.fillCircle(100, 96, 54);
    g.fillStyle(0xfff9c4, 0.35);
    g.fillEllipse(60, 82, 28, 42);            // 左翼
    g.fillEllipse(140, 82, 28, 42);           // 右翼
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 62, 22);                // 头
    g.fillEllipse(100, 108, 26, 36);          // 身体
    g.fillStyle(0xffe082, 0.75);
    g.fillTriangle(92, 44, 82, 22, 98, 40);
    g.fillTriangle(100, 42, 100, 16, 106, 40);
    g.fillTriangle(108, 44, 118, 22, 102, 40);
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillCircle(68, 106, 8);
    g.fillCircle(132, 106, 8);
    g.fillRoundedRect(86, 140, 10, 22, 4);
    g.fillRoundedRect(104, 140, 10, 22, 4);
    g.fillStyle(0xffd700, 0.45);
    g.fillCircle(50, 120, 5);
    g.fillCircle(150, 116, 5);
    g.fillCircle(100, 164, 4);
    drawSmallEyes(g, 100, 56, pet.eyeColor);
    drawBlush(g, 100, 66);
  },

  'pet_clefairy': (g, pet) => {
    // 皮皮：粉色精灵
    g.fillStyle(0xf8bbd0, 0.35);
    g.fillEllipse(56, 86, 24, 38);
    g.fillEllipse(144, 86, 24, 38);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 62, 28);                // 头
    g.fillCircle(78, 38, 14);                 // 左耳
    g.fillCircle(122, 38, 14);                // 右耳
    g.fillStyle(0x1a1a2e, 0.18);
    g.fillCircle(78, 38, 7);
    g.fillCircle(122, 38, 7);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 114, 42, 44);          // 身体
    g.fillStyle(0xe53935, 0.75);
    g.fillCircle(100, 48, 8);                 // 额星
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillCircle(62, 108, 10);
    g.fillCircle(138, 108, 10);
    g.fillEllipse(84, 156, 18, 10);
    g.fillEllipse(116, 156, 18, 10);
    drawEyes(g, 100, 56, pet.eyeColor, 6);
    drawMouth(g, 100, 70);
    drawBlush(g, 100, 68);
  },

  'pet_ralts': (g, pet) => {
    // 拉鲁拉丝：小人形 + 红角
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 118, 38, 48);          // 裙身
    g.fillStyle(0xffffff, 0.88);
    g.fillCircle(100, 64, 26);                // 头
    g.fillStyle(pet.bodyColor, 0.88);
    g.fillCircle(100, 54, 26);                // 头发
    g.fillRect(68, 54, 64, 18);
    g.fillStyle(0xe53935, 0.78);
    g.fillTriangle(92, 34, 100, 12, 108, 34); // 角
    g.fillStyle(0xe53935, 0.88);
    g.fillCircle(90, 62, 6);
    g.fillCircle(110, 62, 6);
    g.fillStyle(0x1a1a2e, 1);
    g.fillCircle(90, 62, 3);
    g.fillCircle(110, 62, 3);
    g.fillStyle(0x4caf50, 0.45);
    g.fillRoundedRect(86, 160, 10, 22, 4);
    g.fillRoundedRect(104, 160, 10, 22, 4);
  },

  'pet_gardevoir': (g, pet) => {
    // 沙奈朵：优雅长袍
    g.fillStyle(pet.bodyColor, 0.88);
    g.fillEllipse(100, 122, 56, 56);
    g.fillTriangle(72, 108, 100, 178, 128, 108);
    g.fillStyle(0xffffff, 0.75);
    g.fillCircle(100, 44, 14);                // 白角
    g.fillCircle(100, 34, 9);
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 92, 32, 40);          // 身体
    g.fillCircle(100, 56, 24);                // 头
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillCircle(100, 48, 24);                // 头发
    g.fillTriangle(72, 54, 58, 82, 80, 70);
    g.fillTriangle(128, 54, 142, 82, 120, 70);
    g.fillStyle(0x4caf50, 0.45);
    g.fillCircle(100, 80, 8);
    g.fillStyle(pet.bodyColor, 0.65);
    g.fillTriangle(60, 90, 38, 122, 68, 106);
    g.fillTriangle(140, 90, 162, 122, 132, 106);
    g.fillStyle(0xe53935, 0.75);
    g.fillEllipse(90, 52, 8, 5);
    g.fillEllipse(110, 52, 8, 5);
  },

  'pet_espeon': (g, pet) => {
    // 太阳伊布：猫耳 + 分叉尾
    g.fillStyle(pet.bodyColor, 0.75);
    g.fillCircle(152, 102, 14);
    g.fillTriangle(146, 96, 168, 78, 158, 106);
    g.fillTriangle(150, 104, 172, 92, 162, 110);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 64, 26);                // 头
    g.fillTriangle(78, 50, 58, 12, 88, 44);   // 左耳
    g.fillTriangle(122, 50, 142, 12, 112, 44);// 右耳
    g.fillStyle(0xe53935, 0.75);
    g.fillCircle(100, 50, 7);                 // 额宝石
    g.fillStyle(pet.bodyColor, 1);
    g.fillEllipse(100, 120, 42, 40);          // 身体
    g.fillRoundedRect(80, 152, 14, 26, 6);
    g.fillRoundedRect(106, 152, 14, 26, 6);
    g.fillStyle(0xffffff, 0.28);
    g.fillCircle(100, 86, 16);
    drawEyes(g, 100, 58, pet.eyeColor, 6);
    drawMouth(g, 100, 72);
  },

  'pet_arceus': (g, pet) => {
    // 阿尔宙斯：光环 + 鬃毛 + 蹄
    g.lineStyle(4, 0xffd700, 0.65);
    g.strokeCircle(100, 24, 20);              // 光环
    g.fillStyle(0xffe082, 0.45);
    g.fillCircle(100, 60, 32);                // 鬃毛
    g.fillCircle(76, 72, 16);
    g.fillCircle(124, 72, 16);
    g.fillStyle(pet.bodyColor, 1);
    g.fillCircle(100, 62, 24);                // 头
    g.fillEllipse(100, 118, 48, 44);          // 身体
    g.fillStyle(0xffd700, 0.88);
    g.fillTriangle(92, 44, 100, 16, 108, 44); // 角
    g.fillStyle(pet.bodyColor, 1);
    g.fillRoundedRect(76, 152, 14, 26, 6);    // 左前腿
    g.fillRoundedRect(110, 152, 14, 26, 6);   // 右前腿
    g.fillStyle(0xffd700, 0.55);
    g.fillRoundedRect(76, 172, 14, 6, 3);     // 左蹄
    g.fillRoundedRect(110, 172, 14, 6, 3);    // 右蹄
    g.fillStyle(pet.bodyColor, 0.65);
    g.fillCircle(148, 124, 14);
    g.fillCircle(156, 118, 10);
    g.fillStyle(0x4caf50, 0.45);
    g.fillCircle(86, 112, 6);
    g.fillCircle(114, 112, 6);
    g.fillStyle(0xe53935, 0.45);
    g.fillCircle(100, 126, 6);
    drawEyes(g, 100, 56, pet.eyeColor, 6);
  },

};
