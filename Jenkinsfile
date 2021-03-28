pipeline {
    agent {
        docker {
            // image 'node:14-alpine'
            image 'nicolasmura/family-calendar-frontend-jenkins'
        }
    }

    stages {
        stage('build') {
            steps {
                echo 'Hello Bob!'
                // sh 'pwd && npm --version'
            }
        }
    }
}
