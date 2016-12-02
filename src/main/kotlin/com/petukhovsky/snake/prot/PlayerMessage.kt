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

class JoinMessage(val nick: String) : PlayerMessage()
class LeaveMessage : PlayerMessage()
class TurnMessage(val dir: Direction) : PlayerMessage()
class ChatMessage(val msg: String) : PlayerMessage()