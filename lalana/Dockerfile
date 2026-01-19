# Étape 1 : build avec Gradle + JDK 17
FROM gradle:8.14-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY src src

# Fix cache Gradle
ENV GRADLE_USER_HOME=/app/.gradle
RUN mkdir -p /app/.gradle

# Build Spring Boot
RUN gradle clean bootJar --no-daemon

# Étape 2 : runtime léger
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
