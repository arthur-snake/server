package com.petukhovsky.snake.util

import java.util.*

object Color {
    const val clear = "#FFFFFF"
    const val block = "#000000"
}

val snakeColors = arrayOf("#4183D7", "#446CB3", "#59ABE3", "#1F3A93", "#D64541", "#CF000F", "#EF4836", "#DB0A5B",
        "#D2527F", "#9A12B3", "#8E44AD", "#1BBC9B", "#26A65B", "#03C9A9", "#019875", "#1E824C", "#F7CA18", "#F89406",
        "#E87E04", "#F9690E", "#F9BF3B")

fun getRandomColor(random: Random) = snakeColors[random.nextInt(snakeColors.size)]