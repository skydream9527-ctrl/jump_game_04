package com.tianqiong.leap.game.entity

data class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var life: Float,
    val maxLife: Float,
    val radius: Float,
    val color: Int
) {
    val isDead: Boolean get() = life <= 0f

    fun update(deltaNormalized: Float) {
        x += vx * deltaNormalized
        vy += 0.16f * deltaNormalized
        y += vy * deltaNormalized
        life -= deltaNormalized
    }
}
