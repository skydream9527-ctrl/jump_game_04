package com.tianqiong.leap.game.render

import android.graphics.*
import com.tianqiong.leap.game.GameConstants
import com.tianqiong.leap.game.GameEngine
import com.tianqiong.leap.game.GameState

class HudRenderer {

    private val textPaint = Paint().apply {
        color = Color.parseColor("#ece2d0")
        textSize = 16f
        isAntiAlias = true
        typeface = Typeface.DEFAULT_BOLD
    }

    private val dimTextPaint = Paint().apply {
        color = Color.parseColor("#9e9486")
        textSize = 12f
        isAntiAlias = true
    }

    private val goldPaint = Paint().apply {
        color = Color.parseColor("#ffd980")
        textSize = 18f
        isAntiAlias = true
        typeface = Typeface.DEFAULT_BOLD
    }

    private val scorePaint = Paint().apply {
        color = Color.WHITE
        textSize = 22f
        isAntiAlias = true
        typeface = Typeface.DEFAULT_BOLD
    }

    private val heartPaint = Paint().apply {
        color = Color.parseColor("#e05555")
        isAntiAlias = true
        textSize = 16f
    }

    private val heartLostPaint = Paint().apply {
        color = Color.parseColor("#e05555")
        alpha = 50
        isAntiAlias = true
        textSize = 16f
    }

    private val shardIconPaint = Paint().apply {
        color = Color.parseColor("#ffd980")
        isAntiAlias = true
    }

    private val overlayPaint = Paint().apply {
        color = Color.argb(160, 10, 6, 20)
    }

    private val panelPaint = Paint().apply {
        color = Color.argb(200, 30, 22, 40)
        isAntiAlias = true
    }

    private val panelBorderPaint = Paint().apply {
        color = Color.parseColor("#c5a45a")
        style = Paint.Style.STROKE
        strokeWidth = 1.5f
        isAntiAlias = true
        alpha = 120
    }

    private val titlePaint = Paint().apply {
        color = Color.parseColor("#e8d5a3")
        textSize = 28f
        isAntiAlias = true
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
    }

    private val subtitlePaint = Paint().apply {
        color = Color.parseColor("#9e9486")
        textSize = 14f
        isAntiAlias = true
        textAlign = Paint.Align.CENTER
    }

    // Progress bar
    private val progressBgPaint = Paint().apply {
        color = Color.argb(80, 255, 255, 255)
        isAntiAlias = true
    }
    private val progressFillPaint = Paint().apply {
        color = Color.parseColor("#6bb8e8")
        isAntiAlias = true
    }

    // Pause button
    private val pausePaint = Paint().apply {
        color = Color.parseColor("#ece2d0")
        alpha = 150
        isAntiAlias = true
    }

    // Star rating
    private val starFilledPaint = Paint().apply {
        color = Color.parseColor("#ffd980")
        isAntiAlias = true
    }
    private val starEmptyPaint = Paint().apply {
        color = Color.parseColor("#4a4035")
        isAntiAlias = true
    }

    fun draw(canvas: Canvas, engine: GameEngine) {
        when (engine.state) {
            GameState.PLAYING -> drawHud(canvas, engine)
            GameState.PAUSED -> {
                drawHud(canvas, engine)
                drawPauseOverlay(canvas)
            }
            GameState.GAME_OVER -> drawGameOverOverlay(canvas, engine)
            GameState.RESULT -> drawResultOverlay(canvas, engine)
            else -> {}
        }
    }

