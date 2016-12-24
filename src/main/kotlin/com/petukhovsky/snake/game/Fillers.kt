package com.petukhovsky.snake.game

import com.petukhovsky.snake.game.obj.BlockObject
import com.petukhovsky.snake.game.obj.FreeObject
import java.util.function.Consumer

object Fillers {
    fun find(name: String?): Filler? {
        return when(name) {
            "frame" -> FrameFiller
            "frame:rg" -> LiveFrameFiller
            "life" -> LifeFiller
            else -> null
        }
    }
}

interface Filler {
    fun fill(game: Game)
}

object FrameFiller : Filler {
    override fun fill(game: Game) {
        val obj = BlockObject(game.obj.gen()).apply { game.obj.add(this) }
        (0..(game.rows - 1)).forEach { y ->
            (0..(game.columns - 1))
                    .filter { it == 0 || y == 0 || y == game.rows - 1 || it == game.columns - 1 }
                    .forEach { game.map[y][it].set(obj) }
        }
    }
}

object LiveFrameFiller : Filler {
    override fun fill(game: Game) {
        var obj1 = BlockObject(game.obj.gen(), "#AA0000").apply { game.obj.add(this) }
        var obj2 = BlockObject(game.obj.gen(), "#00AA00").apply { game.obj.add(this) }

        var num = 0

        (0..game.columns - 1).map { Pair(0, it) }
        .plus((1..game.rows - 1).map { Pair(it, game.columns - 1) })
        .plus((game.columns - 2 downTo 0).map { Pair(game.rows - 1, it) })
        .plus((game.rows - 2 downTo 1).map { Pair(it, 0) })
        .forEach {
           game[it].set(
                    if (num == 0) {
                        num = 1
                        obj1
                    } else {
                        num = 0
                        obj2
                    }
            )
        }

        num = 0

        game.server.listeners.add (Consumer<Game> { game ->
            num++
            if (num == 30) {
                num = 0
                var color = obj1.color
                obj1 = BlockObject(obj1.id, obj2.color).apply { game.obj.add(this) }
                obj2 = BlockObject(obj2.id, color).apply { game.obj.add(this) }
            }
        })
    }
}

object LifeFiller : Filler {
    override fun fill(game: Game) {
        var obj = BlockObject(game.obj.gen(), "#000000").apply { game.obj.add(this) }

        game.server.listeners.add (Consumer<Game> { game ->
            for (i in 0..game.rows - 1) {
                for (j in 0..game.columns - 1) {
                    val cell = game.map[i][j]
                    if (cell.obj.id == obj.id) {
                        if (game.config.size.calcNeighbours(i, j, game.map) !in 2..3) cell.set(game.obj.free)
                    } else if (cell.obj is FreeObject) {
                        if (game.config.size.calcNeighbours(i, j, game.map) == 3) cell.set(obj)
                    }

                }
            }
        })
    }
}