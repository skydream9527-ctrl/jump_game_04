package com.tianqiong.leap.game.entity

import com.tianqiong.leap.game.CharacterType
import com.tianqiong.leap.game.GameConstants

data class Player(
    var x: Float = 80f,
    var y: Float = 300f,
    var velocityY: Float = 0f,
    var width: Float = 28f * GameConstants.WORLD_SCALE,
    var height: Float = 38f * GameConstants.WORLD_SCALE,
    var jumpCount: Int = 0,
    var isGrounded: Boolean = false,
    var lives: Int = 3,
    var isAlive: Boolean = true,
    var characterType: CharacterType = CharacterType.LING
) {
    val jumpForce: Float get() = GameConstants.JUMP_FORCE * characterType.jumpMultiplier
    val doubleJumpMultiplier: Float get() = GameConstants.DOUBLE_JUMP_MULTIPLIER

    fun reset() {
        x = 80f
        y = 300f
        velocityY = 0f
        jumpCount = 0
        isGrounded = false
        lives = 3
        isAlive = true
    }

    fun jump() {
        if (!isAlive) return
        if (jumpCount >= 2) return

        velocityY = if (jumpCount == 0) {
            jumpForce
        } else {
            jumpForce * doubleJumpMultiplier
        }
        jumpCount++
        isGrounded = false
    }

    fun update(deltaNormalized: Float) {
        if (!isAlive) return

        // Apply gravity
        velocityY += GameConstants.GRAVITY * deltaNormalized
        y += velocityY * deltaNormalized
    }

    val bottom: Float get() = y + height
    val centerX: Float get() = x + width / 2
    val centerY: Float get() = y + height / 2
}
