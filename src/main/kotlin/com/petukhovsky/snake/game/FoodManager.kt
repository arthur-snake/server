package com.petukhovsky.snake.game

class FoodManager(val game: Game) {
    var food: Int = 0

    fun placeFood(food: Int = game.random.nextInt(9) + 1): Boolean {
        val place = game.raf.get() ?: return false
        game[place].set(game.obj.food(food))
        return true
    }

    fun placeFoodUntil(count: Int) {
        while (food < count && placeFood()) {}
    }

    fun dec() = food--
    fun inc() = food++
}