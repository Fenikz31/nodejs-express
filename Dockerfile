# syntax = docker/dockerfile:1.0-experimental
FROM node:latest AS base

ENV HOST localhost
ENV PORT 3333
EXPOSE 3333
WORKDIR /usr/app
# Add your source files
COPY --chown=node:node package.json .
COPY --chown=node:node . .
USER node

FROM node:21.6.0-bullseye-slim AS production
WORKDIR /usr/app
COPY --from=base --chown=node:node /usr/app /usr/app/
# Install dependencies first, add code later: docker is caching by layers
RUN npm ci --omit=dev

# Docker base image is already NODE_ENV=production
ENV NODE_ENV production

# Silent start because we want to have our log format as the first log
CMD [ "npm", "start", "-s" ]

FROM node:21.6.0-bullseye-slim AS development
WORKDIR /usr/app
COPY --from=base --chown=node:node /usr/app .
# Install dependencies first, add code later: docker is caching by layers
RUN --mount=type=secret,id=npm,target=~/.npmrc npm i

# Docker base image is already NODE_ENV=production
ENV NODE_ENV development

# Silent start because we want to have our log format as the first log
CMD [ "npm", "run", "dev", "-s" ]