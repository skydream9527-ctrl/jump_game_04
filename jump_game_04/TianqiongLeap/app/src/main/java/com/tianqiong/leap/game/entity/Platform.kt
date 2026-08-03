package com.tianqiong.leap.game.entity

data class Platform(
    var x: Float,
    var y: Float,
    val width: Float,
    val height: Float = 20f,
    var passed: Boolean = false
) {
    val right: Float get() = x + width
    val top: Float get() = y
}
