// Idées sauvegardées :
// https://collabnix.com/5-minutes-to-continuous-integration-pipeline-using-docker-jenkins-github-on-play-with-docker-platform/

pipeline {
    agent none

    environment {
        APPLICATION_NAME = 'family-calendar-frontend'
    }

    stages {
        stage('SCM Checkout') {
            agent any
            steps {
                step([$class: 'WsCleanup'])
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'master']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'family-calendar-frontend']],
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [[credentialsId: 'Nico-Github', url: "https://github.com/NicolasMura/family-calendar-frontend.git"]]
                ])
            }
        }
        stage('Build & Test') {
            agent {
                docker {
                    image 'cypress/base:12.19.0'
                    // Run the container on the node specified at the top-level of the Pipeline, in the same workspace, rather than on a new node entirely:
                    reuseNode true
                }
            }
            steps {
                sh '''#!/bin/bash
                    whoami
                    pwd
                    ls -la
                    node --version
                    yarn --version
                    CYPRESS_INSTALL_BINARY=0 yarn && BUILD_ID=${BUILD_ID} yarn generate-build-infos && yarn build:production
                '''
            }
        }
        stage('Build Docker image') {
            agent any
            steps {
                sh '''#!/bin/bash
                    whoami
                    pwd
                    ls -la
                    docker --version
                '''
            }
        }
    }
}
