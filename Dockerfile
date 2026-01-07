FROM node:20-alpine
USER root

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

USER 1000
WORKDIR /usr/src/app
# Copy package.json and pnpm-lock.yaml to the container
COPY --chown=1000 package.json pnpm-lock.yaml ./

# Copy the rest of the application files to the container
COPY --chown=1000 . .

RUN pnpm install
RUN pnpm run build

# Expose the application port (assuming your app runs on port 3000)
EXPOSE 3001

# Start the application
CMD ["pnpm", "start"]