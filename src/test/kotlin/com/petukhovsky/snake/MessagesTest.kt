package com.petukhovsky.snake

import com.fasterxml.jackson.module.kotlin.readValue
import com.petukhovsky.services.objectMapper
import com.petukhovsky.snake.prot.JoinMessage
import com.petukhovsky.snake.prot.LeaveMessage
import com.petukhovsky.snake.prot.PlayerMessage
import com.petukhovsky.snake.prot.TurnMessage
import com.petukhovsky.snake.util.Direction
import org.junit.Assert.assertEquals
import org.junit.Test

class MessagesTest {

    @Test fun test() {
        assertEquals(
                objectMapper.readValue<PlayerMessage>("""{"act": "join", "nick": "Kek"}"""),
                JoinMessage(nick = "Kek")
        )
        assertEquals(
                objectMapper.readValue<PlayerMessage>("""{"act": "leave"}"""),
                LeaveMessage()
        )
        assertEquals(
                objectMapper.readValue<PlayerMessage>("""{"act": "turn", "dir": "UP"}"""),
                TurnMessage(Direction.UP)
        )
    }
}