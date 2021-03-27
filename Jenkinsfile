pipeline {
    agent {
        docker {
            image 'node:14-alpine'
        }
    }

    stages {
        stage('build') {
            steps {
                echo 'Hello World'
                // sh 'pwd && npm --version'
            }
        }
    }
}
