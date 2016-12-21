package com.petukhovsky.snake.game

import com.petukhovsky.snake.prot.ServerMessage
import com.petukhovsky.snake.prot.UpdMessage

class MessageBuilder(val game: Game) {
    fun buildMessage(): ServerMessage =
            UpdMessage(
                    game.changedCells.map { it.toMessage() }.joinToString("|"),
                    game.obj.cur.values.map { it.toInfo() }.toTypedArray(),
                    game.chat.updates.toTypedArray()
            )

}
