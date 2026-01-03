FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM node:18-alpine

WORKDIR /app

# Set environment variables (for runtime)
ENV NODE_ENV=production

# Copy package files
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built files and necessary configs
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.mjs ./
# Copy public directory if it exists (uncomment if you have a public folder)
# COPY --from=build /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# COPY set-env.sh /docker-entrypoint.d/set-env.sh
# RUN chmod +x /docker-entrypoint.d/set-env.sh

# Start the application
CMD ["npm", "start"]