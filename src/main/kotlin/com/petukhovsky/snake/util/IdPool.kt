package com.petukhovsky.snake.util

import java.util.*

class IdPool(val random: Random = Random()) {

    val set = mutableSetOf<String>()

    fun free(id: String) = set.remove(id)

    fun generate(): String {
        var id = ""
        do {
            id += genChar()
        } while (id in set)
        return id
    }

    private fun genChar(): Char = characters[random.nextInt(characters.size)]
}

private val lower = "abcdefghijklmnopqrstuvwxyz"
private val characters = ("0123456789" + lower + lower.toUpperCase()).toCharArray()