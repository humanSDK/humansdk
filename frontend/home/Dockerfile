FROM node:18 AS build

WORKDIR /home
COPY . .
RUN npm install


RUN npm run build


FROM node:18-alpine

WORKDIR /home

# Copy built files
COPY --from=build /home/.next ./.next
COPY --from=build /home/package*.json ./

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
