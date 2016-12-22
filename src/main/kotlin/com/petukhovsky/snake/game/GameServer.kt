package com.petukhovsky.snake.game

import com.petukhovsky.services.objectMapper
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.concurrent.timerTask

class GameServer(val game: Game) {

    val log = LoggerFactory.getLogger(javaClass)

    val tick = game.config.tickTime.toLong()
    val timer: Timer = Timer("Snake game: $game")
    var running = false

    fun start() {
        synchronized(this) {
            if (!running) {
                log.info("Starting snake server: ${game.config}")
                running = true
                timer.schedule(timerTask { tickServer() }, tick, tick)
            }
        }
    }

    fun stop() {
        synchronized(this) {
            if (running) {
                running = false
                timer.cancel()
            }
        }
    }

    private fun tickServer() {
        synchronized(game) {
            val players = game.players.sortedBy { it.size }
            players.forEach { it.moveFront() }
            players.forEach { it.moveBack() }
            game.food.placeFoodUntil(game.config.foodCells)
            val message = game.builder.buildMessage()

            game.initHelper.clear()
            game.obj.cur.clear()
            game.changedCells.clear()
            game.chat.updates.clear()

            game.subs.broadcast(objectMapper.writeValueAsString(message))
        }
    }
}
