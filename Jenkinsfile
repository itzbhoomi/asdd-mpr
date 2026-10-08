pipeline {
    agent any

    environment {
        // Non-sensitive DB connection details.
        // DB_HOST must be the Docker service/container name on the shared
        // network (asdd-mpr-main_default) that Jenkins is now connected to.
        DB_HOST        = 'foodflow-mysql'
        DB_PORT        = '3306'
        DB_NAME        = 'foodflow'
        DB_USER        = 'foodflow_user'
        JWT_SECRET     = 'foodflow_super_secret_jwt_key_2026'
        JWT_EXPIRES_IN = '24h'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                // DB_PASSWORD is stored as a Jenkins Secret Text credential.
                // Credential ID: 'foodflow-db-password'
                // Create it at: Jenkins → Manage Jenkins → Credentials → Global
                //   Kind: Secret text  |  ID: foodflow-db-password
                //   Secret: foodflow_password  (the value from docker-compose.yml)
                withCredentials([string(credentialsId: 'foodflow-db-password', variable: 'DB_PASSWORD')]) {
                    dir('backend') {
                        sh 'npm install'

                        // Wait up to 90 s for MySQL to accept TCP connections
                        // before running tests. Uses bash /dev/tcp because
                        // nc (netcat) is not installed in jenkins/jenkins:lts.
                        sh '''#!/bin/bash
                            echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
                            for i in $(seq 1 30); do
                                if (echo > /dev/tcp/${DB_HOST}/${DB_PORT}) 2>/dev/null; then
                                    echo "MySQL is reachable after ${i} attempt(s)."
                                    break
                                fi
                                echo "  attempt $i/30 – not ready, retrying in 3 s..."
                                sleep 3
                            done
                        '''

                        sh 'npm test'
                    }
                }
            }
        }

        stage('Frontend Build') {
            steps {
                // The Vite/React app lives at the repository root.
                // There is no separate frontend/ subdirectory.
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Docker Build & Verify') {
            steps {
                sh 'docker compose build'
            }
        }

    }
}
