package com.petukhovsky.snake.prot

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "act")
@JsonSubTypes(
        JsonSubTypes.Type(value = UpdMessage::class, name = "upd"),
        JsonSubTypes.Type(value = InitMessage::class, name = "init")
)
open class ServerMessage

open class UpdMessage(
        @JsonInclude(JsonInclude.Include.NON_EMPTY) val a : String,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) val u : Array<IdInfo>
) : ServerMessage()

@JsonInclude(JsonInclude.Include.NON_NULL)
data class IdInfo(
        val id: String,
        val type: String,
        val color: String,
        val nick: String? = null
)

class InitMessage(
        a: String,
        u: Array<IdInfo>,
        val rows: Int,
        val columns: Int
) : UpdMessage(a, u)