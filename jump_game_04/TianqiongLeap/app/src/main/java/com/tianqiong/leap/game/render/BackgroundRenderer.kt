package com.tianqiong.leap.game.render

import android.graphics.*
import com.tianqiong.leap.game.GameConstants
import com.tianqiong.leap.game.GameEngine
import com.tianqiong.leap.game.entity.Platform
import com.tianqiong.leap.game.entity.Shard

class BackgroundRenderer {

    private val skyPaint = Paint().apply {
        shader = LinearGradient(
            0f, 0f, 0f, GameConstants.CANVAS_HEIGHT,
            intArrayOf(
                Color.parseColor("#1a1a2e"),
                Color.parseColor("#16213e"),
                Color.parseColor("#0f3460")
            ),
            floatArrayOf(0f, 0.5f, 1f),
            Shader.TileMode.CLAMP
        )
    }

    private val mountainPaint = Paint().apply {
        color = Color.parseColor("#0d1f3c")
        isAntiAlias = true
    }

    private val mountainPaint2 = Paint().apply {
        color = Color.parseColor("#0b1a30")
        isAntiAlias = true
    }

    private val groundPaint = Paint().apply {
        color = Color.parseColor("#2a3040")
    }

    private val groundHighlight = Paint().apply {
        color = Color.parseColor("#c0c0c0")
        alpha = 40
        strokeWidth = 2f
    }

    private val platformTopPaint = Paint().apply {
        color = Color.parseColor("#8ec5d6")
        isAntiAlias = true
    }

    private val platformBodyPaint = Paint().apply {
        color = Color.parseColor("#1e3045")
        isAntiAlias = true
    }

    private val platformBorderPaint = Paint().apply {
        color = Color.parseColor("#3a5060")
        style = Paint.Style.STROKE
        strokeWidth = 1f
        isAntiAlias = true
    }

    private val shardPaint = Paint().apply {
        color = Color.parseColor("#ffd980")
        isAntiAlias = true
    }

    private val shardGlowPaint = Paint().apply {
        color = Color.parseColor("#ffd980")
        alpha = 80
        isAntiAlias = true
        maskFilter = BlurMaskFilter(8f, BlurMaskFilter.Blur.NORMAL)
    }

    private val starPaint = Paint().apply {
        color = Color.WHITE
        isAntiAlias = true
    }

    // Random stars
    private data class Star(val x: Float, val y: Float, val size: Float, val alpha: Int)
    private val stars = List(40) {
        Star(
            x = (Math.random() * GameConstants.CANVAS_WIDTH).toFloat(),
            y = (Math.random() * GameConstants.CANVAS_HEIGHT * 0.6).toFloat(),
            size = (Math.random() * 1.5 + 0.5).toFloat(),
            alpha = (Math.random() * 128 + 30).toInt()
        )
    }

    fun draw(canvas: Canvas, engine: GameEngine) {
        // Sky gradient
        canvas.drawRect(0f, 0f, GameConstants.CANVAS_WIDTH, GameConstants.CANVAS_HEIGHT, skyPaint)

        // Stars
        for (star in stars) {
            starPaint.alpha = star.alpha
            canvas.drawCircle(star.x, star.y, star.size, starPaint)
        }

        // Mountains (parallax)
        drawMountains(canvas, engine.mountainPositions)

        // Ground
        val groundY = GameConstants.CANVAS_HEIGHT * 0.88f
        canvas.drawRect(0f, groundY, GameConstants.CANVAS_WIDTH, GameConstants.CANVAS_HEIGHT, groundPaint)
        canvas.drawLine(0f, groundY, GameConstants.CANVAS_WIDTH, groundY, groundHighlight)
    }

    private fun drawMountains(canvas: Canvas, positions: List<Float>) {
        val baseY = GameConstants.CANVAS_HEIGHT * 0.7f

        for ((i, x) in positions.withIndex()) {
            val paint = if (i % 2 == 0) mountainPaint else mountainPaint2
            val path = Path()
            path.moveTo(x - 200f, baseY + 60f)
            path.lineTo(x - 80f, baseY - 80f)
            path.lineTo(x + 20f, baseY - 30f)
            path.lineTo(x + 100f, baseY - 120f)
            path.lineTo(x + 200f, baseY - 50f)
            path.lineTo(x + 300f, baseY + 60f)
            path.close()
            canvas.drawPath(path, paint)
        }
    }

    fun drawPlatform(canvas: Canvas, platform: Platform) {
        // Body
        canvas.drawRect(platform.x, platform.y, platform.right, platform.y + platform.height, platformBodyPaint)

        // Top surface
        canvas.drawRect(platform.x, platform.y, platform.right, platform.y + 5f, platformTopPaint)

        // Border
        canvas.drawRect(platform.x, platform.y, platform.right, platform.y + platform.height, platformBorderPaint)
    }

    fun drawShard(canvas: Canvas, shard: Shard) {
        canvas.save()
        canvas.rotate(shard.rotation, shard.x, shard.y)

        // Glow
        canvas.drawCircle(shard.x, shard.y, shard.size * 0.8f, shardGlowPaint)

        // Star shape
        val path = Path()
        val r = shard.size / 2
        for (i in 0 until 5) {
            val angle = Math.toRadians((i * 72 - 90).toDouble())
            val px = (shard.x + r * Math.cos(angle)).toFloat()
            val py = (shard.y + r * Math.sin(angle)).toFloat()
            if (i == 0) path.moveTo(px, py) else path.lineTo(px, py)

            val innerAngle = Math.toRadians((i * 72 + 36 - 90).toDouble())
            val innerR = r * 0.4f
            val ipx = (shard.x + innerR * Math.cos(innerAngle)).toFloat()
            val ipy = (shard.y + innerR * Math.sin(innerAngle)).toFloat()
            path.lineTo(ipx, ipy)
        }
        path.close()
        canvas.drawPath(path, shardPaint)

        canvas.restore()
    }
}
