package com.petukhovsky.snake.ws

import com.petukhovsky.snake.game.Game
import com.petukhovsky.snake.game.SnakePlayer
import com.petukhovsky.snake.game.SnakeSession
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession

class WebSnakeSession(game: Game, val session: WebSocketSession): SnakeSession(game) {

    override fun sendString(message: String) {
        if (message.isEmpty()) return
        try {
            synchronized(session) {
                if (session.isOpen) session.sendMessage(TextMessage(message))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

}