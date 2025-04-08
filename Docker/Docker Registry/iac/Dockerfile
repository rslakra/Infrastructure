# Apache HTTP Server Base Image
FROM httpd:2.4

# Define Env Variables
LABEL maintainer="Rohtash Lakra <work.lakra@gmail.com>"

# Define Env Variables
ENV APP_NAME=webapp-service

# Sets the working directory inside the Docker container at `/app`
WORKDIR /usr/local/apache2/htdocs/

# Copy configuration file
COPY ./../conf/httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy 'webapp' folder contents under '/usr/local/apache2/htdocs/' folder
COPY ./../webapp/ /usr/local/apache2/htdocs/.

# 80 is the default port the server is listening on
EXPOSE 80
