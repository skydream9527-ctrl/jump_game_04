package com.tianqiong.leap.game.level

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

class LevelManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("tianqiong_save", Context.MODE_PRIVATE)

    var totalShards: Int = 0
        private set
    var currentChapter: Int = 1
        private set
    var currentLevel: Int = 1
        private set
    var selectedCharacterId: Int = 0
        private set
    private val unlockedCharacters = mutableSetOf(0) // Ling is default

    // Per-level best data: key = levelIndex
    private val levelRecords = mutableMapOf<Int, LevelRecord>()

    init {
        load()
    }

    fun getCurrentConfig(): LevelConfig = LevelConfig.forLevel(currentChapter, currentLevel)

    fun setLevel(chapter: Int, level: Int) {
        currentChapter = chapter
        currentLevel = level
    }

    fun selectCharacter(id: Int) {
        selectedCharacterId = id
        save()
    }

    fun isCharacterUnlocked(id: Int): Boolean = id in unlockedCharacters

    fun unlockCharacter(id: Int, cost: Int): Boolean {
        if (id in unlockedCharacters) return false
        if (totalShards < cost) return false
        totalShards -= cost
        unlockedCharacters.add(id)
        save()
        return true
    }

    fun isLevelUnlocked(chapter: Int, level: Int): Boolean {
        if (chapter == 1 && level == 1) return true
        val prevIndex = if (level > 1) {
            LevelConfig(chapter, level - 1, 0f).levelIndex
        } else {
            LevelConfig(chapter - 1, 10, 0f).levelIndex
        }
        return levelRecords[prevIndex]?.cleared == true
    }

    fun isChapterUnlocked(chapter: Int): Boolean {
        if (chapter == 1) return true
        val lastLevelOfPrev = LevelConfig(chapter - 1, 10, 0f).levelIndex
        return levelRecords[lastLevelOfPrev]?.cleared == true
    }

    fun recordLevelResult(chapter: Int, level: Int, score: Int, shardsCollected: Int, livesRemaining: Int) {
        val config = LevelConfig.forLevel(chapter, level)
        val idx = config.levelIndex
        val stars = calculateStars(shardsCollected, livesRemaining)
        val existing = levelRecords[idx]

        val record = LevelRecord(
            cleared = true,
            bestScore = maxOf(score, existing?.bestScore ?: 0),
            bestStars = maxOf(stars, existing?.bestStars ?: 0),
            bestShards = maxOf(shardsCollected, existing?.bestShards ?: 0)
        )
        levelRecords[idx] = record
        totalShards += shardsCollected
        save()
    }

    fun getRecord(chapter: Int, level: Int): LevelRecord? {
        return levelRecords[LevelConfig.forLevel(chapter, level).levelIndex]
    }

    fun getChapterStars(chapter: Int): Int {
        var total = 0
        for (l in 1..10) {
            total += levelRecords[LevelConfig.forLevel(chapter, l).levelIndex]?.bestStars ?: 0
        }
        return total
    }

    private fun calculateStars(shardsCollected: Int, livesRemaining: Int): Int {
        return when {
            shardsCollected >= 3 -> 3
            shardsCollected >= 2 -> 2
            else -> 1
        }
    }

    fun save() {
        val json = JSONObject().apply {
            put("totalShards", totalShards)
            put("currentChapter", currentChapter)
            put("currentLevel", currentLevel)
            put("selectedCharacter", selectedCharacterId)
            val chars = JSONArray()
            for (id in unlockedCharacters) chars.put(id)
            put("unlockedCharacters", chars)
            val records = JSONArray()
            for ((idx, rec) in levelRecords) {
                records.put(JSONObject().apply {
                    put("idx", idx)
                    put("cleared", rec.cleared)
                    put("bestScore", rec.bestScore)
                    put("bestStars", rec.bestStars)
                    put("bestShards", rec.bestShards)
                })
            }
            put("records", records)
        }
        prefs.edit().putString("save_data", json.toString()).apply()
    }

    private fun load() {
        val str = prefs.getString("save_data", null) ?: return
        try {
            val json = JSONObject(str)
            totalShards = json.optInt("totalShards", 0)
            currentChapter = json.optInt("currentChapter", 1)
            currentLevel = json.optInt("currentLevel", 1)
            selectedCharacterId = json.optInt("selectedCharacter", 0)
            val chars = json.optJSONArray("unlockedCharacters")
            unlockedCharacters.clear()
            unlockedCharacters.add(0) // Ling always unlocked
            if (chars != null) {
                for (i in 0 until chars.length()) {
                    unlockedCharacters.add(chars.getInt(i))
                }
            }
            val records = json.optJSONArray("records") ?: return
            for (i in 0 until records.length()) {
                val obj = records.getJSONObject(i)
                val idx = obj.getInt("idx")
                levelRecords[idx] = LevelRecord(
                    cleared = obj.optBoolean("cleared", false),
                    bestScore = obj.optInt("bestScore", 0),
                    bestStars = obj.optInt("bestStars", 0),
                    bestShards = obj.optInt("bestShards", 0)
                )
            }
        } catch (_: Exception) {}
    }

    data class LevelRecord(
        val cleared: Boolean = false,
        val bestScore: Int = 0,
        val bestStars: Int = 0,
        val bestShards: Int = 0
    )
}
