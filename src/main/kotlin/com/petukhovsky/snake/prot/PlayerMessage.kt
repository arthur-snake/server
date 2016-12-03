package com.petukhovsky.snake.prot

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.petukhovsky.snake.util.Direction

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "act")
@JsonSubTypes(
        JsonSubTypes.Type(value = JoinMessage::class, name = "join"),
        JsonSubTypes.Type(value = LeaveMessage::class, name = "leave"),
        JsonSubTypes.Type(value = TurnMessage::class, name = "turn"),
        JsonSubTypes.Type(value = ChatMessage::class, name = "chat")
)
open class PlayerMessage

class JoinMessage(val nick: String = "Snake") : PlayerMessage() {
    override fun equals(other: Any?): Boolean = other is JoinMessage && other.nick == nick
    override fun hashCode(): Int = nick.hashCode()
}

class LeaveMessage : PlayerMessage() {
    override fun equals(other: Any?): Boolean = other is LeaveMessage
    override fun hashCode(): Int = 0
}
class TurnMessage(val dir: Direction) : PlayerMessage() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other?.javaClass != javaClass) return false

        other as TurnMessage

        if (dir != other.dir) return false

        return true
    }

    override fun hashCode(): Int {
        return dir.hashCode()
    }
}
class ChatMessage(val msg: String) : PlayerMessage() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other?.javaClass != javaClass) return false

        other as ChatMessage

        if (msg != other.msg) return false

        return true
    }

    override fun hashCode(): Int {
        return msg.hashCode()
    }
}