# Create image based on the official Apache httpd image from the dockerhub
FROM httpd:2.4.38

# Copy custom configuration (Enable SSL + load extra/httpd-vhosts.conf)
COPY ./config/my-httpd.conf                               /usr/local/apache2/conf/httpd.conf
COPY ./config/family-calendar.nicolasmura.com-docker.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
COPY ./ssl/fullchain.pem                            /usr/local/apache2/conf/server.crt
COPY ./ssl/privkey.pem                              /usr/local/apache2/conf/server.key

# Change directory so that our commands run inside this directory
WORKDIR /usr/local/apache2/htdocs/family-calendar/frontend

# Add some debug utilities
RUN apt-get update && apt-get install nano

# Copy Angular build
COPY dist/public/ .

# Expose the port the app runs in (non testé)
EXPOSE 28443
