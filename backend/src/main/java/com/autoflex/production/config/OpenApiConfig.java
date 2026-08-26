package com.autoflex.production.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Autoflex PCP Production API")
                        .version("1.0.0")
                        .description("API RESTful para Gestão de Inventário, Fichas Técnicas de Produtos e Planejamento e Controle da Produção (PCP).")
                        .contact(new Contact()
                                .name("Autoflex Team")
                                .email("contato@autoflex.com.br"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")));
    }
}
