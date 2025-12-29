#!/usr/bin/sh
# Build app and create a zip package for deploying, for example to AWS Elastic Beanstalk.
#
# Nutakortti consists of three parts: backend, frontend and admin-frontend.
# Building each from scratch in AWS EB sometimes takes more time than the maximum allowed command timeout.
# This will result in a failed environment update, which might lead to EB being in an unstable, unusable state.
# If that happens, the best thing to do is to wait for a few hours. Re-deploying using CLI usually only makes things worse.
#
# As the command timeout setting in AWS EB doesn't quite work, an alternative for quickly updating the environment is to build the packages before uploading.
# The backend uses environment variables only when running, not when building. It's therefore trivial to pre-build.
# The admin-frontend and frontend use some environment variables that need to be defined during build.
#
# The zip file created by this script can be uploaded to AWS EB and it will launch the application with environment variables configured in AWS.

required_version="v24.11.0"
node_version=$(node --version)
if [ "$node_version" != "$required_version" ]
then
    echo "Warning: Node.js version ($node_version) does not match the one in use ($required_version)"
    echo Press return to still continue, Ctrl-C to abort.
    read tmp
fi

tmpdir=$(mktemp -d)
mkdir $tmpdir/backend

echo "Is this a <dev> or <prod> package? [dev]"
read package_env
[ ! "$package_env" ] && package_env=dev
if [ "$1" ]
then
    echo Enter value for: VITE_ENABLE_EXTRA_ENTRIES
    read VITE_ENABLE_EXTRA_ENTRIES
    export VITE_ENABLE_EXTRA_ENTRIES
    echo Enter value for: VITE_ENABLE_KOMPASSI_INTEGRATION
    read VITE_ENABLE_KOMPASSI_INTEGRATION
    export VITE_ENABLE_KOMPASSI_INTEGRATION
    echo Enter value for: VITE_USE_ALT_ERR_MSG
    read VITE_USE_ALT_ERR_MSG
    export VITE_USE_ALT_ERR_MSG
else
    echo Run the script with any parameter to use other than these values:
    echo "   export VITE_ENABLE_EXTRA_ENTRIES=true"
    echo "   export VITE_ENABLE_KOMPASSI_INTEGRATION=true"
    echo "   export VITE_USE_ALT_ERR_MSG="
    export VITE_ENABLE_EXTRA_ENTRIES=true
    export VITE_ENABLE_KOMPASSI_INTEGRATION=true
    export VITE_USE_ALT_ERR_MSG=
fi
echo Enter value for: VITE_ENTRA_TENANT_ID
read VITE_ENTRA_TENANT_ID
export VITE_ENTRA_TENANT_ID
echo Enter value for: VITE_ENTRA_CLIENT_ID
read VITE_ENTRA_CLIENT_ID
export VITE_ENTRA_CLIENT_ID
echo Enter value for: VITE_ENTRA_REDIRECT_URI
read VITE_ENTRA_REDIRECT_URI
export VITE_ENTRA_REDIRECT_URI

export VITE_API_URL=/api
cd frontend
npm ci
npm run build
cp -r ./build $tmpdir/backend/public
cd ..

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
zipfile=$(date +"nutakortti-%Y%m%d-$githash-$package_env.zip")

cat > $tmpdir/Dockerfile << EOF
FROM node:24.11.0-alpine

RUN echo "Original zip package: $zipfile"

RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Helsinki /etc/localtime

COPY ./backend /backend

WORKDIR /backend

EXPOSE 3000
CMD ["npm", "run", "start"]
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
