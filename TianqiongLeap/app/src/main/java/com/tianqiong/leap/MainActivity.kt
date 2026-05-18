package com.tianqiong.leap

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.tianqiong.leap.game.CharacterType
import com.tianqiong.leap.game.GameView
import com.tianqiong.leap.game.level.LevelManager
import com.tianqiong.leap.ui.theme.*

class MainActivity : ComponentActivity() {

    private var gameView: GameView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.decorView.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN or
            android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        )

        setContent {
            TianqiongLeapTheme {
                AppNavigation()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        gameView?.resumeGame()
    }

    override fun onPause() {
        super.onPause()
        gameView?.pauseGame()
    }

    @Composable
    fun AppNavigation() {
        var screen by remember { mutableStateOf("menu") }
        var selectedChapter by remember { mutableStateOf(1) }
        val levelManager = remember { LevelManager(this@MainActivity) }

        when (screen) {
            "menu" -> MainMenuScreen(
                onStartGame = { screen = "planet_select" },
                onCharacterSelect = { screen = "character_select" },
                totalShards = levelManager.totalShards
            )
            "planet_select" -> PlanetSelectScreen(
                levelManager = levelManager,
                onPlanetSelected = { chapter ->
                    selectedChapter = chapter
                    screen = "level_select"
                },
                onBack = { screen = "menu" }
            )
            "level_select" -> LevelSelectScreen(
                chapter = selectedChapter,
                levelManager = levelManager,
                onLevelSelected = { chapter, level ->
                    screen = "game"
                    gameView?.startLevel(chapter, level)
                },
                onBack = { screen = "planet_select" }
            )
            "character_select" -> CharacterSelectScreen(
                levelManager = levelManager,
                onBack = { screen = "menu" }
            )
            "game" -> GameScreen(
                onBackToMenu = {
                    screen = "menu"
                    gameView?.pauseGame()
                }
            )
        }
    }

    @Composable
    fun GameScreen(onBackToMenu: () -> Unit) {
        AndroidView(
            factory = { ctx ->
                GameView(ctx).also {
                    gameView = it
                    it.onNavigateToMenu = onBackToMenu
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}

// ==================== Planet Select ====================
@Composable
fun PlanetSelectScreen(levelManager: LevelManager, onPlanetSelected: (Int) -> Unit, onBack: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF1a1a2e), BgDeep))),
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("←", color = GoldLight, fontSize = 24.sp,
                    modifier = Modifier.clickable(onClick = onBack).padding(end = 16.dp))
                Text("选择星球", color = GoldLight, fontSize = 28.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(24.dp))

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(10) { index ->
                    val chapter = index + 1
                    val unlocked = levelManager.isChapterUnlocked(chapter)
                    val stars = levelManager.getChapterStars(chapter)
                    PlanetCard(
                        chapter = chapter,
                        unlocked = unlocked,
                        stars = stars,
                        onClick = { if (unlocked) onPlanetSelected(chapter) }
                    )
                }
            }
        }
    }
}

private val chapterData = listOf(
    Triple(0xFF8B7355, "荒废地球", "教学关"),
    Triple(0xFF9E9E9E, "月球基地", "低重力"),
    Triple(0xFFBF5B3B, "火星殖民地", "沙尘暴"),
    Triple(0xFFC0C0C0, "水银星", "液态金属"),
    Triple(0xFF6BB8D6, "冰封星", "冰面滑动"),
    Triple(0xFFD44A2E, "火焰星球", "融化平台"),
    Triple(0xFF8B5CF6, "雷电星球", "闪电攻击"),
    Triple(0xFF4CAF50, "丛林星", "藤蔓生长"),
    Triple(0xFFFF69B4, "晶体星", "隐形平台"),
    Triple(0xFF6B21A8, "暗物质领域", "黑暗区域"),
)