    private fun drawHud(canvas: Canvas, engine: GameEngine) {
        val cw = GameConstants.CANVAS_WIDTH
        val ch = GameConstants.CANVAS_HEIGHT
        val padding = 12f

        // Lives (hearts)
        for (i in 0 until 3) {
            val paint = if (i < engine.player.lives) heartPaint else heartLostPaint
            canvas.drawText("♥", padding + i * 20f, padding + 16f, paint)
        }

        // Level tag
        val config = engine.levelConfig
        dimTextPaint.textSize = 11f
        val levelText = config?.displayName ?: ""
        val levelBg = RectF(padding - 4f, padding + 22f, padding + dimTextPaint.measureText(levelText) + 8f, padding + 38f)
        canvas.drawRoundRect(levelBg, 6f, 6f, Paint().apply { color = Color.argb(100, 0, 0, 0) })
        canvas.drawText(levelText, padding + 2f, padding + 34f, dimTextPaint)

        // Progress bar (below level tag)
        val barY = padding + 44f
        val barW = 120f
        val barH = 6f
        val barX = padding
        canvas.drawRoundRect(barX, barY, barX + barW, barY + barH, 3f, 3f, progressBgPaint)
        val progress = if (engine.targetDistance > 0) (engine.distance / engine.targetDistance).coerceIn(0f, 1f) else 0f
        canvas.drawRoundRect(barX, barY, barX + barW * progress, barY + barH, 3f, 3f, progressFillPaint)

        // Shard count (top right, left of pause button)
        val shardX = cw - padding - 110f
        val shardBg = RectF(shardX - 8f, padding - 2f, shardX + 70f, padding + 24f)
        canvas.drawRoundRect(shardBg, 8f, 8f, Paint().apply { color = Color.argb(120, 0, 0, 0) })

        // Shard icon (star shape)
        drawStarIcon(canvas, shardX + 4f, padding + 10f, 5f, shardIconPaint)

        goldPaint.textSize = 16f
        canvas.drawText("${engine.shardsCollected}", shardX + 18f, padding + 16f, goldPaint)
        dimTextPaint.textSize = 12f
        canvas.drawText(" / ${engine.totalShards}", shardX + 36f, padding + 16f, dimTextPaint)

        // Score
        scorePaint.textSize = 20f
        val scoreText = "%,d".format(engine.score)
        canvas.drawText(scoreText, cw - padding - scorePaint.measureText(scoreText), padding + 42f, scorePaint)

        // Pause button (top-right corner)
        val pauseX = cw - 35f
        val pauseY = 15f
        canvas.drawRect(pauseX, pauseY, pauseX + 5f, pauseY + 18f, pausePaint)
        canvas.drawRect(pauseX + 11f, pauseY, pauseX + 16f, pauseY + 18f, pausePaint)

        // Tap hint
        dimTextPaint.textSize = 10f
        canvas.drawText("TAP: 跳跃", padding, ch - padding, dimTextPaint)
    }

    private fun drawPauseOverlay(canvas: Canvas) {
        val cw = GameConstants.CANVAS_WIDTH
        val ch = GameConstants.CANVAS_HEIGHT

        canvas.drawRect(0f, 0f, cw, ch, overlayPaint)

        val panelW = 280f
        val panelH = 140f
        val panelX = (cw - panelW) / 2
        val panelY = (ch - panelH) / 2
        canvas.drawRoundRect(panelX, panelY, panelX + panelW, panelY + panelH, 16f, 16f, panelPaint)
        canvas.drawRoundRect(panelX, panelY, panelX + panelW, panelY + panelH, 16f, 16f, panelBorderPaint)

        titlePaint.textSize = 24f
        canvas.drawText("暂停", cw / 2, panelY + 50f, titlePaint)

        // Decorative line
        val linePaint = Paint().apply {
            color = Color.parseColor("#c5a45a"); alpha = 80; strokeWidth = 1f
        }
        canvas.drawLine(panelX + 60f, panelY + 65f, panelX + panelW - 60f, panelY + 65f, linePaint)

        subtitlePaint.textSize = 14f
        canvas.drawText("点击屏幕继续", cw / 2, panelY + 100f, subtitlePaint)
    }

    private fun drawGameOverOverlay(canvas: Canvas, engine: GameEngine) {
        val cw = GameConstants.CANVAS_WIDTH
        val ch = GameConstants.CANVAS_HEIGHT

        canvas.drawRect(0f, 0f, cw, ch, overlayPaint)

        val panelW = 300f
        val panelH = 200f
        val panelX = (cw - panelW) / 2
        val panelY = (ch - panelH) / 2
        canvas.drawRoundRect(panelX, panelY, panelX + panelW, panelY + panelH, 16f, 16f, panelPaint)
        canvas.drawRoundRect(panelX, panelY, panelX + panelW, panelY + panelH, 16f, 16f, panelBorderPaint)

        titlePaint.textSize = 24f
        canvas.drawText("游戏结束", cw / 2, panelY + 45f, titlePaint)

        goldPaint.textSize = 16f
        canvas.drawText("得分: %,d".format(engine.score), cw / 2, panelY + 80f, goldPaint.apply { textAlign = Paint.Align.CENTER })

        dimTextPaint.textSize = 13f
        canvas.drawText("最高: %,d".format(engine.bestScore), cw / 2, panelY + 100f, dimTextPaint.apply { textAlign = Paint.Align.CENTER })

        // Stars (none for game over)
        drawStarRow(canvas, cw / 2, panelY + 130f, 0)

        subtitlePaint.textSize = 14f
        canvas.drawText("点击屏幕重新开始", cw / 2, panelY + 170f, subtitlePaint)

        goldPaint.textAlign = Paint.Align.LEFT
        dimTextPaint.textAlign = Paint.Align.LEFT
    }

