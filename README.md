# NodeJS - express boilerplate

## Getting started

## Project architecture

```bash
Boilerplate directory
.
├── Dockerfile
├── README.Docker.md
├── README.md
├── docker-compose.yml
├── index.ts
├── package.json
├── src
│   ├── app.ts
│   ├── controllers               # Folder containing the API business logic
│   │   └── core
│   │       ├── healthz.ts
│   │       ├── index.ts
│   │       └── info.ts
│   └── routes                     # Folder containing the API routes
│       └── core
│           ├── healthz.ts
│           ├── index.ts
│           └── info.ts
├── tsconfig.json
└── utils
    ├── logger.ts
    └── router.ts
```

Create your API business logic in the folder `src/controllers/<api name>`.

Create your API route in the folder `src/routes/<api name.>`. The route will be accessible by default at `http://localhost:3333/api/<api name>`

### Clone repository

Get into `api` folder and clone this repository.

- If you use ssh method

    ```bash
    git clone git@gitlab.fenikz.eu:boilerplates/nodejs-express.git
    ```

- If you use http method

    ```bash
    git clone https://gitlab.fenikz.eu/boilerplates/nodejs-express.git
    ```

### Install npm dependencies

- Login to private npm registry

    ```bash
    npm login --registry=https://<private-registry-address>/
    ```

- Copy `.env.sample` file to `.env` and change or fill out missing properties.

    ```bash
    cp .env.sample .env
    ```

- Launch dependencies installation using the following command:

    ```bash
    npm i
    ```

### Usage

#### Development mode

Launch the server using the following command:

 ```bash
 npm run watch
 ```

 or

 ```bash
 yarn watch
 ```

#### Production mode

Launch the server using the following command:

 ```bash
 npm start
 ```

 or

 ```bash
 yarn start
 ```
