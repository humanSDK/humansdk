FROM node:18 AS build
WORKDIR /app

ARG NEXT_PUBLIC_USER_SERVICE_API
ARG NEXT_PUBLIC_CORE_SERVICE_API
ARG NEXT_PUBLIC_SOCKET_SERVICE_API
ARG NEXT_PUBLIC_NOTIFICATION_SERVICE_API

ENV NEXT_PUBLIC_USER_SERVICE_API=$NEXT_PUBLIC_USER_SERVICE_API
ENV NEXT_PUBLIC_CORE_SERVICE_API=$NEXT_PUBLIC_CORE_SERVICE_API
ENV NEXT_PUBLIC_SOCKET_SERVICE_API=$NEXT_PUBLIC_SOCKET_SERVICE_API
ENV NEXT_PUBLIC_NOTIFICATION_SERVICE_API=$NEXT_PUBLIC_NOTIFICATION_SERVICE_API

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Verify build was successful
RUN test -d .next || (echo "ERROR: Build failed - .next directory not found!" && exit 1)

# -----------------------------

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/package.json ./

# Verify .next directory exists
RUN test -d .next || (echo "ERROR: .next directory not found!" && exit 1)

EXPOSE 3000

CMD ["npm", "start"]
