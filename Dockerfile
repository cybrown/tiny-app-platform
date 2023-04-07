FROM node:18-alpine
RUN mkdir -p /build
WORKDIR /build
COPY packages packages
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci && npm run build

FROM node:18-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY --from=0 /build/packages/backend/index.js index.js
COPY --from=0 /build/packages/backend/lib lib
COPY --from=0 /build/node_modules node_modules
COPY --from=0 /build/packages/web-client/build public
EXPOSE 3001
CMD ["node", "index.js"]
