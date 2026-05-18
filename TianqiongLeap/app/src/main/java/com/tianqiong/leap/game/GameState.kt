package com.tianqiong.leap.game

enum class GameState {
    MENU,       // Main menu, game not running
    PLAYING,    // Active gameplay
    PAUSED,     // Game paused
    GAME_OVER,  // Player died
    RESULT      // Level completed, showing results
}
