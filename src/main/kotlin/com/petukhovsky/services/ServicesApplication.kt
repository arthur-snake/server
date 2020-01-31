package com.petukhovsky.services

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan

@SpringBootApplication
@ComponentScan(basePackages = ["com.petukhovsky.services", "com.petukhovsky.snake"])
open class ServicesApplication

fun main(args: Array<String>) {
    runApplication<ServicesApplication>(*args)
}