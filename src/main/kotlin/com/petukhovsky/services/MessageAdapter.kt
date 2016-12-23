package com.petukhovsky.services

import java.io.PrintWriter
import java.io.StringWriter

abstract class MessageAdapter{
    abstract fun send(message: String)

    fun send(message: String = "", exception: Exception) {
        val writer = StringWriter()
        writer.append(message).append(System.lineSeparator())
        exception.printStackTrace(PrintWriter(writer))
        return send(writer.toString())
    }
}

class PrefixAdapter(
        val adapter: MessageAdapter,
        val prefix: String
) : MessageAdapter() {
    override fun send(message: String) {
        adapter.send(prefix + message)
    }
}