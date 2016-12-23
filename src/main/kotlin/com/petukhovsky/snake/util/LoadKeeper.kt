package com.petukhovsky.snake.util

class LoadKeeper(
        val a: Double,
        val b: Double
){
    var mid: Double = a

    var last = System.currentTimeMillis()

    fun calc(): Double {
        val now = System.currentTimeMillis()
        val cur = now - last
        mid += b * (cur - mid)
        last = now
        return mid
    }
}