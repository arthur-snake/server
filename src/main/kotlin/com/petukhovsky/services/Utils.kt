package com.petukhovsky.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import java.nio.file.Files
import java.nio.file.Path

val objectMapper = ObjectMapper()
        .registerKotlinModule()


inline fun <reified T: Any> readJSON(path: Path): T {
    return Files.newInputStream(path).use {
        objectMapper.readValue<T>(it)
    }
}

fun writeJSON(path: Path, value: Any) {
    return Files.newOutputStream(path).use {
        objectMapper.writeValue(it, value)
    }
}