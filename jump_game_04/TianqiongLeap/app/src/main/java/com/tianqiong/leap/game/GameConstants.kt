package com.tianqiong.leap.game

object GameConstants {
    // Physics (ported from JS engine)
    const val GRAVITY = 0.9f
    const val JUMP_FORCE = -16.8f
    const val DOUBLE_JUMP_MULTIPLIER = 0.92f

    // Speed
    const val STARTING_SPEED = 2.65f
    const val MAX_SPEED = 7.6f
    const val SPEED_RAMP = 0.0011f

    // Canvas logical size (landscape)
    const val CANVAS_WIDTH = 852f
    const val CANVAS_HEIGHT = 393f

    // Scale
    const val WORLD_SCALE = 0.74f

    // Platform generation
    const val PLATFORM_MIN_WIDTH = 120f * WORLD_SCALE
    const val PLATFORM_MAX_WIDTH = 220f * WORLD_SCALE
    const val PLATFORM_GAP_MIN = 68f
    const val PLATFORM_GAP_MAX = 122f
    const val PLATFORM_Y_MIN = 200f
    const val PLATFORM_Y_MAX = 320f
    const val PLATFORM_SPAWN_BUFFER = 420f
    const val PLATFORM_CULL_X = -100f

    // Initial platforms
    const val INITIAL_PLATFORM_COUNT = 7

    // Collision
    const val COLLISION_X_INSET = 10f

    // Death
    const val DEATH_THRESHOLD = CANVAS_HEIGHT + 80f

    // Scoring
    const val SCORE_PER_PLATFORM = 12
    const val DISTANCE_SCORE_DIVISOR = 18f

    // Particles
    const val PARTICLE_GRAVITY = 0.16f
    const val JUMP_PARTICLE_COUNT = 6
    const val LAND_PARTICLE_COUNT = 5

    // Parallax
    const val PARALLAX_CLOUDS = 0.22f
    const val PARALLAX_MOUNTAINS = 0.35f
}
