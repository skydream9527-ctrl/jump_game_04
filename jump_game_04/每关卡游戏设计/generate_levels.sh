#!/bin/bash

# 天穹跃迁 - 关卡设计文件生成脚本

BASE_DIR="/Users/gyh/Desktop/vscode/Jump Game Demo 4/每关卡游戏设计"

# 章节数据
declare -A CHAPTER_NAMES
CHAPTER_NAMES[1]="荒废地球"
CHAPTER_NAMES[2]="月球基地"
CHAPTER_NAMES[3]="火星殖民地"
CHAPTER_NAMES[4]="水银星"
CHAPTER_NAMES[5]="冰封星"
CHAPTER_NAMES[6]="火焰星球"
CHAPTER_NAMES[7]="雷电星球"
CHAPTER_NAMES[8]="丛林星"
CHAPTER_NAMES[9]="晶体星"
CHAPTER_NAMES[10]="暗物质领域"

declare -A CHAPTER_THEMES
CHAPTER_THEMES[1]="教学关卡"
CHAPTER_THEMES[2]="低重力环境"
CHAPTER_THEMES[3]="沙尘暴"
CHAPTER_THEMES[4]="液态金属"
CHAPTER_THEMES[5]="冰面滑动"
CHAPTER_THEMES[6]="融化平台"
CHAPTER_THEMES[7]="闪电攻击"
CHAPTER_THEMES[8]="藤蔓生长"
CHAPTER_THEMES[9]="隐形平台"
CHAPTER_THEMES[10]="黑暗区域"

declare -A CHAPTER_DIRS
CHAPTER_DIRS[1]="第1章_荒废地球"
CHAPTER_DIRS[2]="第2章_月球基地"
CHAPTER_DIRS[3]="第3章_火星殖民地"
CHAPTER_DIRS[4]="第4章_水银星"
CHAPTER_DIRS[5]="第5章_冰封星"
CHAPTER_DIRS[6]="第6章_火焰星球"
CHAPTER_DIRS[7]="第7章_雷电星球"
CHAPTER_DIRS[8]="第8章_丛林星"
CHAPTER_DIRS[9]="第9章_晶体星"
CHAPTER_DIRS[10]="第10章_暗物质领域"

# Boss名称
declare -A BOSS_NAMES
BOSS_NAMES[1]="钢铁巨像"
BOSS_NAMES[2]="月震虫"
BOSS_NAMES[3]="沙暴巨蝎"
BOSS_NAMES[4]="水银巨灵"
BOSS_NAMES[5]="霜暴龙"
BOSS_NAMES[6]="熔岩领主"
BOSS_NAMES[7]="雷霆守卫"
BOSS_NAMES[8]="巨树之心"
BOSS_NAMES[9]="棱镜巨像"
BOSS_NAMES[10]="暗物质核心"

# 小Boss名称
declare -A MINI_BOSS_NAMES
MINI_BOSS_NAMES[1]="守护者哨兵"
MINI_BOSS_NAMES[2]="月壳蟹"
MINI_BOSS_NAMES[3]="沙漠潜伏者"
MINI_BOSS_NAMES[4]="熔岩爬虫"
MINI_BOSS_NAMES[5]="冰晶守卫"
MINI_BOSS_NAMES[6]="雷电守望者"
MINI_BOSS_NAMES[7]="藤蔓编织者"
MINI_BOSS_NAMES[8]="棱镜碎片"
MINI_BOSS_NAMES[9]="暗影领主"
MINI_BOSS_NAMES[10]="虚空行者"

# 普通敌人
NORMAL_ENEMIES="飞行侦察机、机械步兵、自动炮塔"
ELITE_ENEMIES_CH3_PLUS="突袭犀兽、火焰精灵"
ELITE_ENEMIES_CH5_PLUS="寒冰巨兽"
ELITE_ENEMIES_CH7_PLUS="暗影潜行者"
ELITE_ENEMIES_CH9_PLUS="水晶魔像"

