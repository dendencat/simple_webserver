FROM node:22 as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM nginx:alpine

# Changed: Copy the build output folder instead of copying the entire app directory
COPY --from=builder /app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]