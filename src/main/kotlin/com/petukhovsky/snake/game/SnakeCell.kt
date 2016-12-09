package com.petukhovsky.snake.game

import com.petukhovsky.snake.game.obj.FoodObject
import com.petukhovsky.snake.game.obj.FreeObject
import com.petukhovsky.snake.game.obj.IdObject
import com.petukhovsky.snake.util.Color
import kotlin.properties.Delegates

class SnakeCell(val y: Int, val x: Int, val game: Game) {

    var obj: IdObject = game.obj.free

    private var food: Int by Delegates.observable(0) {
        prop, old, new ->
        run {
            if (old != 0) game.food.dec()
            if (new != 0) game.food.inc()
        }
    }

    fun availableToJoin(): Boolean {
        return obj is FreeObject || obj is FoodObject
    }

    fun toMessage() = "$x.$y#${obj.id}" + if (obj is FoodObject) "*${(obj as FoodObject).food}" else ""

    fun set(obj: IdObject) {
        game.raf[y, x] = obj !is FreeObject
        this.obj = obj
        food = (obj as? FoodObject)?.food ?: 0
        notifyGame()
    }

    private fun notifyGame() = game.notifyChanged(this)
}