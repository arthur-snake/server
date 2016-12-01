package com.petukhovsky.snake.game

import com.petukhovsky.snake.info.AnyMoment
import com.petukhovsky.snake.util.Direction
import com.petukhovsky.snake.game.Game
import com.petukhovsky.snake.util.getRandomColor
import java.util.*
import kotlin.properties.Delegates

class SnakePlayer(val session: SnakeSession, val game: Game) {
    var color: String = getRandomColor(game.random)
    var inGame = false
    var controller = SnakeController()
    var cells = ArrayDeque<SnakeCell>()
    var stock = 2

    val size: Int get() = cells.size

    var nickname: String = "snake"
        set(value: String) {
            if (value.isEmpty()) return
            field = value.trim().take(15)
        }

    init {
        synchronized(game) {
            game.subs.join(this) { session.sendString(it) }
            session.sendString(game.firstMessage())
        }
    }

    @AnyMoment
    fun destroy() {
        synchronized(game) {
            leave()
            game.subs.leave(this)
        }
    }

    @AnyMoment
    fun leave() {
        if (!inGame) return
        synchronized(game) {
            game.players.remove(this)
            inGame = false
            cells.forEach { it.setEmpty() }
        }
    }

    @AnyMoment
    fun join(nick: String): Boolean {
        if (inGame) return false
        this.nickname = nick
        synchronized(game) {
            val point = game.raf.get() ?: return false
            stock = 2
            inGame = true
            game.players.add(this)
            color = getRandomColor(game.random)
            controller = SnakeController()
            cells = ArrayDeque(listOf(game[point].apply { setPlayer(this@SnakePlayer) }))
        }
        return true
    }

    @AnyMoment
    fun changeDirection(dir: Direction) {
        controller.go(dir)
    }

    fun moveFront() {
        assert(inGame == true)
        val cell = game[game.config.size.move(cells.last.x, cells.last.y, controller.direction())]
        if (!cell.setPlayer(this)) return
        controller.move()
        cells.add(cell)
    }

    fun moveBack() {
        assert(inGame == true)
        if (stock > 0) {
            stock--
            return
        }
        if (size > MIN_SIZE) cells.remove().setEmpty()
    }
}

private val MIN_SIZE = 3
