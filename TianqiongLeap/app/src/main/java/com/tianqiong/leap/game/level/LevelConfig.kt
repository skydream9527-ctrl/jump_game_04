package com.tianqiong.leap.game.level

data class LevelConfig(
    val chapter: Int,        // 1-10
    val level: Int,          // 1-10
    val targetDistance: Float,// distance to reach the end
    val shardCount: Int = 3,
    val platformGapMultiplier: Float = 1.0f,
    val speedMultiplier: Float = 1.0f
) {
    val levelIndex: Int get() = (chapter - 1) * 10 + level - 1
    val displayName: String get() = "第${chapter}章 · ${chapterName} — 第${level}关"
    val isBossLevel: Boolean get() = level == 10

    val chapterName: String get() = when (chapter) {
        1 -> "荒废地球"
        2 -> "月球基地"
        3 -> "火星殖民地"
        4 -> "水银星"
        5 -> "冰封星"
        6 -> "火焰星球"
        7 -> "雷电星球"
        8 -> "丛林星"
        9 -> "晶体星"
        10 -> "暗物质领域"
        else -> "未知"
    }

    companion object {
        fun forLevel(chapter: Int, level: Int): LevelConfig {
            val baseDistance = 3000f + level * 800f
            val chapterScale = 1f + (chapter - 1) * 0.15f
            return LevelConfig(
                chapter = chapter,
                level = level,
                targetDistance = baseDistance * chapterScale,
                shardCount = 3,
                platformGapMultiplier = 1f + (chapter - 1) * 0.05f + level * 0.02f,
                speedMultiplier = 1f + (chapter - 1) * 0.03f
            )
        }
    }
}
