package com.tianqiong.leap.game.entity

data class Shard(
    var x: Float,
    var y: Float,
    val size: Float = 16f,
    var collected: Boolean = false,
    var rotation: Float = 0f
) {
    fun update(deltaNormalized: Float, speed: Float) {
        x -= speed * deltaNormalized
        rotation += 3f * deltaNormalized
    }
}
