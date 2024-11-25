# Use the official Node.js image from the Docker Hub
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your application files into the container
COPY . .

# Expose the port that the app will run on
EXPOSE 3000

# Command to run your app
CMD ["node", "server.js"]
