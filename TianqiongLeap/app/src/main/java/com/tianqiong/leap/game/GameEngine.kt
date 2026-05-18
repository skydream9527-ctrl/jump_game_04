package com.tianqiong.leap.game

import com.tianqiong.leap.game.entity.*
import com.tianqiong.leap.game.level.LevelConfig
import kotlin.math.max
import kotlin.random.Random

class GameEngine {

    var state: GameState = GameState.MENU
        private set

    var score: Int = 0
        private set
    var bestScore: Int = 0
    var shardsCollected: Int = 0
        private set
    var totalShards: Int = 0
        private set
    var speed: Float = GameConstants.STARTING_SPEED
        private set

    var levelConfig: LevelConfig? = null
        private set
    var distance: Float = 0f
        private set
    var targetDistance: Float = 0f
        private set

    val player = Player()
    val platforms = mutableListOf<Platform>()
    val particles = mutableListOf<Particle>()
    val shards = mutableListOf<Shard>()

    private var lastTimestamp: Long = 0L
    private var shardsSpawned: Int = 0

    // Background parallax elements
    val cloudPositions = mutableListOf<Float>()
    val mountainPositions = mutableListOf<Float>()

    interface Listener {
        fun onScoreChanged(score: Int)
        fun onShardCollected(total: Int)
        fun onGameOver()
        fun onLevelComplete()
    }

    var listener: Listener? = null

    fun init() {
        resetState()
    }

    fun startLevel(config: LevelConfig, characterType: CharacterType = CharacterType.LING) {
        levelConfig = config
        targetDistance = config.targetDistance
        speed = GameConstants.STARTING_SPEED * config.speedMultiplier * characterType.speedMultiplier
        player.characterType = characterType
        resetState()
        state = GameState.PLAYING
    }

    private fun resetState() {
        player.reset()
        platforms.clear()
        particles.clear()
        shards.clear()
        score = 0
        distance = 0f
        shardsCollected = 0
        totalShards = levelConfig?.shardCount ?: 3
        shardsSpawned = 0
        lastTimestamp = 0L

        // Generate initial platforms
        generateInitialPlatforms()

        // Initialize parallax
        cloudPositions.clear()
        mountainPositions.clear()
        repeat(3) { cloudPositions.add(Random.nextFloat() * GameConstants.CANVAS_WIDTH) }
        repeat(3) { mountainPositions.add(Random.nextFloat() * GameConstants.CANVAS_WIDTH) }
    }

    fun pause() {
        if (state == GameState.PLAYING) {
            state = GameState.PAUSED
        }
    }

    fun resume() {
        if (state == GameState.PAUSED) {
            lastTimestamp = 0L
            state = GameState.PLAYING
        }
    }

    fun jump() {
        if (state == GameState.PLAYING) {
            player.jump()
            spawnJumpParticles()
        }
    }

