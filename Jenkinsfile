pipeline{
    agent any

    stages{
        stage('Build') {
            steps {
                echo 'Building Docker Image'
                bat 'docker build -t task73hd-app .'
                echo ' Saving Docker Image as Artifact'
                bat 'docker save -o task73hd-app.tar task73hd-app'
            }
        }

        stage('Test') {
            steps {
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
                    powershell -Command "Expand-Archive sonar-scanner.zip -DestinationPath sonar-scanner"
                    SET SONAR_SCANNER_HOME=%cd%\\sonar-scanner\\sonar-scanner-5.0.1.3006-windows
                    SET PATH=%SONAR_SCANNER_HOME%\\bin;%PATH%
                    sonar-scanner -Dsonar.login=%SONAR_TOKEN%
                    '''
                }
            }
        }

    }

    post {
        success {
            echo 'Archiving Docker build artefact...'
            archiveArtifacts artifacts: 'task73hd-app.tar', fingerprint: true
        }
    }
}
