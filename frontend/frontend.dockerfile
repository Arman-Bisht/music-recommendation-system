FROM node:20-slim as builder

# working directory
WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the code
COPY . .

# this works for env variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# build command
RUN npm run build

# this is the 2nd stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposing 80 port
EXPOSE 80

# Start command
CMD ["nginx", "-g", "daemon off;"]