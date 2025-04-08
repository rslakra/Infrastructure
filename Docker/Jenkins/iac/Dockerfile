# Apache HTTP Server Base Image
# FROM jenkins/jenkins:latest
FROM jenkins/jenkins:2.502-jdk21

# Define Env Variables
LABEL maintainer="Rohtash Lakra <work.lakra@gmail.com>"

# Define Env Variables
ENV APP_NAME=jenkins-server
ENV JENKINS_OPTS="--httpPort=-1 --httpsPort=8083 --httpsKeyStore=/var/lib/jenkins/certificate.pfx --httpsKeyStorePassword=Password12"
# ENV JENKINS_SLAVE_AGENT_PORT=50001

# Sets the working directory inside the Docker container at `/app`
# WORKDIR /var/lib/jenkins

# Copy configuration file
COPY --chown=jenkins:jenkins certificate.pfx /var/lib/jenkins/certificate.pfx
COPY --chown=jenkins:jenkins https.key /var/lib/jenkins/pk

# 8083 is the default port the server is listening on
EXPOSE 8083
