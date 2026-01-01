FROM node:18 AS build

WORKDIR /app

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_USER_SERVICE_API
ARG NEXT_PUBLIC_CORE_SERVICE_API
ARG NEXT_PUBLIC_SOCKET_SERVICE_API
ARG NEXT_PUBLIC_NOTIFICATION_SERVICE_API

# Set as environment variables for build
ENV NEXT_PUBLIC_USER_SERVICE_API=$NEXT_PUBLIC_USER_SERVICE_API
ENV NEXT_PUBLIC_CORE_SERVICE_API=$NEXT_PUBLIC_CORE_SERVICE_API
ENV NEXT_PUBLIC_SOCKET_SERVICE_API=$NEXT_PUBLIC_SOCKET_SERVICE_API
ENV NEXT_PUBLIC_NOTIFICATION_SERVICE_API=$NEXT_PUBLIC_NOTIFICATION_SERVICE_API

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Verify build was successful
RUN test -d .next || (echo "ERROR: Build failed - .next directory not found!" && exit 1)

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install all dependencies (Next.js runtime needs all deps)
RUN npm ci && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/package.json ./

# Verify .next directory exists and has BUILD_ID
RUN test -d .next || (echo "ERROR: .next directory not found!" && exit 1)
RUN test -f .next/BUILD_ID || (echo "ERROR: BUILD_ID not found in .next directory!" && exit 1)

EXPOSE 3000

CMD ["npm", "start"]