    fun update(timestamp: Long) {
        if (state != GameState.PLAYING) return

        if (lastTimestamp == 0L) {
            lastTimestamp = timestamp
            return
        }

        val deltaMs = (timestamp - lastTimestamp).coerceAtMost(32L).toFloat()
        lastTimestamp = timestamp
        val normalized = deltaMs / 16.67f

        // Update speed
        val cfg = levelConfig
        val maxSpeed = GameConstants.MAX_SPEED * (cfg?.speedMultiplier ?: 1f)
        speed = maxSpeed.coerceAtMost(speed + GameConstants.SPEED_RAMP * normalized)

        // Update player
        player.update(normalized)

        // Update distance
        distance += speed * normalized

        // Move platforms
        for (platform in platforms) {
            platform.x -= speed * normalized
        }

        // Move shards
        for (shard in shards) {
            if (!shard.collected) {
                shard.update(normalized, speed)
            }
        }

        // Update parallax
        for (i in cloudPositions.indices) {
            cloudPositions[i] -= speed * GameConstants.PARALLAX_CLOUDS * normalized
            if (cloudPositions[i] < -100f) {
                cloudPositions[i] = GameConstants.CANVAS_WIDTH + Random.nextFloat() * 200f
            }
        }
        for (i in mountainPositions.indices) {
            mountainPositions[i] -= speed * GameConstants.PARALLAX_MOUNTAINS * normalized
            if (mountainPositions[i] < -200f) {
                mountainPositions[i] = GameConstants.CANVAS_WIDTH + Random.nextFloat() * 300f
            }
        }

        // Collision detection
        checkCollisions(normalized)

        // Check shard collection
        checkShardCollection()

        // Check death
        if (player.y > GameConstants.DEATH_THRESHOLD) {
            onPlayerFall()
        }

        // Update particles
        for (particle in particles) {
            particle.update(normalized)
        }
        particles.removeAll { it.isDead }

        // Cull off-screen platforms
        platforms.removeAll { it.right < GameConstants.PLATFORM_CULL_X }
        shards.removeAll { it.x < GameConstants.PLATFORM_CULL_X - 50f }

        // Ensure platforms ahead (but not past level end)
        if (distance < targetDistance) {
            ensurePlatforms()
        }

        // Update score
        val platformScore = platforms.count { it.passed } * GameConstants.SCORE_PER_PLATFORM
        val distanceScore = (distance / GameConstants.DISTANCE_SCORE_DIVISOR).toInt()
        score = max(score, max(platformScore, distanceScore))

        // Check win condition
        if (distance >= targetDistance && state == GameState.PLAYING) {
            state = GameState.RESULT
            if (score > bestScore) bestScore = score
            listener?.onLevelComplete()
        }

        listener?.onScoreChanged(score)
    }

    private fun checkCollisions(normalized: Float) {
        var landed = false

        for (platform in platforms) {
            // Mark as passed
            if (!platform.passed && platform.right < player.x) {
                platform.passed = true
            }

            // Collision check
            val playerBottom = player.bottom
            val previousBottom = playerBottom - player.velocityY * normalized
            val withinX = player.x + GameConstants.COLLISION_X_INSET < platform.right &&
                    player.x + player.width - GameConstants.COLLISION_X_INSET > platform.x

            if (player.velocityY >= 0 &&
                previousBottom <= platform.top &&
                playerBottom >= platform.top &&
                withinX
            ) {
                // Land on platform
                player.y = platform.top - player.height
                player.velocityY = 0f
                player.isGrounded = true
                player.jumpCount = 0
                landed = true
                spawnLandParticles()
            }
        }

        // Auto-detect walking off platform edge
        if (!landed && player.jumpCount == 0 && player.y < GameConstants.CANVAS_HEIGHT * 0.8f) {
            player.jumpCount = 1
            player.isGrounded = false
        }
    }

    private fun checkShardCollection() {
        for (shard in shards) {
            if (shard.collected) continue
            val dx = player.centerX - shard.x
            val dy = player.centerY - shard.y
            val dist = Math.sqrt((dx * dx + dy * dy).toDouble()).toFloat()
            if (dist < shard.size + player.width * 0.5f) {
                shard.collected = true
                shardsCollected++
                listener?.onShardCollected(shardsCollected)
            }
        }
    }

    private fun onPlayerFall() {
        player.lives--
        if (player.lives <= 0) {
            player.isAlive = false
            state = GameState.GAME_OVER
            if (score > bestScore) bestScore = score
            listener?.onGameOver()
        } else {
            // Respawn on last platform
            val lastPlatform = platforms.lastOrNull { it.right < GameConstants.CANVAS_WIDTH }
            if (lastPlatform != null) {
                player.x = lastPlatform.x + lastPlatform.width / 2 - player.width / 2
                player.y = lastPlatform.top - player.height
            } else {
                player.x = 80f
                player.y = 300f
            }
            player.velocityY = 0f
            player.jumpCount = 0
            player.isGrounded = true
        }
    }

