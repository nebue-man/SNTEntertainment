FROM node:20-alpine

# Prisma's schema engine binary requires OpenSSL at runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Install deps first — layer is cached until package files change
COPY package*.json ./
RUN npm ci

# Generate Prisma client against the local schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and compile TypeScript
# (rootDir is "." so output lands in dist/src/ and dist/prisma/)
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Port must match PORT env var (default 4000)
EXPOSE 4000

# Apply any pending migrations then start the compiled server.
# "dist/src/index.js" is the real entry point given rootDir ".";
# the package.json "start" script has the wrong path for that reason.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]
