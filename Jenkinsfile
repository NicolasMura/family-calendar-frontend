pipeline {
    agent {
        docker {
            image 'node:14-alpine'
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
