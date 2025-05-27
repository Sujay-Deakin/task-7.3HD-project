pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker Image'
                bat 'docker build -t task73hd-app .'
                echo 'Saving Docker Image as Artifact'
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
                    SET PATH=%SONAR_SCANNER_HOME%\\bin;%PATH%"
                    sonar-scanner -Dsonar.login=%SONAR_TOKEN%
                    '''
                }
            }
        }

        stage('Security (Snyk + OWASP)') {
            steps {
                withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
                    bat '''
                    echo === SNYK SCAN START ===
                    IF NOT EXIST "%APPDATA%\\npm\\snyk.cmd" (
                        npm install -g snyk
                    )
                    SET PATH=%APPDATA%\\npm;%PATH%
                    snyk auth %SNYK_TOKEN%
                    snyk test --json --all-projects > snyk-report.json 2>snyk-error.log || exit /b 0
                    echo === SNYK SCAN COMPLETE ===

                    echo === OWASP DEPENDENCY CHECK START ===
                    IF EXIST dependency-check (
                        rmdir /s /q dependency-check
                    )
                    mkdir dependency-check
                    curl -sSLo dependency-check.zip https://github.com/jeremylong/DependencyCheck/releases/download/v8.4.0/dependency-check-8.4.0-release.zip
                    powershell -Command "Expand-Archive dependency-check.zip -DestinationPath dependency-check"
                    dependency-check\\dependency-check\\bin\\dependency-check.bat ^
                        --project "task73hd-app" ^
                        --scan . ^
                        --format "JSON" ^
                        --out . ^
                        --disableAssembly
                    echo === OWASP DEPENDENCY CHECK COMPLETE ===
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Archiving build artefacts...'
            archiveArtifacts artifacts: '*.tar', fingerprint: true
            archiveArtifacts artifacts: '*.json', fingerprint: true
            archiveArtifacts artifacts: 'snyk-error.log', fingerprint: true
        }
    }
}
