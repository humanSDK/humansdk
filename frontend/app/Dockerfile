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

# Verify standalone output was created
RUN test -d .next/standalone || (echo "ERROR: Standalone output not found!" && ls -la .next/ && exit 1)
RUN test -f .next/standalone/server.js || (echo "ERROR: server.js not found!" && exit 1)

# Ensure static directory exists (create empty if it doesn't)
RUN mkdir -p .next/static || true

# -----------------------------

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone output
COPY --from=build /app/.next/standalone ./

# Copy static files (will copy empty directory if static doesn't exist, which is fine)
RUN mkdir -p ./.next
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

# The standalone output includes server.js in the root
CMD ["node", "server.js"]
