# ==========================================
# STAGE 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Build Spring Boot Backend
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline

COPY backend/src ./src
# Copy built frontend assets into static resources
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN mvn package -DskipTests

# ==========================================
# STAGE 3: Final Production Runtime Image
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create directory for persistent database storage
RUN mkdir -p /app/data

# Copy built full-stack JAR file
COPY --from=backend-builder /app/backend/target/*.jar app.jar

EXPOSE 8080

# Configure environment defaults
ENV PORT=8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
