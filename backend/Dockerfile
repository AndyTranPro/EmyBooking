# backend/Dockerfile

# Stage 1: Build stage
FROM node:20 AS build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Assuming there's a build script defined in package.json for production build
RUN npm run build

# Stage 2: Production stage
FROM node:20

WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "serve"]