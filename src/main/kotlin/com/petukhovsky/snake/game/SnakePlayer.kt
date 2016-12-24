package com.petukhovsky.snake.game

import com.petukhovsky.services.PrefixAdapter
import com.petukhovsky.snake.game.obj.FoodObject
import com.petukhovsky.snake.game.obj.IdObject
import com.petukhovsky.snake.game.obj.PlayerObject
import com.petukhovsky.snake.info.AnyMoment
import com.petukhovsky.snake.prot.ChatUpdate
import com.petukhovsky.snake.util.Direction
import com.petukhovsky.snake.util.LoadKeeper
import com.petukhovsky.snake.util.getRandomColor
import java.util.*

class SnakePlayer(val session: SnakeSession, val game: Game) {

    val adapter = PrefixAdapter(game.telegram.getAdapter("snake.player"), "[${game.config.name}] ")
    val logger = PrefixAdapter(game.telegram.getAdapter("snake.player.logs"), "[${game.config.name}] ")

    var stats = PlayerStats(this)

    var color: String = getRandomColor(game.random)
    var inGame = false
    var controller = SnakeController()
    var cells = ArrayDeque<SnakeCell>()
    var stock = 2

    var obj: IdObject? = null

    val size: Int get() = cells.size

    var nickname: String = "snake"
        set(value) {
            if (value.isEmpty()) return
            field = value.trim().take(15)
        }

    init {
        synchronized(game) {
            game.subs.join(this) { session.sendString(it) }
            session.sendString(game.initHelper.message)
        }
    }

    @AnyMoment
    fun destroy() {
        synchronized(game) {
            leave()
            game.subs.leave(this)

            logger.send("Player $nickname disconnected")
        }
    }

    @AnyMoment
    fun leave() {
        synchronized(game) {
            if (!inGame) return
            game.players.remove(this)
            inGame = false
            cells.forEach { it.set(game.obj.free) }
            game.obj.remove(obj!!)
            obj = null

            stats.notifyLeave()
            logger.send("Player $nickname left")
        }
    }

    @AnyMoment
    fun join(nick: String): Boolean {
        synchronized(game) {
            if (inGame) return false
            val point = game.raf.get() ?: return false
            if (nick.isNotBlank()) this.nickname = nick
            stock = 2
            inGame = true
            game.players.add(this)
            color = getRandomColor(game.random)
            controller = SnakeController()
            obj = PlayerObject(game.obj.gen(), this).apply { game.obj.add(this) }
            cells = ArrayDeque(listOf(game[point].apply { set(obj) }))

            this.stats = PlayerStats(this)
            logger.send("Player $nickname joined")
        }
        return true
    }

    @AnyMoment
    fun changeDirection(dir: Direction) {
        controller.go(dir)
    }

    fun moveFront() {
        assert(inGame == true)
        val cell = game[game.config.size.move(cells.last.y, cells.last.x, controller.direction())]
        if (!cell.availableToJoin()) return
        if (cell.obj is FoodObject) {
            val food = (cell.obj as FoodObject).food
            stock += food
            stats.notifyFood(food)
        }
        cell.set(obj!!)
        controller.move()
        cells.add(cell)
    }

    fun moveBack() {
        assert(inGame == true)
        try {
            if (stock > 0) {
                stock--
                return
            }
            if (size > MIN_SIZE) cells.remove().set(game.obj.free)
        } finally {
            stats.notifyLength(size)
        }
    }

    val chatLoad = LoadKeeper(10000.0, 0.4)

    @AnyMoment
    fun chatMessage(msg: String) {
        val message = msg.trim().take(60)
        if (message.isEmpty()) return

        synchronized(game) {
            if (!inGame) return
            if (chatLoad.calc() < 1500.0) return
            game.chat.updates.add(ChatUpdate(obj?.id ?: throw Exception("Object is null"), message))

            logger.send("[CHAT] $nickname: $message")
        }
    }
}

private val MIN_SIZE = 3
