package com.petukhovsky.snake.game.obj

import com.petukhovsky.snake.game.SnakePlayer
import com.petukhovsky.snake.prot.IdInfo
import com.petukhovsky.snake.util.Color

abstract class IdObject(val id: String) {
    abstract fun toInfo(): IdInfo
}

class FreeObject(id: String) : IdObject(id) {
    override fun toInfo(): IdInfo = IdInfo(id, "free", Color.clear)
}

class FoodObject(id: String, val food: Int) : IdObject(id) {
    override fun toInfo(): IdInfo = IdInfo(id, "food", Color.clear)
}

class PlayerObject(id: String, val player: SnakePlayer) : IdObject(id) {
    override fun toInfo(): IdInfo = IdInfo(id, "player", player.color, player.nickname)
}

class BlockObject(id: String, val color: String = Color.block) : IdObject(id) {
    override fun toInfo(): IdInfo = IdInfo(id, "block", color)
}