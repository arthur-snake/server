package com.petukhovsky.services.config

import com.mongodb.DBObject
import com.mongodb.Mongo
import com.mongodb.MongoClient
import com.petukhovsky.services.ServicesApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Lazy
import org.springframework.core.convert.converter.Converter
import org.springframework.data.mongodb.config.AbstractMongoConfiguration
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.SimpleMongoDbFactory
import org.springframework.data.mongodb.core.WriteResultChecking
import org.springframework.data.mongodb.core.convert.CustomConversions
import org.springframework.data.mongodb.core.convert.MappingMongoConverter
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories

@Configuration
@Lazy
@EnableMongoRepositories(basePackageClasses = arrayOf(ServicesApplication::class))
open class MongoConfig: AbstractMongoConfiguration() {
    override @Bean fun mongo(): Mongo = MongoClient("mongo")
    override @Bean fun getDatabaseName(): String = "services"
    override @Bean fun mongoTemplate()
            = MongoTemplate(
            	mongoDbFactory(), 
            	mappingMongoConverter()
            ).apply { setWriteResultChecking(WriteResultChecking.EXCEPTION) }
    //override @Bean fun customConversions(): CustomConversions = CustomConversions(listOf<Converter<*, *>>())
}