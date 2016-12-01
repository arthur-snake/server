package com.petukhovsky.snake.game

import com.petukhovsky.snake.util.Color
import kotlin.properties.Delegates

enum class CellState{
    FREE,
    BLOCK,
    PLAYER,
    FOOD
}

class SnakeCell(val x: Int, val y: Int, val game: Game) {
    private var state: CellState by Delegates.observable(CellState.FREE) {
        p, old, new -> game.raf[x, y] = new != CellState.FREE
    }
    private var color: String = Color.clear
    private var food: Int by Delegates.observable(0) {
        prop, old, new ->
        run {
            if (old != 0) game.foodOnMap--
            if (new != 0) game.foodOnMap++
        }
    }
    private var player: SnakePlayer? = null

    fun setPlayer(player: SnakePlayer): Boolean {
        if (!isEmpty()) return false
        player.stock += food
        food = 0
        this.player = player
        color = player.color
        state = CellState.PLAYER
        notifyGame()
        return true
    }

    fun isEmpty(): Boolean {
        return state == CellState.FREE || state == CellState.FOOD
    }

    fun toMessage() = "$y.$x$color" + (if (state == CellState.FOOD) "*$food" else "")

    fun setEmpty() {
        food = 0
        player = null
        this.color = Color.clear
        state = CellState.FREE
        notifyGame()
    }

    fun setBlock(color: String) {
        food = 0
        player = null
        this.color = color
        state = CellState.BLOCK
        notifyGame()
    }

    fun placeFood(food: Int) {
        this.food = food
        player = null
        color = Color.clear
        state = CellState.FOOD
        notifyGame()
    }

    private fun notifyGame() = game.notifyChanged(this)
}