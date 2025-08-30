# ClickSign - Hubsoft

Serviço para automatizar o processo de assinatura de contratos

## Primeira execução

- Iniciando o projeto

`cp .env.example .env`
`docker-compose build`

Na primeira execução será necessário criar o banco de dados diretamente no SGBD ( postgres - create database ) e depois executar as migrations e seeds

Em um terminal:
`docker-compose up db`

Em outro terminal:
Criando o banco de dados no console do host
`docker exec -it clicksign-hubsoft_db_1 psql -U postgres -c "create database clicksign_hubsoft_development;"`

Rodando container web:
`docker-compose up web`

Em outro terminal:
Rodando as migrations no console do host
`docker exec -it clicksign-hubsoft_web_1 npm run migration:run`

Conecte ao banco de dados local e crie os seguintes usuários:

`INSERT INTO users(name, email, password, role) VALUES('Sistema', 'sistema@sistema.com', '$2a$08$rD8DcFkmYsKbtIGaJ6HRxuK6A/5IlSKtZ/PuOJMwjHn.5ILjRBX2i', 'admin');"`

Configure o id desse cliente na ENV ID_CLIENT_SYSTEM

`INSERT INTO users(name, email, password, role) VALUES('Users', 'user@local.com', '$2a$08$y2zWNgaLLMrDPdEH6fnU9O9lPy2CSdp66xoCrP2iQ0ZxB.adB/LFW', 'admin');`

## Development Local

`docker-compose up --build`

## Scripts

#### Criar novas migrações

`docker exec -it clicksign_hubsoft_web_1 npm run migration:create src/db/migrations/<nome-do-migration>`

#### Executar lint

`npm run lint`

#### Executar lint e corrigir

`npm run lint-fix`
