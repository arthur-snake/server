package com.petukhovsky.snake.game

import com.petukhovsky.services.TelegramService
import com.petukhovsky.snake.domain.SnakeConfig
import com.petukhovsky.snake.game.SnakeCell
import com.petukhovsky.snake.game.obj.ObjectsManager
import com.petukhovsky.snake.util.SubService
import com.petukhovsky.snake.util.RandomAccessField
import java.util.*

val VERSION = "v1.0.6"
val UPDATE_NOTES = "Disable updating room with no subscribers"

class Game(
        val config: SnakeConfig,
        val telegram: TelegramService
) {

    val random = Random()
    val raf = RandomAccessField(config.size)

    val rows = config.size.height
    val columns = config.size.width

    val initHelper = InitMessageHelper(this)
    val food = FoodManager(this)
    val obj = ObjectsManager(this)

    val changedCells = mutableSetOf<SnakeCell>()

    val subs = SubService<String>()
    val map = Array(rows) { i -> Array(columns) { j -> SnakeCell(i, j, this) } }
    val players = mutableSetOf<SnakePlayer>()

    val chat = GameChat()

    val builder = MessageBuilder(this)

    val server = GameServer(this)

    operator fun get(point: Pair<Int, Int>) = map[point.first][point.second]

    fun notifyChanged(snakeCell: SnakeCell) = changedCells.add(snakeCell)


    init {
        config.fillers.forEach { Fillers.find(it)?.fill(this) }
        server.start()
    }
}