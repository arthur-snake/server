FROM gradle:6.1.1-jdk8

COPY . .
RUN gradle build