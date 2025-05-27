pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        SNYK_TOKEN = credentials('SNYK_TOKEN')
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker Image'
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
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
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
                    SET PATH=%SONAR_SCANNER_HOME%\\bin;%PATH%"

                    echo JAVA_HOME is %JAVA_HOME%
                    java -version

                    sonar-scanner -Dsonar.login=%SONAR_TOKEN%
                    '''
                }
            }
        }

        stage('Security (Snyk)') {
            steps {
                withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
                    echo 'SNYK SCAN START'
                    bat 'npm install -g snyk'
                    bat "snyk auth %SNYK_TOKEN%"
                    bat "snyk test --all-projects --severity-threshold=low --json > snyk-report.json 2> snyk-error.log || exit 0"
                }
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
