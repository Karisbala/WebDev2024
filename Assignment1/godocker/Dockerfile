FROM golang:1.23 AS build

WORKDIR /app

COPY . .

ENV GO111MODULE=off

RUN go build -o hello-docker .

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/hello-docker .

CMD [ "./hello-docker" ]