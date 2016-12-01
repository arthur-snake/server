package com.petukhovsky.snake.api

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping


@Controller
class HomeController {

    @RequestMapping(value = "/snake")
    fun index(): String = "snake/snake"
}