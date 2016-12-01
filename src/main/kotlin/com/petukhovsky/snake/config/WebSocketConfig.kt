package com.petukhovsky.snake.config

import com.petukhovsky.snake.domain.ConfigService
import com.petukhovsky.snake.domain.GamePool
import com.petukhovsky.snake.ws.SnakeHandler
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
open class WebSocketConfig @Autowired constructor(
        val configService: ConfigService,
        val gamePool: GamePool
) : WebSocketConfigurer {

    val log = LoggerFactory.getLogger(javaClass)

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        for ((name) in configService.snakeConfigs) {
            val path = "/snake/ws/$name"
            log.info("Mapping \"$path\" to snake game")
            registry.addHandler(SnakeHandler(gamePool[name]), path).setAllowedOrigins("*")
        }
    }

}