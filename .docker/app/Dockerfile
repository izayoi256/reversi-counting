FROM node:20-alpine

ENV LANG=C.UTF-8 \
    TZ=Asia/Tokyo

RUN set -x \
    && apk add shadow \
    && useradd -d /app app

USER node
WORKDIR /app
EXPOSE 5173

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
