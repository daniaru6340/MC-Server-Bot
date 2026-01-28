FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN bun install

CMD [ "sh", "-c", "bun initialize && bun start" ]