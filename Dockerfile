# Standalone use:
# > docker build -t family-calendar-frontend .
# > docker run --name family-calendar-frontend -dp 801:80 family-calendar-frontend (non testé)

# FROM nginx:alpine
# WORKDIR /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
# COPY dist/public/ .



# Create image based on the official Apache httpd image from the dockerhub
FROM httpd:2.4.38

# Change directory so that our commands run inside this directory
WORKDIR /usr/local/apache2/htdocs/family-calendar/frontend

# Copy custom configuration
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./family-calendar.nicolasmura.com-le-ssl.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
# COPY ./family-calendar.nicolasmura.com-le-ssl.conf /usr/local/apache2/conf/httpd.conf
# COPY ./key.pem /usr/local/apache2/conf/server.key
# COPY ./cert.pem /usr/local/apache2/conf/server.crt

# Copy Angular build
COPY dist/public/ .

# Expose the port the app runs in (non testé)
EXPOSE 4200
