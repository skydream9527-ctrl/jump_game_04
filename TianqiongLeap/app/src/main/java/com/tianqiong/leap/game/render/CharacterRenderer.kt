package com.tianqiong.leap.game.render

import android.graphics.*
import com.tianqiong.leap.game.CharacterType
import com.tianqiong.leap.game.entity.Player

class CharacterRenderer {

    private val eyeWhitePaint = Paint().apply { color = Color.WHITE; isAntiAlias = true }
    private val shadowPaint = Paint().apply {
        color = Color.argb(50, 100, 150, 200); isAntiAlias = true
        maskFilter = BlurMaskFilter(10f, BlurMaskFilter.Blur.NORMAL)
    }

    // Cache paints per character type
    private val paintCache = mutableMapOf<CharacterType, CharPaints>()

    private data class CharPaints(
        val body: Paint,
        val accent: Paint,
        val skin: Paint,
        val hair: Paint,
        val eye: Paint,
        val glow: Paint,
        val glowBright: Paint,
        val boot: Paint,
        val belt: Paint
    )

    private fun getPaints(type: CharacterType): CharPaints {
        return paintCache.getOrPut(type) {
            val bodyCol = Color.parseColor(type.bodyColor)
            val accentCol = Color.parseColor(type.accentColor)
            val skinCol = Color.parseColor(type.skinColor)
            val hairCol = Color.parseColor(type.hairColor)
            val eyeCol = Color.parseColor(type.eyeColor)
            val glowCol = Color.parseColor(type.glowColor)

            CharPaints(
                body = Paint().apply { color = bodyCol; isAntiAlias = true },
                accent = Paint().apply { color = accentCol; isAntiAlias = true },
                skin = Paint().apply { color = skinCol; isAntiAlias = true },
                hair = Paint().apply { color = hairCol; isAntiAlias = true },
                eye = Paint().apply { color = eyeCol; isAntiAlias = true },
                glow = Paint().apply { color = glowCol; isAntiAlias = true },
                glowBright = Paint().apply {
                    color = glowCol; alpha = 40; isAntiAlias = true
                    maskFilter = BlurMaskFilter(6f, BlurMaskFilter.Blur.NORMAL)
                },
                boot = Paint().apply {
                    color = blendColor(bodyCol, Color.BLACK, 0.4f); isAntiAlias = true
                },
                belt = Paint().apply { color = accentCol; isAntiAlias = true }
            )
        }
    }

