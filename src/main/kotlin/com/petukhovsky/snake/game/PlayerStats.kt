package com.petukhovsky.snake.game

class PlayerStats(
        val player: SnakePlayer
) {
    var maxLength = 0
    var totalFood = 0
    var currentLength = 0

    var goal = 100

    fun notifyLength(length: Int) {
        maxLength = Math.max(maxLength, length)
        currentLength = length
        if (length >= goal) {
            player.adapter.send("Player ${player.nickname} reached $length blocks length! Good job!")
            goal += 100
        }
    }

    fun notifyFood(food: Int) {
        totalFood += food
    }

    fun notifyLeave() {
        if (totalFood < 500) return
        player.adapter.send("Wow! Player ${player.nickname} left with great " +
                "results(eaten=$totalFood, maxLength=$maxLength, length=$currentLength)")
    }
}
