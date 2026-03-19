FROM alpine:3.18

RUN adduser -D -u 1000 -g 1000 -s /bin/sh www

RUN apk add --no-cache --update php81-fpm php81-pdo php81-pdo_sqlite php81-session supervisor nginx

COPY src/config/fpm.conf /etc/php81/php-fpm.d/www.conf
COPY src/config/supervisord.conf /etc/supervisord.conf
COPY src/config/nginx.conf /etc/nginx/nginx.conf
COPY src/config/php.ini /etc/php81/php.ini

COPY src/challenge /www

RUN chown -R www:www /var/lib/nginx

EXPOSE 80

CMD /usr/bin/supervisord -c /etc/supervisord.conf