# 生成关卡文件
generate_level_file() {
    local ch=$1
    local lv=$2
    local ch_name="${CHAPTER_NAMES[$ch]}"
    local ch_theme="${CHAPTER_THEMES[$ch]}"
    local ch_dir="${CHAPTER_DIRS[$ch]}"
    local boss_name="${BOSS_NAMES[$ch]}"
    local mini_boss="${MINI_BOSS_NAMES[$ch]}"

    local file_path="$BASE_DIR/$ch_dir/关卡${lv}.md"

    # 计算难度参数
    local base_distance=$((3000 + lv * 800))
    local chapter_scale=$(echo "scale=2; 1 + ($ch - 1) * 0.15" | bc)
    local target_distance=$(echo "scale=0; $base_distance * $chapter_scale / 1" | bc)
    local speed_mult=$(echo "scale=2; 1 + ($ch - 1) * 0.03" | bc)
    local gap_mult=$(echo "scale=2; 1 + ($ch - 1) * 0.05 + $lv * 0.02" | bc)

    # 确定关卡类型
    local level_type="普通关卡"
    local special_feature=""
    if [ $lv -eq 10 ]; then
        level_type="Boss关卡"
        special_feature="击败本章大Boss：${boss_name}"
    elif [ $lv -eq 5 ]; then
        level_type="小Boss关卡"
        special_feature="遭遇小Boss：${mini_boss}"
    elif [ $lv -eq 1 ]; then
        level_type="教学关卡"
        special_feature="学习基础操作"
    fi

    # 确定可用敌人
    local enemies="$NORMAL_ENEMIES"
    if [ $ch -ge 3 ]; then
        enemies="$enemies、$ELITE_ENEMIES_CH3_PLUS"
    fi
    if [ $ch -ge 5 ]; then
        enemies="$enemies、$ELITE_ENEMIES_CH5_PLUS"
    fi
    if [ $ch -ge 7 ]; then
        enemies="$enemies、$ELITE_ENEMIES_CH7_PLUS"
    fi
    if [ $ch -ge 9 ]; then
        enemies="$enemies、$ELITE_ENEMIES_CH9_PLUS"
    fi

    # 确定推荐武器
    local recommended_weapons="手枪（基础）"
    if [ $ch -ge 2 ]; then
        recommended_weapons="$recommended_weapons、散弹枪"
    fi
    if [ $ch -ge 3 ]; then
        recommended_weapons="$recommended_weapons、离子光束"
    fi
    if [ $ch -ge 5 ]; then
        recommended_weapons="$recommended_weapons、火球发射器"
    fi
    if [ $ch -ge 7 ]; then
        recommended_weapons="$recommended_weapons、等离子炮、时间减速器"
    fi
    if [ $ch -ge 9 ]; then
        recommended_weapons="$recommended_weapons、量子分解器、引力场发生器"
    fi

    # 生成文件内容
    cat > "$file_path" << EOF
# 第${ch}章 · ${ch_name} — 第${lv}关

## 关卡信息

| 项目 | 内容 |
|------|------|
| **章节** | 第${ch}章 · ${ch_name} |
| **关卡** | 第${lv}关 |
| **类型** | ${level_type} |
| **主题** | ${ch_theme} |
| **目标距离** | ${target_distance} 米 |
| **速度倍率** | ${speed_mult}x |
| **平台间距** | ${gap_mult}x |

## 关卡特点

EOF

    # 根据关卡添加特点描述
    if [ $lv -eq 10 ]; then
        cat >> "$file_path" << EOF
- **Boss战**：本关为Boss关卡，需要击败大Boss **${boss_name}**
- Boss拥有多种攻击模式和阶段转换
- 击败Boss后可获得大量星核碎片奖励
- 建议携带护盾和生命药剂
EOF
    elif [ $lv -eq 5 ]; then
        cat >> "$file_path" << EOF
- **小Boss战**：本关会遭遇小Boss **${mini_boss}**
- 小Boss拥有特殊攻击模式
- 击败小Boss可获得额外奖励
- 注意躲避小Boss的特殊技能
EOF
    elif [ $lv -eq 1 ]; then
        cat >> "$file_path" << EOF
- **教学关卡**：学习游戏基础操作
- 学习跳跃、移动和射击
- 了解平台类型和道具效果
- 熟悉敌人行为模式
EOF
    else
        cat >> "$file_path" << EOF
- **普通关卡**：标准闯关体验
- 距离和难度适中
- 收集星核碎片提升评分
- 注意躲避敌人攻击
EOF
    fi

    cat >> "$file_path" << EOF

## 特殊机制

EOF

    # 根据章节添加特殊机制
    case $ch in
        1)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：稳定的废墟平台
- **环境**：无特殊环境效果
EOF
            ;;
        2)
            cat >> "$file_path" << EOF
- **重力**：低重力环境（0.67x）
- **平台**：金属平台，较为光滑
- **环境**：跳跃高度增加，下落速度减慢
EOF
            ;;
        3)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：沙地平台，可能有沙尘暴
