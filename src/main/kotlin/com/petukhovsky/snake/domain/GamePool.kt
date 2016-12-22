package com.petukhovsky.snake.domain

import com.petukhovsky.services.TelegramService
import com.petukhovsky.snake.game.Game
import com.petukhovsky.snake.game.VERSION
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import javax.annotation.PreDestroy

@Service
open class GamePool @Autowired constructor(
        val configService: SnakeConfigService,
        val telegram: TelegramService
) {

    init {
        telegram.send("snake.game", "Server $VERSION is staring...")
    }

    val map = mutableMapOf<String, Game>()

    operator fun get(name: String): Game {
        synchronized(this) {
            if (name in map) return map[name]!!
            val config = configService.getConfigByName(name) ?: throw IllegalAccessException("Config not found")
            val game = Game(config, telegram)
            map[name] = game
            return game
        }
    }

    @PreDestroy
    fun destroy() {
        telegram.send("snake.game", "Server is shutting down!")
    }
}