    fun draw(canvas: Canvas, player: Player) {
        if (!player.isAlive) return

        val p = getPaints(player.characterType)

        canvas.save()
        canvas.translate(player.x, player.y)

        val w = player.width
        val h = player.height
        val s = w / 28f

        // Shadow
        shadowPaint.color = Color.parseColor(player.characterType.glowColor).let {
            Color.argb(30, Color.red(it), Color.green(it), Color.blue(it))
        }
        canvas.drawOval(w * 0.1f, h - 2f, w * 0.9f, h + 2f, shadowPaint)

        // Boots
        canvas.drawRoundRect(w * 0.1f, h * 0.87f, w * 0.4f, h, 2f * s, 2f * s, p.boot)
        canvas.drawRoundRect(w * 0.6f, h * 0.87f, w * 0.9f, h, 2f * s, 2f * s, p.boot)

        // Legs
        canvas.drawRoundRect(w * 0.15f, h * 0.65f, w * 0.38f, h * 0.9f, 3f * s, 3f * s, p.body)
        canvas.drawRoundRect(w * 0.62f, h * 0.65f, w * 0.85f, h * 0.9f, 3f * s, 3f * s, p.body)

        // Body
        canvas.drawRoundRect(w * 0.05f, h * 0.3f, w * 0.95f, h * 0.7f, 6f * s, 6f * s, p.body)

        // Chest armor
        val chestPath = Path()
        chestPath.moveTo(w * 0.3f, h * 0.35f)
        chestPath.lineTo(w * 0.5f, h * 0.3f)
        chestPath.lineTo(w * 0.7f, h * 0.35f)
        chestPath.lineTo(w * 0.65f, h * 0.5f)
        chestPath.lineTo(w * 0.35f, h * 0.5f)
        chestPath.close()
        canvas.drawPath(chestPath, p.accent)

        // Core glow
        canvas.drawCircle(w * 0.5f, h * 0.42f, 5f * s, p.glowBright)
        canvas.drawCircle(w * 0.5f, h * 0.42f, 3f * s, p.glow)

        // Shoulder pads
        canvas.drawRoundRect(-2f * s, h * 0.3f, w * 0.2f, h * 0.38f, 3f * s, 3f * s, p.accent)
        canvas.drawRoundRect(w * 0.8f, h * 0.3f, w + 2f * s, h * 0.38f, 3f * s, 3f * s, p.accent)

        // Arms
        canvas.drawRoundRect(-3f * s, h * 0.38f, w * 0.12f, h * 0.65f, 3f * s, 3f * s, p.body)
        canvas.drawRoundRect(w * 0.88f, h * 0.38f, w + 3f * s, h * 0.65f, 3f * s, 3f * s, p.body)

        // Belt
        canvas.drawRoundRect(w * 0.1f, h * 0.62f, w * 0.9f, h * 0.66f, 2f * s, 2f * s, p.accent)
        canvas.drawRoundRect(w * 0.42f, h * 0.6f, w * 0.58f, h * 0.68f, 2f * s, 2f * s, p.belt)

        // Neck
        canvas.drawRoundRect(w * 0.38f, h * 0.22f, w * 0.62f, h * 0.32f, 3f * s, 3f * s, p.skin)

        // Head
        canvas.drawOval(w * 0.2f, h * 0.05f, w * 0.8f, h * 0.28f, p.skin)

        // Hair (style varies by character)
        when (player.characterType) {
            CharacterType.LING -> drawHairLing(canvas, w, h, s, p)
            CharacterType.ZERO -> drawHairZero(canvas, w, h, s, p)
            CharacterType.ECHO -> drawHairEcho(canvas, w, h, s, p)
            CharacterType.GALE -> drawHairGale(canvas, w, h, s, p)
        }

        // Eyes
        canvas.drawOval(w * 0.3f, h * 0.17f, w * 0.42f, h * 0.22f, eyeWhitePaint)
        canvas.drawOval(w * 0.58f, h * 0.17f, w * 0.7f, h * 0.22f, eyeWhitePaint)
        canvas.drawCircle(w * 0.37f, h * 0.195f, 2f * s, p.eye)
        canvas.drawCircle(w * 0.63f, h * 0.195f, 2f * s, p.eye)
        // Eye highlights
        canvas.drawCircle(w * 0.39f, h * 0.185f, 0.8f * s, eyeWhitePaint)
        canvas.drawCircle(w * 0.65f, h * 0.185f, 0.8f * s, eyeWhitePaint)

        // Energy arm bands
        canvas.drawRoundRect(-3f * s, h * 0.5f, w * 0.12f, h * 0.53f, 1f * s, 1f * s, p.belt)
        canvas.drawRoundRect(w * 0.88f, h * 0.5f, w + 3f * s, h * 0.53f, 1f * s, 1f * s, p.belt)

        // Character-specific details
        when (player.characterType) {
            CharacterType.ZERO -> drawDetailsZero(canvas, w, h, s, p)
            CharacterType.ECHO -> drawDetailsEcho(canvas, w, h, s, p)
            CharacterType.GALE -> drawDetailsGale(canvas, w, h, s, p)
            else -> {}
        }

        canvas.restore()
    }

    private fun drawHairLing(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        canvas.drawOval(w * 0.18f, h * 0.0f, w * 0.82f, h * 0.16f, p.hair)
        canvas.drawRoundRect(w * 0.15f, h * 0.08f, w * 0.3f, h * 0.2f, 3f * s, 3f * s, p.hair)
        canvas.drawRoundRect(w * 0.7f, h * 0.08f, w * 0.85f, h * 0.2f, 3f * s, 3f * s, p.hair)
        // Goggles on forehead
        canvas.drawRoundRect(w * 0.22f, h * 0.1f, w * 0.78f, h * 0.15f, 3f * s, 3f * s, p.accent)
        canvas.drawRoundRect(w * 0.25f, h * 0.11f, w * 0.45f, h * 0.14f, 2f * s, 2f * s, p.glow)
        canvas.drawRoundRect(w * 0.55f, h * 0.11f, w * 0.75f, h * 0.14f, 2f * s, 2f * s, p.glow)
    }