- **环境**：视野可能受沙尘影响
EOF
            ;;
        4)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：液态金属平台，表面光滑
- **环境**：平台可能会流动变化
EOF
            ;;
        5)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：冰面平台，会滑动
- **环境**：移动时会有惯性，需要提前刹车
EOF
            ;;
        6)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：熔岩平台，会逐渐融化
- **环境**：平台停留时间有限，需要快速通过
EOF
            ;;
        7)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：导电平台
- **环境**：随机闪电攻击，需要躲避
EOF
            ;;
        8)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：藤蔓平台，可能生长障碍
- **环境**：藤蔓可能会阻挡路径
EOF
            ;;
        9)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：晶体平台，部分隐形
- **环境**：需要记忆或使用透视镜查看隐形平台
EOF
            ;;
        10)
            cat >> "$file_path" << EOF
- **重力**：标准重力（1.0x）
- **平台**：暗物质平台，不稳定
- **环境**：视野受限，需要谨慎移动
EOF
            ;;
    esac

    cat >> "$file_path" << EOF

## 可选角色

| 角色 | 特点 | 推荐度 |
|------|------|--------|
| **凌** | 均衡型，无特殊能力 | ★★★★ |
| **零号** | 精准着陆，适合高难度跳跃 | ★★★★ |
| **艾珂** | 跳跃力+8%，适合跨越大距离 | ★★★★★ |
| **疾风** | 移动速度+8%，适合快速通关 | ★★★★ |

EOF

    # 根据章节推荐角色
    if [ $ch -le 3 ]; then
        cat >> "$file_path" << EOF
> **推荐**：新手建议使用 **凌**，熟悉操作后可尝试其他角色
EOF
    elif [ $ch -le 6 ]; then
        cat >> "$file_path" << EOF
> **推荐**：建议使用 **艾珂**（跳跃力加成）或 **零号**（精准着陆）
EOF
    else
        cat >> "$file_path" << EOF
> **推荐**：高难度关卡建议使用 **疾风**（速度加成）或 **艾珂**（跳跃力加成）
EOF
    fi

    cat >> "$file_path" << EOF

## 推荐武器

| 武器 | 伤害 | 射速 | 特点 |
|------|------|------|------|
EOF

    # 根据章节推荐武器
    if [ $ch -ge 1 ]; then
        cat >> "$file_path" << EOF
| 手枪 | 1 | 中 | 基础武器，稳定可靠 |
EOF
    fi
    if [ $ch -ge 2 ]; then
        cat >> "$file_path" << EOF
| 散弹枪 | 1 | 中 | 扇形散射，覆盖范围广 |
EOF
    fi
    if [ $ch -ge 3 ]; then
        cat >> "$file_path" << EOF
| 离子光束 | 2 | 慢 | 高速穿透，连续伤害 |
EOF
    fi
    if [ $ch -ge 4 ]; then
        cat >> "$file_path" << EOF
| 机枪 | 1 | 快 | 超高射速，持续火力 |
EOF
    fi
    if [ $ch -ge 5 ]; then
        cat >> "$file_path" << EOF
| 火球发射器 | 3 | 慢 | 命中后爆炸，范围伤害 |
EOF
    fi
    if [ $ch -ge 7 ]; then
        cat >> "$file_path" << EOF
| 等离子炮 | 4 | 慢 | 高能等离子球，大范围爆炸 |
| 时间减速器 | 1 | 中 | 击中敌人后减速50% |
EOF
    fi
    if [ $ch -ge 9 ]; then
        cat >> "$file_path" << EOF
| 量子分解器 | 8 | 很慢 | 终极武器，对Boss伤害+50% |
| 引力场发生器 | 2 | 很慢 | 产生微型黑洞，吸引并伤害敌人 |
EOF
    fi

    cat >> "$file_path" << EOF

## 推荐道具

| 道具 | 效果 | 获取方式 |
|------|------|----------|
| **能量护盾** | 抵挡一次伤害 | 关卡内拾取/商店购买 |
| **碎片磁铁** | 自动吸附碎片，持续8秒 | 关卡内拾取/商店购买 |
| **缓时装置** | 速度减半，持续5秒 | 关卡内拾取/商店购买 |
| **强化靴** | 跳跃力×1.5，持续8秒 | 关卡内拾取/商店购买 |
| **生命药剂** | 恢复30%生命值 | 关卡内拾取/商店购买 |
| **能量电池** | 恢复50%能量 | 关卡内拾取/商店购买 |
| **复活币** | 死亡时自动复活，恢复50%生命 | 商店购买 |

