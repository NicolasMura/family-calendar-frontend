#!/bin/bash

path_ssh_key='/Users/nmura/.ssh/id_rsa_ovh';
path_dst='/home/nmura/projects/family-calendar';

tar czf dist.tar.gz dist/public/

scp -i $path_ssh_key dist.tar.gz nmura@family-calendar.nicolasmura.com:$path_dst && echo transfer successful!;
ssh -i $path_ssh_key nmura@family-calendar.nicolasmura.com bash -c "'
  cd $path_dst
  rm -Rf dist
  sleep 1s
  echo Décompression...
  tar xzf dist.tar.gz
'";
echo done