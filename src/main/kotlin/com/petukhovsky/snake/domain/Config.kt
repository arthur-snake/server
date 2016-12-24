package com.petukhovsky.snake.domain

import com.petukhovsky.services.jsonDao
import com.petukhovsky.services.readJSON
import com.petukhovsky.services.writeJSON
import com.petukhovsky.snake.game.SnakeCell
import com.petukhovsky.snake.util.Direction
import org.springframework.stereotype.Service
import java.nio.file.Paths

data class FieldSize(val height: Int, val width: Int) {
    init {
        check(height > 0 && width > 0) { "Height and width should be positive" }
    }

    fun move(x: Int, y: Int, direction: Direction): Pair<Int, Int> = fit(x + direction.x, y + direction.y)

    fun fit(x: Int, y: Int): Pair<Int, Int> = Pair(Math.floorMod(x, height), Math.floorMod(y, width))
    fun calcNeighbours(y: Int, x: Int, map: Array<Array<SnakeCell>>): Int {
        return Direction.values()
                .map { move(y, x, it) }
                .count { !map[it.first][it.second].availableToJoin() }
    }
}

data class SnakeConfig(
        val name: String,
        val size: FieldSize,
        val tickTime: Int,
        val foodCells: Int,
        val fillers: Array<String> = arrayOf()
) {
    init {
        check(tickTime >= 0) { "Tick time shouldn't be negative" }
        check(foodCells >= 0){ "Food cells count shouldn't be negative" }
    }
}

@Service
open class SnakeConfigService {

    val dao = jsonDao<Array<SnakeConfig>>(Paths.get("/data/snake.servers.json"))

    var snakeConfigs: Array<SnakeConfig> = dao.read() ?: arrayOf()

    fun getConfigByName(name: String): SnakeConfig? = snakeConfigs.find { it.name == name }
}

