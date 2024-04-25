<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Orders Microservice
This is the Orders Microservice for the Nest-Microservices Application.

To run the project follow these steps:

## Install the dependencies
```
npm i
```

## Setup the database with docker
```
docker compose up -d
```

## Create the prisma migrations
```
npx prisma migrate dev
```

## Set the .env file
Rename the .env.template to .env and set the environment variables

- PORT=
- DATABASE_URL=

## Setup the Nats server
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```

## Run the project
```
npm run start:dev
```