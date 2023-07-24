FROM node:18.16.1-alpine3.17 as builder
WORKDIR /app
COPY package*.json *.json *.config.js ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18.16.1-alpine
ARG app_version=0.1.0
ARG app_port=4000
LABEL Name=nodejs-aws-bff
LABEL Version=$app_version
ENV NODE_ENV production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
USER node
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node . /app
EXPOSE 4000
CMD ["node", "./dist/index.js"]