EOF

    if [ $lv -eq 10 ]; then
        cat >> "$file_path" << EOF
> **Boss战建议**：务必携带 **能量护盾** 和 **生命药剂**，提高生存能力
EOF
    fi

    cat >> "$file_path" << EOF

## 敌人列表

### 普通敌人

| 敌人 | 生命 | 伤害 | 特点 |
|------|------|------|------|
| 飞行侦察机 | 1 | 1 | 高速移动，追踪玩家 |
| 机械步兵 | 1 | 1 | 地面巡逻，稳定移动 |
| 自动炮塔 | 2 | 1 | 固定位置，远程射击 |

EOF

    if [ $ch -ge 3 ]; then
        cat >> "$file_path" << EOF
### 精英敌人（第3章起出现）

| 敌人 | 生命 | 伤害 | 特点 |
|------|------|------|------|
| 突袭犀兽 | 2 | 2 | 发现玩家后冲锋 |
| 火焰精灵 | 2 | 2 | 移动时留下火焰轨迹 |

EOF
    fi

    if [ $ch -ge 5 ]; then
        cat >> "$file_path" << EOF
| 寒冰巨兽 | 4 | 2 | 攻击附带减速效果 |
EOF
    fi

    if [ $ch -ge 7 ]; then
        cat >> "$file_path" << EOF
| 暗影潜行者 | 3 | 2 | 可以短距离传送 |
EOF
    fi

    if [ $ch -ge 9 ]; then
        cat >> "$file_path" << EOF
| 水晶魔像 | 5 | 3 | 可以反弹部分攻击 |
EOF
    fi

    if [ $lv -eq 5 ]; then
        cat >> "$file_path" << EOF

### 小Boss

| Boss | 生命 | 伤害 | 特点 |
|------|------|------|------|
| ${mini_boss} | 15-32 | 1-3 | 拥有特殊攻击模式 |
EOF
    fi

    if [ $lv -eq 10 ]; then
        cat >> "$file_path" << EOF

### 大Boss

| Boss | 生命 | 伤害 | 特点 |
|------|------|------|------|
| ${boss_name} | $((30 + ch * 10)) | $((1 + ch / 3)) | 本章最终Boss，拥有多阶段攻击 |
EOF
    fi

    cat >> "$file_path" << EOF

## 通关技巧

EOF

    if [ $lv -eq 10 ]; then
        cat >> "$file_path" << EOF
1. **Boss战策略**
   - 观察Boss攻击模式，找到安全位置
   - Boss攻击间隙是输出的最佳时机
   - 保持移动，避免被连续攻击

2. **装备准备**
   - 携带高伤害武器（等离子炮/量子分解器）
   - 准备足够的回复道具
   - 护盾可以在关键时刻救命

3. **阶段应对**
   - 第一阶段：熟悉Boss基础攻击
   - 第二阶段：Boss速度提升，需要更快反应
   - 狂暴阶段：全力输出，尽快结束战斗
EOF
    elif [ $lv -eq 5 ]; then
        cat >> "$file_path" << EOF
1. **小Boss应对**
   - 小Boss攻击模式相对简单
   - 注意躲避特殊技能
   - 利用地形优势进行战斗

2. **资源管理**
   - 保留道具用于Boss战
   - 合理使用能量技能
   - 注意收集回复道具
EOF
    else
        cat >> "$file_path" << EOF
1. **基础技巧**
   - 保持稳定节奏，不要急躁
   - 优先躲避敌人攻击，再考虑输出
   - 收集星核碎片提升评分

2. **资源收集**
   - 注意收集沿途的道具
   - 利用磁铁道具批量收集碎片
   - 保留护盾用于危险区域

3. **敌人应对**
   - 飞行敌人：优先击杀，避免被追踪
   - 地面敌人：跳跃躲避或踩踏击杀
   - 远程敌人：快速接近或躲避射击
EOF
    fi

    cat >> "$file_path" << EOF

## 星核碎片收集

- 本关共有 **3** 个星核碎片
- 收集全部碎片可获得3星评价
- 碎片通常位于：
  - 平台边缘
  - 高空位置
  - 敌人密集区域

---

*设计日期：2026-05-19*
*版本：v1.0*
EOF

    echo "生成: $file_path"
}

# 生成所有关卡文件
for ch in {1..10}; do
    for lv in {1..10}; do
        generate_level_file $ch $lv
    done
done

echo "所有关卡设计文件生成完成！"
