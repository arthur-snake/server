package com.petukhovsky.snake.game

import com.petukhovsky.snake.info.AnyMoment
import com.petukhovsky.snake.util.Direction
import java.util.*

class SnakeController {
    private val dirs = ArrayDeque<Direction>()
    private var dir = Direction.RIGHT
    private var lastMove: Direction? = null

    @AnyMoment
    fun go(direction: Direction): Boolean {
        synchronized(this) {
            if (direction == (dirs.lastOrNull() ?: dir)) return false
            dirs.offer(direction)
            return true
        }
    }

    fun direction(): Direction {
        synchronized(this) {
            if (dirs.isEmpty()) return dir
            if (dirs.first.opposite() == lastMove) {
                dirs.removeFirst()
                return direction()
            }
            dir = dirs.removeFirst()
            return dir
        }
    }

    fun move() {
        lastMove = dir
    }
}