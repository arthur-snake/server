package com.petukhovsky.snake.domain

import com.petukhovsky.snake.game.Game
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
open class GamePool @Autowired constructor(
        val configService: ConfigService
) {
    val map = mutableMapOf<String, Game>()

    operator fun get(name: String): Game {
        synchronized(this) {
            if (name in map) return map[name]!!
            val config = configService.getConfigByName(name) ?: throw IllegalAccessException("Config not found")
            val game = Game(config)
            map[name] = game
            return game
        }
    }
}