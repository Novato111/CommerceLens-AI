FROM node:20-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Allow Docker access
ENV HOST=0.0.0.0

CMD ["npm", "run", "dev"]