# Create image based on the official Apache httpd image from the dockerhub
FROM httpd:2.4.38

# Copy custom configuration (Enable SSL + load extra/httpd-vhosts.conf)
COPY ./config/my-httpd.conf                         /usr/local/apache2/conf/httpd.conf
COPY ./config/family-calendar.nikouz.fr-docker.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
COPY ./ssl/fullchain.pem                            /usr/local/apache2/conf/server.crt
COPY ./ssl/privkey.pem                              /usr/local/apache2/conf/server.key

# Change directory so that our commands run inside this directory
WORKDIR /usr/local/apache2/htdocs/family-calendar/frontend

# Copy Angular build
COPY dist/public/ .

# Expose the port the app runs in (non testé)
EXPOSE 28443

# FROM nginx:alpine
# WORKDIR /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
# COPY dist/public/ .
