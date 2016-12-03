package com.petukhovsky.snake.game.obj

import com.petukhovsky.snake.game.Game
import com.petukhovsky.snake.prot.IdInfo

class ObjectsManager(val game: Game) {
    val all = mutableMapOf<String, IdObject>()
    val cur = mutableMapOf<String, IdObject>()

    fun remove(obj: IdObject) {
        all.remove(obj.id)
    }

    fun gen(): String {
        var s: String = randomChar().toString()
        while (s in all) s += randomChar()
        return s
    }

    fun add(obj: IdObject) {
        all[obj.id] = obj
        cur[obj.id] = obj
    }

    companion object {
        val lib1 = "qwertyuiopasdfghjklzxcvbnm"
        val lib2 = "0123456789"
        val lib = lib1 + lib1.toUpperCase() + lib2
    }

    private fun randomChar() = lib[game.random.nextInt(lib.length)]


    val free: IdObject = FreeObject("0").apply { add(this) }

    private val foodId: String = gen().apply { add(FoodObject(this, 0)) }
    fun food(food: Int) = FoodObject(foodId, food)
}