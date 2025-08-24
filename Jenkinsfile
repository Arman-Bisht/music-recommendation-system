pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = credentials('docker-registry-url')
        DOCKER_CREDS = credentials('docker-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh '''
                        python -m pip install --upgrade pip
                        pip install pytest
                        pip install -r requirements.txt
                        pytest
                    '''
                }
            }
        }
        
        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run lint
                        npm run build
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t ${DOCKER_REGISTRY}/music-recommender-backend:${BUILD_NUMBER} -f backend/backend.dockerfile ./backend
                    docker build -t ${DOCKER_REGISTRY}/music-recommender-frontend:${BUILD_NUMBER} -f frontend/frontend.dockerfile ./frontend
                    
                    docker tag ${DOCKER_REGISTRY}/music-recommender-backend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/music-recommender-backend:latest
                    docker tag ${DOCKER_REGISTRY}/music-recommender-frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/music-recommender-frontend:latest
                '''
            }
        }
        
        stage('Push Docker Images') {
            steps {
                sh '''
                    echo ${DOCKER_CREDS_PSW} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_CREDS_USR} --password-stdin
                    
                    docker push ${DOCKER_REGISTRY}/music-recommender-backend:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/music-recommender-backend:latest
                    
                    docker push ${DOCKER_REGISTRY}/music-recommender-frontend:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/music-recommender-frontend:latest
                '''
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    ssh -o StrictHostKeyChecking=no ${DEV_SERVER} "cd /opt/music-recommender && \
                    docker-compose pull && \
                    docker-compose up -d"
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input message: 'Approve deployment to production?', ok: 'Deploy'
                }
                
                sh '''
                    ssh -o StrictHostKeyChecking=no ${PROD_SERVER} "cd /opt/music-recommender && \
                    docker-compose pull && \
                    docker-compose up -d"
                '''
            }
        }
    }
    
    post {
        always {
            sh 'docker logout ${DOCKER_REGISTRY}'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification steps here (email, Slack, etc.)
        }
    }
}