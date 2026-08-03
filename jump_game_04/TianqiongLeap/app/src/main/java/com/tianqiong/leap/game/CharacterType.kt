package com.tianqiong.leap.game

enum class CharacterType(
    val id: Int,
    val displayName: String,
    val subtitle: String,
    val jumpMultiplier: Float,
    val speedMultiplier: Float,
    val specialAbility: String?,
    val unlockCost: Int,
    // Colors for rendering
    val bodyColor: String,
    val accentColor: String,
    val skinColor: String,
    val hairColor: String,
    val eyeColor: String,
    val glowColor: String
) {
    LING(
        id = 0,
        displayName = "凌",
        subtitle = "人类精英特工",
        jumpMultiplier = 1.0f,
        speedMultiplier = 1.0f,
        specialAbility = null,
        unlockCost = 0,
        bodyColor = "#1e3550",
        accentColor = "#3a5575",
        skinColor = "#e8c8a0",
        hairColor = "#1a2a40",
        eyeColor = "#2a5580",
        glowColor = "#6bb8e8"
    ),
    ZERO(
        id = 1,
        displayName = "零号",
        subtitle = "AI 战斗义体",
        jumpMultiplier = 1.0f,
        speedMultiplier = 1.0f,
        specialAbility = "精准着陆",
        unlockCost = 30,
        bodyColor = "#c0c0c0",
        accentColor = "#e0e0e0",
        skinColor = "#d0d0d0",
        hairColor = "#a0a0a0",
        eyeColor = "#00aaff",
        glowColor = "#00aaff"
    ),
    ECHO(
        id = 2,
        displayName = "艾珂",
        subtitle = "外星混血",
        jumpMultiplier = 1.08f,
        speedMultiplier = 1.0f,
        specialAbility = null,
        unlockCost = 60,
        bodyColor = "#4a2080",
        accentColor = "#7040b0",
        skinColor = "#c8a0d8",
        hairColor = "#e0e0e0",
        eyeColor = "#b060e0",
        glowColor = "#b060e0"
    ),
    GALE(
        id = 3,
        displayName = "疾风",
        subtitle = "改造人战士",
        jumpMultiplier = 1.0f,
        speedMultiplier = 1.08f,
        specialAbility = null,
        unlockCost = 100,
        bodyColor = "#3a2a10",
        accentColor = "#8a6a20",
        skinColor = "#d0b888",
        hairColor = "#2a1a08",
        eyeColor = "#ff3030",
        glowColor = "#ff6030"
    );

    companion object {
        fun fromId(id: Int): CharacterType = entries.firstOrNull { it.id == id } ?: LING
    }
}