    private fun drawHairZero(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        // Sleek metallic head with antenna
        canvas.drawOval(w * 0.18f, h * 0.0f, w * 0.82f, h * 0.14f, p.hair)
        // Antenna
        canvas.drawLine(w * 0.5f, h * 0.0f, w * 0.5f, h * -0.08f, Paint().apply {
            color = p.glow.color; strokeWidth = 1.5f * s; isAntiAlias = true
        })
        canvas.drawCircle(w * 0.5f, h * -0.08f, 1.5f * s, p.glow)
        // Visor line
        canvas.drawRoundRect(w * 0.2f, h * 0.14f, w * 0.8f, h * 0.17f, 2f * s, 2f * s, p.glow)
    }

    private fun drawHairEcho(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        // Long flowing silver hair
        canvas.drawOval(w * 0.15f, h * -0.02f, w * 0.85f, h * 0.18f, p.hair)
        // Side flowing hair
        canvas.drawRoundRect(w * 0.08f, h * 0.1f, w * 0.25f, h * 0.4f, 4f * s, 4f * s, p.hair)
        canvas.drawRoundRect(w * 0.75f, h * 0.1f, w * 0.92f, h * 0.4f, 4f * s, 4f * s, p.hair)
        // Energy markings on forehead
        canvas.drawCircle(w * 0.5f, h * 0.08f, 2f * s, p.glow)
    }

    private fun drawHairGale(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        // Short spiky dark hair
        canvas.drawOval(w * 0.2f, h * 0.0f, w * 0.8f, h * 0.12f, p.hair)
        // Spikes
        val spikePaint = Paint().apply { color = p.hair.color; isAntiAlias = true }
        for (i in 0 until 3) {
            val sx = w * 0.3f + i * w * 0.15f
            canvas.drawRoundRect(sx, h * -0.04f, sx + w * 0.08f, h * 0.08f, 2f * s, 2f * s, spikePaint)
        }
    }

    private fun drawDetailsZero(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        // Circuit lines on body
        val linePaint = Paint().apply {
            color = p.glow.color; alpha = 120; strokeWidth = 0.8f * s
            style = Paint.Style.STROKE; isAntiAlias = true
        }
        canvas.drawLine(w * 0.2f, h * 0.4f, w * 0.2f, h * 0.6f, linePaint)
        canvas.drawLine(w * 0.8f, h * 0.4f, w * 0.8f, h * 0.6f, linePaint)
        canvas.drawLine(w * 0.35f, h * 0.45f, w * 0.65f, h * 0.45f, linePaint)
    }

    private fun drawDetailsEcho(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        // Energy veins on arms
        val veinPaint = Paint().apply {
            color = p.glow.color; alpha = 80; strokeWidth = 1f * s
            style = Paint.Style.STROKE; isAntiAlias = true
        }
        canvas.drawLine(-1f * s, h * 0.4f, -1f * s, h * 0.6f, veinPaint)
        canvas.drawLine(w + 1f * s, h * 0.4f, w + 1f * s, h * 0.6f, veinPaint)
    }

    private fun drawDetailsGale(canvas: Canvas, w: Float, h: Float, s: Float, p: CharPaints) {
        // Mechanical joints
        val jointPaint = Paint().apply {
            color = p.accent.color; isAntiAlias = true
        }
        canvas.drawCircle(w * 0.25f, h * 0.55f, 2f * s, jointPaint)
        canvas.drawCircle(w * 0.75f, h * 0.55f, 2f * s, jointPaint)
        // Red eye visor glow
        val visorPaint = Paint().apply {
            color = p.eye.color; alpha = 60; isAntiAlias = true
            maskFilter = BlurMaskFilter(4f, BlurMaskFilter.Blur.NORMAL)
        }
        canvas.drawRoundRect(w * 0.28f, h * 0.17f, w * 0.72f, h * 0.22f, 2f * s, 2f * s, visorPaint)
    }

    private fun blendColor(c1: Int, c2: Int, ratio: Float): Int {
        val r = (Color.red(c1) * (1 - ratio) + Color.red(c2) * ratio).toInt()
        val g = (Color.green(c1) * (1 - ratio) + Color.green(c2) * ratio).toInt()
        val b = (Color.blue(c1) * (1 - ratio) + Color.blue(c2) * ratio).toInt()
        return Color.rgb(r, g, b)
    }
}
