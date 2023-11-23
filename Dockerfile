#############
# building config-loader
#############
FROM --platform=linux/amd64 golang:1.21.0 as gobuilder


WORKDIR /app

COPY config-loader/*.go config-loader/go.mod config-loader/go.sum ./

RUN go build -o config-loader .

#############
# building cronus
#############

FROM --platform=linux/amd64 node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat sed

WORKDIR /app


# Install dependencies 
COPY cronus/package.json cronus/package-lock.json*  ./
RUN npm ci 



# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY cronus/ .


ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production


ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/defaults/ /app/defaults/ 
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=gobuilder /app/config-loader /usr/local/bin/

# perms 
RUN chown nextjs:nodejs -R /app 

RUN npm install prisma @prisma/client

## installing bash to run startup script

RUN apk update && \
    apk upgrade && \ 
    apk add bash 

USER root

EXPOSE 4000

ENV PORT 4000
ENV DOCKER true


# Set the default shell to Bash
SHELL ["/bin/bash", "-c"]


CMD ["./scripts/run.sh"]
