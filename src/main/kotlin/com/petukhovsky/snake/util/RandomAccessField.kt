package com.petukhovsky.snake.util

import com.petukhovsky.snake.domain.FieldSize
import java.util.*

//non-optimal
class RandomAccessField(size: FieldSize, val random: Random = Random()) {

    val field = Array(size.height, { BooleanArray(size.width) })
    val count = IntArray(size.height, { size.width })
    var freeCount = size.height * size.width

    fun get(): Pair<Int, Int>? {
        if (freeCount == 0) return null
        var num = random.nextInt(freeCount)
        var i = 0
        while (num >= count[i]) num -= count[i++]
        var j = 0
        while (num > 0 || field[i][j]) {
            if (!field[i][j]) num--
            j++
        }
        return Pair(i, j)
    }

    operator fun set(x: Int, y: Int, value: Boolean) {
        if (field[x][y] == value) return
        field[x][y] = value
        if (value) {
            count[x]--
            freeCount--
        } else {
            count[x]++
            freeCount++
        }
    }
}