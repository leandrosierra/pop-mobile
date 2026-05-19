FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ENV EXPO_PUBLIC_POP_API_ORIGIN=https://api.pop.leandro-sierra.com
ENV EXPO_PUBLIC_POP_ENV_LABEL=PROD
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
# HEALTHCHECK pour Coolify : wget --spider vers nginx local. nginx:alpine
# est tres rapide a boot, donc start-period 15s suffit largement.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -T 4 --spider http://127.0.0.1:80/ || exit 1
