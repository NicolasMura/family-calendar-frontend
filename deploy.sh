#!/bin/bash

source .env;

# récupération des paramètres
while getopts ":d" option;
do
  # echo "getopts a trouvé l'option $option"
  case ${option} in
    d )
      echo "flag --demo !"
      demo=1
      $PATH_DEST=$PATH_DEST_DEMO
      ;;
    \?)
      echo "$OPTARG : option invalide"
      exit 1
      ;;
  esac
done

cd dist
tar czf ../dist-public.tar.gz public/
cd ..

scp -i $PATH_SSH_KEY dist-public.tar.gz $USER@$HOSTNAME:$PATH_DEST && echo transfer successful!;
ssh -i $PATH_SSH_KEY $USER@$HOSTNAME bash -c "'
  cd $PATH_DEST
  pwd
  rm -Rf public
  sleep 1s
  echo Décompression...
  tar xzf dist-public.tar.gz
  # rm dist-public.tar.gz
'";
echo done
