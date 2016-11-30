package com.petukhovsky.services

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
open class ServicesApplication

fun main(args: Array<String>) {
    SpringApplication.run(ServicesApplication::class.java, *args)
}
