package com.petukhovsky.snake.api

import com.petukhovsky.services.objectMapper
import com.petukhovsky.snake.domain.ConfigService
import com.petukhovsky.snake.domain.SnakeConfig
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import java.net.URI
import javax.servlet.http.HttpServletRequest
import javax.ws.rs.core.UriBuilder


@Controller
class SnakeController @Autowired constructor(
        val config: ConfigService
) {

    @RequestMapping(value = "/snake")
    fun index(): String = "snake"

    @RequestMapping(value = "/snake/servers.js")
    @ResponseBody
    fun servers(
            req: HttpServletRequest
    ): ResponseEntity<String> {
        return ResponseEntity.ok("""
'use strict';

function Servers() {
	const list = ${serversList(URI(req.requestURL.toString()))};

	this.getNames = () => {
		const arr = [];
		list.forEach(function(item) {
			arr.push(item[1]);
		});
		return arr;
	};

	this.getServer = (index) => {
		if (index < 0 || index >= list.length) return undefined;
		return list[index][0];
	}
}

const servers = new Servers();
"""
        )
    }

    private fun serversList(
            uri: URI = URI("http://wrt.qjex.xyz:8080/")
    ): String {
        val arr = mutableListOf<Array<String>>()
        for (i in config.snakeConfigs) {
            val name = i.name
            val newURI = UriBuilder.fromUri(uri).replacePath("/snake/ws/$name").scheme("ws").build()
            arr.add(arrayOf(newURI.toString(), "$name server"))
        }
        return objectMapper.writeValueAsString(arr)
    }

}