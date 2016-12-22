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

class JsonDAO<T>(val path: Path, val c: Class<T>) {

    fun exists() = Files.exists(path)

    fun read(): T? {
        if (!exists()) return null
        Files.newInputStream(path).use {
            return objectMapper.readValue(it, c)
        }
    }

    fun save(value: T) {
        Files.createDirectories(path.parent)
        Files.newOutputStream(path).use { objectMapper.writeValue(it, value) }
    }
}

inline fun <reified T : Any> jsonDao(path: Path) = JsonDAO(path, T::class.java)