    private fun generateInitialPlatforms() {
        val cfg = levelConfig
        val gapMult = cfg?.platformGapMultiplier ?: 1f

        // First platform (wide, at start)
        platforms.add(Platform(x = 0f, y = 280f, width = 400f))

        var lastX = 400f
        for (i in 1 until GameConstants.INITIAL_PLATFORM_COUNT) {
            val gap = (GameConstants.PLATFORM_GAP_MIN + Random.nextFloat() *
                    (GameConstants.PLATFORM_GAP_MAX - GameConstants.PLATFORM_GAP_MIN)) * gapMult
            val width = GameConstants.PLATFORM_MIN_WIDTH + Random.nextFloat() *
                    (GameConstants.PLATFORM_MAX_WIDTH - GameConstants.PLATFORM_MIN_WIDTH)
            val y = GameConstants.PLATFORM_Y_MIN + Random.nextFloat() *
                    (GameConstants.PLATFORM_Y_MAX - GameConstants.PLATFORM_Y_MIN)
            val x = lastX + gap

            platforms.add(Platform(x = x, y = y, width = width))

            // Spawn shard (up to 3 per level)
            if (shardsSpawned < totalShards && Random.nextFloat() < 0.3f) {
                shards.add(Shard(x = x + width / 2, y = y - 30f))
                shardsSpawned++
            }

            lastX = x + width
        }
    }

    private fun ensurePlatforms() {
        val cfg = levelConfig
        val gapMult = cfg?.platformGapMultiplier ?: 1f

        while (platforms.isEmpty() || platforms.last().x + platforms.last().width < GameConstants.CANVAS_WIDTH + GameConstants.PLATFORM_SPAWN_BUFFER) {
            val last = platforms.lastOrNull() ?: break
            val gap = (GameConstants.PLATFORM_GAP_MIN + Random.nextFloat() *
                    (GameConstants.PLATFORM_GAP_MAX - GameConstants.PLATFORM_GAP_MIN)) * gapMult
            val width = GameConstants.PLATFORM_MIN_WIDTH + Random.nextFloat() *
                    (GameConstants.PLATFORM_MAX_WIDTH - GameConstants.PLATFORM_MIN_WIDTH)
            val y = GameConstants.PLATFORM_Y_MIN + Random.nextFloat() *
                    (GameConstants.PLATFORM_Y_MAX - GameConstants.PLATFORM_Y_MIN)
            val x = last.x + last.width + gap

            platforms.add(Platform(x = x, y = y, width = width))

            // Spawn shard (up to totalShards)
            if (shardsSpawned < totalShards && Random.nextFloat() < 0.25f) {
                shards.add(Shard(x = x + width / 2, y = y - 30f))
                shardsSpawned++
            }
        }
    }

    private fun spawnJumpParticles() {
        for (i in 0 until GameConstants.JUMP_PARTICLE_COUNT) {
            particles.add(
                Particle(
                    x = player.x + player.width / 2,
                    y = player.bottom,
                    vx = (Random.nextFloat() - 0.5f) * 4f,
                    vy = Random.nextFloat() * -3f,
                    life = 18f + Random.nextFloat() * 14f,
                    maxLife = 32f,
                    radius = 2f + Random.nextFloat() * 4f,
                    color = 0xFFFFE4B5.toInt()
                )
            )
        }
    }

    private fun spawnLandParticles() {
        for (i in 0 until GameConstants.LAND_PARTICLE_COUNT) {
            particles.add(
                Particle(
                    x = player.x + player.width / 2,
                    y = player.bottom,
                    vx = (Random.nextFloat() - 0.5f) * 3f,
                    vy = Random.nextFloat() * -2f,
                    life = 18f + Random.nextFloat() * 14f,
                    maxLife = 32f,
                    radius = 2f + Random.nextFloat() * 3f,
                    color = 0xFFFFFFFF.toInt()
                )
            )
        }
    }

    private val Player.centerY: Float get() = y + height / 2
}