    private fun drawResultOverlay(canvas: Canvas, engine: GameEngine) {
        val cw = GameConstants.CANVAS_WIDTH
        val ch = GameConstants.CANVAS_HEIGHT

        canvas.drawRect(0f, 0f, cw, ch, overlayPaint)

        val panelW = 320f
        val panelH = 220f
        val panelX = (cw - panelW) / 2
        val panelY = (ch - panelH) / 2
        canvas.drawRoundRect(panelX, panelY, panelX + panelW, panelY + panelH, 16f, 16f, panelPaint)
        canvas.drawRoundRect(panelX, panelY, panelX + panelW, panelY + panelH, 16f, 16f, panelBorderPaint)

        titlePaint.textSize = 22f
        canvas.drawText("关卡通关！", cw / 2, panelY + 40f, titlePaint)

        // Calculate stars
        val stars = when {
            engine.shardsCollected >= 3 -> 3
            engine.shardsCollected >= 2 -> 2
            else -> 1
        }

        // Star rating
        drawStarRow(canvas, cw / 2, panelY + 70f, stars)

        // Score
        goldPaint.textSize = 16f
        canvas.drawText("得分: %,d".format(engine.score), cw / 2, panelY + 105f, goldPaint.apply { textAlign = Paint.Align.CENTER })

        // Shards
        dimTextPaint.textSize = 13f
        canvas.drawText("碎片: ${engine.shardsCollected} / ${engine.totalShards}", cw / 2, panelY + 125f, dimTextPaint.apply { textAlign = Paint.Align.CENTER })

        // Lives
        dimTextPaint.textSize = 13f
        canvas.drawText("剩余生命: ${engine.player.lives}", cw / 2, panelY + 145f, dimTextPaint)

        // Next level hint
        val config = engine.levelConfig
        val nextText = if (config != null) {
            if (config.level < 10) "点击进入第${config.level + 1}关"
            else if (config.chapter < 10) "点击进入第${config.chapter + 1}章"
            else "恭喜通全部！"
        } else ""

        subtitlePaint.textSize = 14f
        canvas.drawText(nextText, cw / 2, panelY + 185f, subtitlePaint)

        goldPaint.textAlign = Paint.Align.LEFT
        dimTextPaint.textAlign = Paint.Align.LEFT
    }

    private fun drawStarRow(canvas: Canvas, centerX: Float, y: Float, filledCount: Int) {
        val starSize = 14f
        val gap = 36f
        val startX = centerX - gap
        for (i in 0 until 3) {
            val x = startX + i * gap
            val paint = if (i < filledCount) starFilledPaint else starEmptyPaint
            drawStarIcon(canvas, x, y, starSize, paint)
        }
    }

    private fun drawStarIcon(canvas: Canvas, cx: Float, cy: Float, r: Float, paint: Paint) {
        val path = Path()
        for (i in 0 until 5) {
            val angle = Math.toRadians((i * 72 - 90).toDouble())
            val px = cx + r * Math.cos(angle).toFloat()
            val py = cy + r * Math.sin(angle).toFloat()
            if (i == 0) path.moveTo(px, py) else path.lineTo(px, py)
            val innerAngle = Math.toRadians((i * 72 + 36 - 90).toDouble())
            val ipx = cx + r * 0.4f * Math.cos(innerAngle).toFloat()
            val ipy = cy + r * 0.4f * Math.sin(innerAngle).toFloat()
            path.lineTo(ipx, ipy)
        }
        path.close()
        canvas.drawPath(path, paint)
    }
}
