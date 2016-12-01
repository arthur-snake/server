package com.petukhovsky.services.config

import org.springframework.context.MessageSource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.support.ReloadableResourceBundleMessageSource
import org.springframework.stereotype.Controller
import org.springframework.validation.Validator
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.servlet.config.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping
import org.thymeleaf.spring4.SpringTemplateEngine
import org.thymeleaf.spring4.templateresolver.SpringResourceTemplateResolver
import org.thymeleaf.spring4.view.ThymeleafViewResolver

@Configuration
@EnableWebMvc
open class WebMvcConfig : WebMvcConfigurationSupport() {

    override fun requestMappingHandlerMapping(): RequestMappingHandlerMapping {
        val requestMappingHandlerMapping = super.requestMappingHandlerMapping()
        requestMappingHandlerMapping.setUseSuffixPatternMatch(false)
        requestMappingHandlerMapping.setUseTrailingSlashMatch(false)
        return requestMappingHandlerMapping
    }

    @Bean(name = arrayOf("messageSource"))
    open fun messageSource(): MessageSource {
        val messageSource = ReloadableResourceBundleMessageSource()
        messageSource.setBasename(MESSAGE_SOURCE)
        messageSource.setCacheSeconds(5)
        messageSource.setDefaultEncoding("UTF-8")
        return messageSource
    }

    @Bean
    open fun templateResolver(): SpringResourceTemplateResolver {
        val resolver = SpringResourceTemplateResolver()
        resolver.prefix = VIEWS
        resolver.suffix = ".html"
        resolver.templateMode = "HTML5"
        resolver.isCacheable = false
        return resolver
    }

    @Bean
    open fun templateEngine(): SpringTemplateEngine {
        val templateEngine = SpringTemplateEngine()
        templateEngine.setTemplateResolver(templateResolver())
        //templateEngine.addDialect(SpringSecurityDialect())
        //templateEngine.addDialect(Java8TimeDialect())
        return templateEngine
    }

    @Bean
    open fun viewResolver(): ThymeleafViewResolver {
        val thymeleafViewResolver = ThymeleafViewResolver()
        thymeleafViewResolver.templateEngine = templateEngine()
        thymeleafViewResolver.characterEncoding = "UTF-8"
        return thymeleafViewResolver
    }

    public override fun getValidator(): Validator {
        val validator = LocalValidatorFactoryBean()
        validator.setValidationMessageSource(messageSource())
        return validator
    }

    public override fun addResourceHandlers(registry: ResourceHandlerRegistry?) {
        registry!!.addResourceHandler(RESOURCES_HANDLER).addResourceLocations(RESOURCES_LOCATION)
    }

    public override fun configureDefaultServletHandling(configurer: DefaultServletHandlerConfigurer?) {
        configurer!!.enable()
    }

    /**
     * Handles favicon.ico requests assuring no `404 Not Found` error is returned.
     */
    @Controller
    internal class FaviconController {
        @RequestMapping("favicon.ico")
        fun favicon(): String {
            return "forward:/resources/images/favicon.ico"
        }
    }

/*    @Bean
    open fun multipartResolver(): MultipartResolver {
        val multipartResolver = CommonsMultipartResolver()
        multipartResolver.setMaxUploadSize((1024 * 1024 * 1024).toLong())
        return multipartResolver
    }*/

    companion object {

        private val MESSAGE_SOURCE = "/WEB-INF/i18n/messages"
        private val VIEWS = "/WEB-INF/views/"

        private val RESOURCES_LOCATION = "/resources/"
        private val RESOURCES_HANDLER = RESOURCES_LOCATION + "**"
    }
}

@Configuration
open class WtfConfig() : WebMvcConfigurerAdapter() {
    override fun configureDefaultServletHandling(configurer: DefaultServletHandlerConfigurer?) {
        configurer!!.enable()
    }
}