FROM node:15-alpine3.13 AS builder-base
RUN apk add --no-cache python3 make g++ git

FROM builder-base AS builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/database ./packages/database
COPY packages/statuspage ./packages/statuspage
COPY packages/downdetector ./packages/downdetector
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM builder-base AS runner
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/database/package.json ./packages/database/package.json
COPY packages/statuspage/package.json ./packages/statuspage/package.json
COPY packages/downdetector/package.json ./packages/downdetector/package.json
RUN yarn install --production && yarn cache clean
COPY --from=builder /app/node_modules/database/dist ./node_modules/database/dist
COPY --from=builder /app/node_modules/statuspageapi/lib ./node_modules/statuspageapi/lib
COPY --from=builder /app/dist ./
CMD ["node", "downdetector/index.js"]
