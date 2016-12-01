package com.petukhovsky.snake.ws

import com.petukhovsky.snake.game.Game
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

open class SnakeHandler(val game: Game): TextWebSocketHandler() {

    val map = mutableMapOf<String, WebSnakeSession>()

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        map[session.id]?.onMessage(message.payload)
    }

    override fun afterConnectionEstablished(session: WebSocketSession) {
        map[session.id] = WebSnakeSession(game, session).apply { init() }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        map[session.id]?.close()
        map.remove(session.id)
    }
}