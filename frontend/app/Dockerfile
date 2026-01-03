FROM node:18 AS build

WORKDIR /app
COPY . .
RUN npm install


RUN npm run build


FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=build /app/.next ./.next
COPY --from=build /app/package*.json ./
COPY --from=build /app/next.config.mjs ./

RUN npm install 

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment variables (for runtime)
ENV NODE_ENV=production

# COPY set-env.sh /docker-entrypoint.d/set-env.sh
# RUN chmod +x /docker-entrypoint.d/set-env.sh


# Use the script as ENTRYPOINT
# ENTRYPOINT ["/docker-entrypoint.d/set-env.sh"]
# Start the application
CMD ["npm", "start"]
