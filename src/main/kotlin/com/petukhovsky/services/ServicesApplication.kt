package com.petukhovsky.services

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.ComponentScan

@SpringBootApplication
@ComponentScan(basePackages = arrayOf("com.petukhovsky.services", "com.petukhovsky.snake"))
open class ServicesApplication

fun main(args: Array<String>) {
    SpringApplication.run(ServicesApplication::class.java, *args)
}
