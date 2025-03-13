#!/usr/bin/sh
# Create a zip package for uploading and deploying to AWS Elastic Beanstalk.
#
# Nutakortti consists of three parts: backend, frontend and admin-frontend.
# Building each (especially admin-frontend) from scratch in AWS EB sometimes takes more than the maximum allowed command timeout.
# This will result in a failed environment update, which might lead to EB being in an unstable, unusable state.
# If that happens, the best thing to do is to wait for a few hours. Re-deploying using CLI usually only makes things worse.
#
# As the command timeout setting in AWS EB doesn't seem to work, an alternative for quickly updating the environment is to build the packages before uploading.
# The backend uses environment variables only when running, not when compiling. Therefore the backend can easily be pre-built.
# The frontend only uses a single environment variable when compiling, with a good trivial default value. Hence the frontend can also be easily pre-built.
# For the admin-frontend you are asked to input the correct environment variable values when running this script.
#
# This script builds everything and creates a zip file for dropping to AWS EB so that it can just launch the application with environment variables configured in AWS.

node_version=$(node --version)
if [ "$node_version" != "v22.12.0" ]
then
    echo Warning: Node.js version does not match the one in Dockerfile.
    echo Press return to still continue, Ctrl-C to abort.
    read tmp
fi

tmpdir=$(mktemp -d)
mkdir $tmpdir/backend

export REACT_APP_API_URL=/api
cd frontend
npm ci
npm run build
cp -r ./build $tmpdir/backend/public
cd ..

echo Enter value for: REACT_APP_ENABLE_EXTRA_ENTRIES
read REACT_APP_ENABLE_EXTRA_ENTRIES
export REACT_APP_ENABLE_EXTRA_ENTRIES
echo Enter value for: REACT_APP_ENABLE_KOMPASSI_INTEGRATION
read REACT_APP_ENABLE_KOMPASSI_INTEGRATION
export REACT_APP_ENABLE_KOMPASSI_INTEGRATION
echo Enter value for: REACT_APP_ENTRA_TENANT_ID
read REACT_APP_ENTRA_TENANT_ID
export REACT_APP_ENTRA_TENANT_ID
echo Enter value for: REACT_APP_ENTRA_CLIENT_ID
read REACT_APP_ENTRA_CLIENT_ID
export REACT_APP_ENTRA_CLIENT_ID
echo Enter value for: REACT_APP_ENTRA_REDIRECT_URI
read REACT_APP_ENTRA_REDIRECT_URI
export REACT_APP_ENTRA_REDIRECT_URI
cd admin-frontend
npm ci
npm run build
cp -r ./build $tmpdir/backend/public-admin
cd ..

cd backend
npm ci
npm run build
cp -dr certs dist node_modules package.json package-lock.json $tmpdir/backend/
cd ..

cp docker-compose.yml $tmpdir/

githash=$(git describe --always)
zipfile=$(date +"nutakortti-app-%Y%m%d-%H%M-$githash.zip")

cat > $tmpdir/Dockerfile << EOF
FROM node:22.12.0

RUN echo "Original zip package: $zipfile"

ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/\$TZ /etc/localtime

ADD ./backend /backend

WORKDIR /backend

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
EOF

cd $tmpdir
echo $githash > git-commit-hash.txt
# Sometimes EB might complain about missing files so make sure there isn't a permission problem.
find ./ -type d -exec chmod a+x {} \;
chmod -R a+r *
zip -q -r --symlinks $zipfile *
cd -

cp $tmpdir/$zipfile ~/
echo Created: ~/$zipfile
