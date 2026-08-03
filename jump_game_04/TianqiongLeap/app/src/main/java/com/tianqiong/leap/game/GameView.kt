package com.tianqiong.leap.game

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.RectF
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import com.tianqiong.leap.game.level.LevelManager
import com.tianqiong.leap.game.render.BackgroundRenderer
import com.tianqiong.leap.game.render.CharacterRenderer
import com.tianqiong.leap.game.render.HudRenderer

class GameView(context: Context) : SurfaceView(context), SurfaceHolder.Callback, Runnable {

    private var gameThread: Thread? = null
    val engine = GameEngine()
    val levelManager = LevelManager(context)
    private val backgroundRenderer = BackgroundRenderer()
    private val characterRenderer = CharacterRenderer()
    private val hudRenderer = HudRenderer()

    private var scaleX = 1f
    private var scaleY = 1f
    private var surfaceReady = false
    private var pendingLevel: Pair<Int, Int>? = null

    // Navigation callback for switching to Compose screens
    var onNavigateToMenu: (() -> Unit)? = null

    init {
        holder.addCallback(this)
        isFocusable = true
        engine.init()
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        surfaceReady = true
        calculateScale()
        // Start pending level if any
        pendingLevel?.let { (ch, lv) ->
            pendingLevel = null
            startLevel(ch, lv)
        }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        calculateScale()
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        surfaceReady = false
        stopGameLoop()
    }

    private fun calculateScale() {
        scaleX = width.toFloat() / GameConstants.CANVAS_WIDTH
        scaleY = height.toFloat() / GameConstants.CANVAS_HEIGHT
    }

    private var isRunning = false

    fun startLevel(chapter: Int, level: Int) {
        if (!surfaceReady) {
            pendingLevel = chapter to level
            return
        }
        levelManager.setLevel(chapter, level)
        val config = levelManager.getCurrentConfig()
        val charType = CharacterType.fromId(levelManager.selectedCharacterId)
        engine.startLevel(config, charType)
        startGameLoop()
    }

    fun pauseGame() {
        engine.pause()
        stopGameLoop()
    }

    fun resumeGame() {
        if (engine.state == GameState.PAUSED) {
            engine.resume()
            startGameLoop()
        }
    }

    private fun startGameLoop() {
        isRunning = true
        gameThread = Thread(this, "GameLoop").also { it.start() }
    }

    private fun stopGameLoop() {
        isRunning = false
        try {
            gameThread?.join(500)
        } catch (_: InterruptedException) {}
        gameThread = null
    }

    override fun run() {
        while (isRunning) {
            val timestamp = System.nanoTime() / 1_000_000L
            engine.update(timestamp)
            draw()
        }
    }

    private fun draw() {
        val canvas: Canvas
        try {
            canvas = holder.lockCanvas() ?: return
        } catch (e: Exception) {
            return
        }

        try {
            canvas.save()
            canvas.scale(scaleX, scaleY)

            // Clear
            canvas.drawColor(Color.parseColor("#1B1520"))

            // Draw layers
            backgroundRenderer.draw(canvas, engine)
            drawPlatforms(canvas)
            drawShards(canvas)
            characterRenderer.draw(canvas, engine.player)
            drawParticles(canvas)
            hudRenderer.draw(canvas, engine)

            canvas.restore()
        } finally {
            try {
                holder.unlockCanvasAndPost(canvas)
            } catch (_: Exception) {}
        }
    }

    private fun drawPlatforms(canvas: Canvas) {
        for (platform in engine.platforms) {
            backgroundRenderer.drawPlatform(canvas, platform)
        }
    }

    private fun drawShards(canvas: Canvas) {
        for (shard in engine.shards) {
            if (!shard.collected) {
                backgroundRenderer.drawShard(canvas, shard)
            }
        }
    }

    private fun drawParticles(canvas: Canvas) {
        for (particle in engine.particles) {
            val alpha = ((particle.life / particle.maxLife) * 255).toInt().coerceIn(0, 255)
            val paint = android.graphics.Paint().apply {
                color = particle.color
                this.alpha = alpha
                isAntiAlias = true
            }
            canvas.drawCircle(particle.x, particle.y, particle.radius, paint)
        }
    }

    // Touch regions
    private val pauseButtonRect = RectF(
        GameConstants.CANVAS_WIDTH - 50f, 0f,
        GameConstants.CANVAS_WIDTH, 50f
    )

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action != MotionEvent.ACTION_DOWN) return true

        val touchX = event.x / scaleX
        val touchY = event.y / scaleY

        when (engine.state) {
            GameState.PLAYING -> {
                // Check pause button
                if (pauseButtonRect.contains(touchX, touchY)) {
                    pauseGame()
                } else {
                    engine.jump()
                }
            }
            GameState.PAUSED -> {
                // Resume on any touch (HudRenderer handles the overlay)
                resumeGame()
            }
            GameState.GAME_OVER -> {
                // Restart the same level
                val cfg = engine.levelConfig
                if (cfg != null) {
                    startLevel(cfg.chapter, cfg.level)
                }
            }
            GameState.RESULT -> {
                // Record result and go to next level
                val cfg = engine.levelConfig
                if (cfg != null) {
                    levelManager.recordLevelResult(
                        cfg.chapter, cfg.level,
                        engine.score, engine.shardsCollected, engine.player.lives
                    )
                    // Advance to next level
                    if (cfg.level < 10) {
                        startLevel(cfg.chapter, cfg.level + 1)
                    } else if (cfg.chapter < 10) {
                        startLevel(cfg.chapter + 1, 1)
                    } else {
                        // Game complete, go to menu
                        onNavigateToMenu?.invoke()
                    }
                }
            }
            else -> {}
        }
        return true
    }
}
