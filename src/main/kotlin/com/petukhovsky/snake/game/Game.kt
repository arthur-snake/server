package com.petukhovsky.snake.game

import com.petukhovsky.snake.domain.SnakeConfig
import com.petukhovsky.snake.game.SnakeCell
import com.petukhovsky.snake.util.SubService
import com.petukhovsky.snake.util.RandomAccessField
import java.util.*

class Game(val config: SnakeConfig) {

    val random = Random()

    val rows = config.size.height
    val columns = config.size.width

    val changedCells = mutableSetOf<SnakeCell>()
    var foodOnMap = 0

    var firstMessage: String? = null

    val subs = SubService<String>()
    val raf = RandomAccessField(config.size)
    val map = Array(rows) { i -> Array(columns) { j -> SnakeCell(i, j, this) } }
    val players = mutableSetOf<SnakePlayer>()

    private val server = GameServer(this).apply { start() }

    operator fun get(point: Pair<Int, Int>) = map[point.first][point.second]

    fun placeFood(food: Int = random.nextInt(9) + 1): Boolean {
        val place = raf.get() ?: return false
        this[place].placeFood(food)
        return true
    }

    fun notifyChanged(snakeCell: SnakeCell) = changedCells.add(snakeCell)

    fun firstMessage(): String {
        if (firstMessage != null) return firstMessage!!
        firstMessage = "$rows;$columns|" + map.map { it.map { it.toMessage() }.joinToString("|") }.joinToString("|")
        return firstMessage!!
    }

    fun buildMessage(): String = changedCells.map { "|${it.toMessage()}" }.joinToString("")
}