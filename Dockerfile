FROM ubuntu:latest AS builder
RUN apt-get update && \
    apt-get install -y \
      unzip \
      jq \
      curl
RUN mkdir -p /build
WORKDIR /build
ARG GH_TOKEN
ENV GH_TOKEN=$GH_TOKEN
COPY download-artifacts.sh /build/download-artifacts.sh
RUN ./download-artifacts.sh

FROM node:18-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY --from=builder /build/artifacts/backend .
COPY --from=builder /build/artifacts/web-client public
EXPOSE 3001
CMD ["node", "index.js"]
