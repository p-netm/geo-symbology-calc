FROM node:hydrogen-alpine

RUN corepack enable
RUN apk add --no-cache libc6-compat

COPY ./ /project 
WORKDIR /project

ENV NODE_CONFIG_DIR=/project/apps/web/config
RUN yarn install
RUN yarn build

RUN yarn workspaces focus -A --production

# Use tini for NodeJS application https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#handling-kernel-signals
RUN apk add --no-cache tini curl

EXPOSE 3000

CMD ["node", "apps/web/build"]

ENTRYPOINT ["/sbin/tini", "--"]