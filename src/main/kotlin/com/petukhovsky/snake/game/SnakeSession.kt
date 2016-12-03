package com.petukhovsky.snake.game

import com.fasterxml.jackson.module.kotlin.readValue
import com.petukhovsky.services.objectMapper
import com.petukhovsky.snake.game.Game
import com.petukhovsky.snake.prot.*
import com.petukhovsky.snake.util.getDirectionFromInt
import java.io.Closeable

abstract class SnakeSession(game: Game): Closeable {

    val player by lazy { SnakePlayer(this, game) }

    fun init() = player

    fun onMessage(message: String) {
        val msg = objectMapper.readValue<PlayerMessage>(message)
        when (msg) {
            is JoinMessage -> player.join(msg.nick)
            is LeaveMessage -> player.leave()
            is TurnMessage -> player.changeDirection(msg.dir)
            is ChatMessage -> {
                //TODO
            }
        }
    }

    override fun close() {
        player.destroy();
    }

    abstract fun sendString(message: String)
}