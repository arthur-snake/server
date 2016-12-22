package com.petukhovsky.services

import com.pengrad.telegrambot.Callback
import com.pengrad.telegrambot.TelegramBotAdapter
import com.pengrad.telegrambot.request.SendMessage
import com.pengrad.telegrambot.response.BaseResponse
import com.pengrad.telegrambot.response.SendResponse
import com.petukhovsky.services.MessageAdapter
import org.springframework.stereotype.Service
import java.io.IOException
import java.nio.file.Paths

@Service
class TelegramService {
    val dao = jsonDao<TelegramConfig>(Paths.get("/data/telegram.json"))

    val config by lazy { dao.read() ?: TelegramConfig() }
    val bot by lazy { TelegramBotAdapter.build(config.token) }

    fun getChatIdsById(id: String): Array<String>? {
        return config.map[id]
    }

    fun send(id: String, msg: String) {
        getChatIdsById(id)?.forEach {
            bot.execute(SendMessage(it, msg), object : Callback<SendMessage, SendResponse> {
                override fun onFailure(request: SendMessage?, e: IOException?) {
                }

                override fun onResponse(request: SendMessage?, response: SendResponse?) {
                }
            })
        }
    }

    fun getAdapter(id: String): MessageAdapter {
        return object : MessageAdapter() {
            override fun send(message: String) {
                send(id, message)
            }
        }
    }
}

data class TelegramConfig(
        val token: String = "",
        val map: Map<String, Array<String>> = mapOf()
)