FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
COPY .env .env

# Expose port
EXPOSE 4910

# Start the app
CMD ["node", "server.js"]
