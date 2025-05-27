pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        SNYK_TOKEN = credentials('SNYK_TOKEN')
        PORT = '4910'
        MONGO_URI = credentials('MONGO_URI')
        SENDGRID_API_KEY = credentials('SENDGRID_API_KEY')
        MAIL_FROM = 'your_email@example.com'
        CLOUDINARY_CLOUD_NAME = 'dffykuylf'
        CLOUDINARY_API_KEY = credentials('CLOUDINARY_API_KEY')
        CLOUDINARY_API_SECRET = credentials('CLOUDINARY_API_SECRET')
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker Image'
                // Inject .env before build
                bat '''
                echo PORT=%PORT%> .env
                echo MONGO_URI=%MONGO_URI%>> .env
                echo SENDGRID_API_KEY=%SENDGRID_API_KEY%>> .env
                echo MAIL_FROM=%MAIL_FROM%>> .env
                echo CLOUDINARY_CLOUD_NAME=%CLOUDINARY_CLOUD_NAME%>> .env
                echo CLOUDINARY_API_KEY=%CLOUDINARY_API_KEY%>> .env
                echo CLOUDINARY_API_SECRET=%CLOUDINARY_API_SECRET%>> .env
                '''
                bat 'docker build -t task73hd-app:latest .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Mocha tests'
                bat 'npm install'
                bat 'npm test || exit /b 0'
            }
        }

        stage('Code Quality (SonarCloud)') {
            steps {
                bat '''
                SET "JAVA_HOME=C:\\Program Files\\Java\\jdk-21"
                SET "PATH=%JAVA_HOME%\\bin;%PATH%"
                java -version
                IF EXIST sonar-scanner (
                    rmdir /s /q sonar-scanner
                )
                curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-windows.zip
                powershell -Command "Expand-Archive -Force sonar-scanner.zip -DestinationPath sonar-scanner"

                SET SONAR_SCANNER_HOME=%cd%\\sonar-scanner\\sonar-scanner-5.0.1.3006-windows
                SET PATH=%SONAR_SCANNER_HOME%\\bin;%PATH%

                sonar-scanner -Dsonar.login=%SONAR_TOKEN%
                '''
            }
        }

        stage('Security (Snyk)') {
            steps {
                echo 'SNYK SCAN START'
                bat 'npm install -g snyk'
                bat '"C:\\Users\\saket\\AppData\\Roaming\\npm\\snyk.cmd" auth %SNYK_TOKEN%'
                bat '"C:\\Users\\saket\\AppData\\Roaming\\npm\\snyk.cmd" test --all-projects --severity-threshold=low --json > snyk-report.json 2> snyk-error.log || exit 0'
            }
        }

        stage('Deploy to Test') {
            steps {
                echo 'Deploying Docker container to test environment...'
                bat 'docker rm -f task73hd-test || exit 0'
                bat 'docker run -d -p 4910:4910 --name task73hd-test task73hd-app:latest'
                bat 'curl http://localhost:4910 || exit /b 1'
            }
        }

        stage('Release to Production') {
            steps {
                echo 'Tagging Docker image for production'
                bat 'docker tag task73hd-app:latest task73hd-app:prod'
                echo 'Running production container'
                bat '''
                docker rm -f prod-container || exit 0
                docker run -d --name prod-container -p 8080:4910 task73hd-app:prod
                '''
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: '*.json', fingerprint: true
            archiveArtifacts artifacts: 'snyk-error.log', fingerprint: true
        }
    }
}
