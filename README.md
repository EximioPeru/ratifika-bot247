# Ratifika - Bot365

## Getting Started

* [Configurar Cuenta donde llegarán los correos (Seguir los pasos hasta antes de Let’s code)](https://www.limilabs.com/blog/oauth2-client-credential-flow-office365-exchange-imap-pop3-smtp)
Ya se encuentra configurador para la cuenta: desarrollo.peru@ratifika.com.pe

## Instalación

1. Clone el repositorio

   ```sh
    git clone https://github.com/ZafraDev/ratifika-bor365
   ```

2. Instale las dependencias de NPM dentro de la carpeta generada

   ```sh
    yarn
   ```

## Environment Variables

1. Renombre el archivo `env.example` to `.env`.
2. Añada las variables de entorno necesarias en el proyecto, las cuales están descritas en el archivo .env.example.

## Uso

Para correr el proyecto en local ejecute:

```sh
 yarn dev
```

## Producción

1. Generar los archivos para producción:

```sh
 yarn build
```

Este comando creará la versión final en la carpeta /build, debe subirse todo el proyecto sin la carpeta /src (No es necesaria)

2. Para ejecutar el proyecto en PM2 en el servidor de producción, diríjase a la ruta del proyecto y ejecute el comando:

```sh
 pm2 start ./build/index.js
```

*NOTA: Puede ejecutar el build sin pm2 usando el comando **yarn start***