@Composable
fun PlanetCard(chapter: Int, unlocked: Boolean, stars: Int, onClick: () -> Unit) {
    val (colorInt, name, _) = chapterData[chapter - 1]
    val planetColor = Color(colorInt.toInt())
    val alpha = if (unlocked) 1f else 0.4f

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(if (unlocked) BgPanel else BgPanel.copy(alpha = 0.5f))
            .clickable(enabled = unlocked, onClick = onClick)
            .padding(12.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(planetColor.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("$chapter", color = planetColor, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(name, color = TextPrimary.copy(alpha = alpha), fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.weight(1f))

            if (unlocked) {
                Row {
                    for (i in 1..3) {
                        val starColor = if (i * 10 <= stars) GoldBright else GoldDim.copy(alpha = 0.3f)
                        Text("★", color = starColor, fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("$stars/30", color = TextDim, fontSize = 11.sp)
                }
            } else {
                Text("未解锁", color = TextDim, fontSize = 12.sp)
            }
        }
    }
}

// ==================== Level Select ====================
@Composable
fun LevelSelectScreen(chapter: Int, levelManager: LevelManager, onLevelSelected: (Int, Int) -> Unit, onBack: () -> Unit) {
    val (_, chapterName, _) = chapterData[chapter - 1]

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF1a1a2e), BgDeep))),
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("←", color = GoldLight, fontSize = 24.sp,
                    modifier = Modifier.clickable(onClick = onBack).padding(end = 16.dp))
                Column {
                    Text("第${chapter}章", color = TextDim, fontSize = 13.sp)
                    Text(chapterName, color = GoldLight, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            LazyVerticalGrid(
                columns = GridCells.Fixed(5),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(10) { index ->
                    val level = index + 1
                    val unlocked = levelManager.isLevelUnlocked(chapter, level)
                    val record = levelManager.getRecord(chapter, level)
                    LevelCard(
                        level = level,
                        isBoss = level == 10,
                        unlocked = unlocked,
                        record = record,
                        onClick = { if (unlocked) onLevelSelected(chapter, level) }
                    )
                }
            }
        }
    }
}

@Composable
fun LevelCard(
    level: Int,
    isBoss: Boolean,
    unlocked: Boolean,
    record: LevelManager.LevelRecord?,
    onClick: () -> Unit
) {
    val alpha = if (unlocked) 1f else 0.4f
    val bgColor = when {
        !unlocked -> BgPanel.copy(alpha = 0.4f)
        isBoss -> Color(0xFF3D1F1F)
        else -> BgPanel
    }

    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(10.dp))
            .background(bgColor)
            .clickable(enabled = unlocked, onClick = onClick)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        if (!unlocked) {
            Text("🔒", fontSize = 20.sp)
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    if (isBoss) "BOSS" else "$level",
                    color = if (isBoss) AccentRed else TextPrimary.copy(alpha = alpha),
                    fontSize = if (isBoss) 14.sp else 20.sp,
                    fontWeight = FontWeight.Bold
                )
                if (record != null) {
                    Row {
                        for (i in 1..3) {
                            Text("★", color = if (i <= record.bestStars) GoldBright else GoldDim.copy(alpha = 0.3f), fontSize = 10.sp)
                        }
                    }
                    Text("${record.bestScore}", color = TextDim, fontSize = 9.sp)
                }
            }
        }
    }
}

