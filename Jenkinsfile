// Idées sauvegardées :
// https://collabnix.com/5-minutes-to-continuous-integration-pipeline-using-docker-jenkins-github-on-play-with-docker-platform/

pipeline {
    agent none

    environment {
        APPLICATION_NAME = 'family-calendar-frontend'
        DOCKER_IMAGE_NAME = 'nicolasmura/family-calendar-frontend'
        DOCKER_IMAGE = ''
        DOCKER_IMAGE_LATEST = ''
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
                    userRemoteConfigs: [[credentialsId: 'Nico-Github', url: 'https://github.com/NicolasMura/family-calendar-frontend.git']]
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
        stage('Build & Push Docker image') {
            agent any
            steps {
                sh '''#!/bin/bash
                    whoami
                    pwd
                    ls -la
                    docker --version
                '''
                withCredentials([file(credentialsId: 'family-calendar.nicolasmura.com_privkey.pem', variable: 'privkey'),
                                 file(credentialsId: 'family-calendar.nicolasmura.com_fullchain.pem', variable: 'fullchain')]) {
                    writeFile file: 'ssl/privkey.pem', text: readFile(privkey)
                    writeFile file: 'ssl/fullchain.pem', text: readFile(fullchain)
                }
                script {
                    DOCKER_IMAGE = docker.build "$DOCKER_IMAGE_NAME:$BUILD_NUMBER"
                    DOCKER_IMAGE_LATEST = docker.build "$DOCKER_IMAGE_NAME"
                    // Assume the Docker Hub registry by passing an empty string as the first parameter
                    // @TODO: sécuriser le login (cf. job logs : warning WARNING! Using --password via the CLI is insecure. Use --password-stdin.)
                    docker.withRegistry('' , 'dockerhub') {
                        DOCKER_IMAGE.push()
                        DOCKER_IMAGE_LATEST.push()
                    }
                }
            }
        }
        stage('Remove Unused Docker Images') {
            agent any
            steps {
                sh "docker image ls"
                sh "docker rmi $DOCKER_IMAGE_NAME:$BUILD_NUMBER $DOCKER_IMAGE_NAME:latest"
                sh "docker image ls"
            }
        }
    }
}
