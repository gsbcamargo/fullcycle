FROM golang:1.23-alpine as builder

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main .

FROM scratch

COPY --from=builder /app/main /app/main

CMD ["/app/main"]
