package com.petukhovsky.snake.util

enum class Direction(val num: Int, val x: Int, val y: Int) {
    LEFT(0, 0, -1),
    UP(1, -1, 0),
    RIGHT(2, 0, 1),
    DOWN(3, 1, 0);

    fun opposite() = Direction.values()[num xor 2]
}

fun getDirectionFromInt(i: Int) =
        when (i) {
            in 0..3 -> Direction.values()[i]
            else -> throw IllegalArgumentException("bad direction");
        }