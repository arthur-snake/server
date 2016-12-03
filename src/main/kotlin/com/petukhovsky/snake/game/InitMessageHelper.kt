package com.petukhovsky.snake.game

import com.petukhovsky.services.objectMapper
import com.petukhovsky.snake.prot.IdInfo
import com.petukhovsky.snake.prot.InitMessage

class InitMessageHelper(val game: Game) {

    fun allMapAsString(): String = game.map.map { it.map { it.toMessage() }.joinToString("|") }.joinToString("|")
    fun getAllIdInfo(): Array<IdInfo> = game.obj.all.values.map { it.toInfo() }.toTypedArray()

    fun clear() {
        cachedMessage = null
    }

    private var cachedMessage: String? = null

    val message: String
        get() {
            if (cachedMessage == null) {
                cachedMessage = objectMapper.writeValueAsString(
                        InitMessage(
                                allMapAsString(),
                                getAllIdInfo(),
                                game.rows,
                                game.columns
                        )
                )
            }
            return cachedMessage ?: null!!
        }
}