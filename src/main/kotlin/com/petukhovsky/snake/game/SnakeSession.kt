package com.petukhovsky.snake.game

import com.petukhovsky.snake.game.Game
import com.petukhovsky.snake.util.getDirectionFromInt
import java.io.Closeable

abstract class SnakeSession(game: Game): Closeable {

    val player by lazy { SnakePlayer(this, game) }

    fun init() = player

    fun onMessage(message: String) {
        if (message.startsWith("5")) player.join(message.substring(1))
        else {
            val i = message.toInt()
            when (i) {
                4 -> player.leave()
                in 0..3 -> player.changeDirection(getDirectionFromInt(i))
            }
        }
    }

    override fun close() {
        player.destroy();
    }


    abstract fun sendString(message: String)
}