// ==================== Main Menu ====================
@Composable
fun MainMenuScreen(onStartGame: () -> Unit, onCharacterSelect: () -> Unit, totalShards: Int) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF1a1a2e), Color(0xFF0f3460)))),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "天穹跃迁",
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold,
                color = GoldLight,
                letterSpacing = 8.sp
            )
            Text(
                "TIANQIONG LEAP",
                fontSize = 14.sp,
                color = TextDim,
                letterSpacing = 4.sp,
                modifier = Modifier.padding(top = 4.dp)
            )

            Box(
                modifier = Modifier
                    .padding(vertical = 24.dp)
                    .width(200.dp)
                    .height(1.dp)
                    .background(GoldDim.copy(alpha = 0.4f))
            )

            // Start button
            Box(
                modifier = Modifier
                    .width(220.dp)
                    .height(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Gold)
                    .clickable(onClick = onStartGame),
                contentAlignment = Alignment.Center
            ) {
                Text("开始游戏", color = BgDeep, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Character select button
            Box(
                modifier = Modifier
                    .width(220.dp)
                    .height(44.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(BgPanel)
                    .clickable(onClick = onCharacterSelect),
                contentAlignment = Alignment.Center
            ) {
                Text("角色选择", color = GoldLight, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("★", color = GoldBright, fontSize = 18.sp)
                Spacer(modifier = Modifier.width(6.dp))
                Text("$totalShards 星核碎片", color = TextDim, fontSize = 14.sp)
            }
        }
    }
}

// ==================== Character Select ====================
@Composable
fun CharacterSelectScreen(levelManager: LevelManager, onBack: () -> Unit) {
    var selectedId by remember { mutableStateOf(levelManager.selectedCharacterId) }
    var shards by remember { mutableStateOf(levelManager.totalShards) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF1a1a2e), BgDeep))),
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("←", color = GoldLight, fontSize = 24.sp,
                    modifier = Modifier.clickable(onClick = onBack).padding(end = 16.dp))
                Text("角色选择", color = GoldLight, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.weight(1f))
                Text("★ $shards", color = GoldBright, fontSize = 16.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Character list
            for (charType in CharacterType.entries) {
                val unlocked = levelManager.isCharacterUnlocked(charType.id)
                val isSelected = selectedId == charType.id
                CharacterCard(
                    character = charType,
                    unlocked = unlocked,
                    isSelected = isSelected,
                    currentShards = shards,
                    onSelect = {
                        if (unlocked) {
                            selectedId = charType.id
                            levelManager.selectCharacter(charType.id)
                        }
                    },
                    onUnlock = {
                        if (levelManager.unlockCharacter(charType.id, charType.unlockCost)) {
                            shards = levelManager.totalShards
                            selectedId = charType.id
                            levelManager.selectCharacter(charType.id)
                        }
                    }
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }
}

@Composable
fun CharacterCard(
    character: CharacterType,
    unlocked: Boolean,
    isSelected: Boolean,
    currentShards: Int,
    onSelect: () -> Unit,
    onUnlock: () -> Unit
) {
    val charColor = Color(android.graphics.Color.parseColor(character.glowColor))
    val borderColor = if (isSelected) Gold else Color.Transparent
    val bgColor = if (isSelected) BgPanel else BgPanel.copy(alpha = 0.6f)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .clickable(enabled = unlocked, onClick = onSelect)
            .padding(1.dp)
    ) {
        // Border for selected
        if (isSelected) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.Transparent)
                    .padding(1.5f.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(10.dp))
                        .background(bgColor)
                )
            }
        }

        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Character avatar placeholder
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(charColor.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    character.displayName.first().toString(),
                    color = charColor,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    character.displayName,
                    color = if (unlocked) TextPrimary else TextDim,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    character.subtitle,
                    color = TextDim,
                    fontSize = 12.sp
                )
                // Stats
                Row(modifier = Modifier.padding(top = 2.dp)) {
                    val stats = mutableListOf<String>()
                    if (character.jumpMultiplier > 1.0f) stats.add("跳跃+${((character.jumpMultiplier - 1) * 100).toInt()}%")
                    if (character.speedMultiplier > 1.0f) stats.add("速度+${((character.speedMultiplier - 1) * 100).toInt()}%")
                    if (character.specialAbility != null) stats.add(character.specialAbility)
                    if (stats.isEmpty()) stats.add("均衡")
                    Text(
                        stats.joinToString(" · "),
                        color = charColor.copy(alpha = 0.8f),
                        fontSize = 11.sp
                    )
                }
            }

            // Action
            if (!unlocked) {
                val canAfford = currentShards >= character.unlockCost
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (canAfford) Gold else GoldDim.copy(alpha = 0.3f))
                        .clickable(enabled = canAfford, onClick = onUnlock)
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        "${character.unlockCost} 碎片",
                        color = if (canAfford) BgDeep else TextDim,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else if (isSelected) {
                Text("使用中", color = Gold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
