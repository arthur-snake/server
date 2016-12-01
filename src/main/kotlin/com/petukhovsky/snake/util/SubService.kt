package com.petukhovsky.snake.util

import com.petukhovsky.snake.info.AnyMoment

class SubService<T> {

    val map = mutableMapOf<Any, (T) -> Unit>()

    @AnyMoment
    fun join(key: Any, action: (T) -> Unit) {
        synchronized(this) {
            map[key] = action
        }
    }

    @AnyMoment
    fun leave(key: Any) {
        synchronized(this) {
            map.remove(key)
        }
    }

    fun broadcast(message: T) {
        synchronized(this) {
            val actions = map.values.toTypedArray()
            Thread({
                actions.forEach { it(message) }
            }).start()
        }
    }
}