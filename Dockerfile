FROM node:20-alpine AS builder
RUN mkdir -p /build
WORKDIR /build
COPY package.json package-lock.json nx.json .
COPY packages packages
RUN npm ci && \
    npm run build && \
    npm ci --only-production --workspace packages/backend

FROM node:20-alpine AS tini_fetcher
ENV TINI_VERSION=v0.19.0
RUN wget -O - https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static > /tini && \
    chmod 755 /tini

FROM node:20-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY --from=tini_fetcher /tini /tini
COPY --from=builder /build/node_modules node_modules
COPY --from=builder /build/packages/backend .
COPY --from=builder /build/packages/web-client/build public
EXPOSE 3001
USER node
CMD ["node", "index.js"]
ENTRYPOINT ["/tini", "--"]
