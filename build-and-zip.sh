#!/usr/bin/sh
# Build app and create a zip package for deploying, for example to AWS Elastic Beanstalk.
#
# Nutakortti consists of three parts: backend, frontend and admin-frontend.
# Building each (especially admin-frontend) from scratch in AWS EB sometimes takes more time than the maximum allowed command timeout.
# This will result in a failed environment update, which might lead to EB being in an unstable, unusable state.
# If that happens, the best thing to do is to wait for a few hours. Re-deploying using CLI usually only makes things worse.
#
# As the command timeout setting in AWS EB doesn't quite work, an alternative for quickly updating the environment is to build the packages before uploading.
# The backend uses environment variables only when running, not when compiling. It's therefore trivial to pre-build.
# When compiling, the frontend only uses a single environment variable, with a trivial default value. The frontend can also be thus easily pre-built.
# For building the admin-frontend you are asked to input the correct environment variable values when running this script.
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
    echo Enter value for: REACT_APP_ENABLE_EXTRA_ENTRIES
    read REACT_APP_ENABLE_EXTRA_ENTRIES
    export REACT_APP_ENABLE_EXTRA_ENTRIES
    echo Enter value for: REACT_APP_ENABLE_KOMPASSI_INTEGRATION
    read REACT_APP_ENABLE_KOMPASSI_INTEGRATION
    export REACT_APP_ENABLE_KOMPASSI_INTEGRATION
    echo Enter value for: VITE_USE_ALT_ERR_MSG
    read VITE_USE_ALT_ERR_MSG
    export VITE_USE_ALT_ERR_MSG
else
    echo Run the script with any parameter to use other than these values:
    echo "   export REACT_APP_ENABLE_EXTRA_ENTRIES=true"
    echo "   export REACT_APP_ENABLE_KOMPASSI_INTEGRATION=true"
    echo "   export VITE_USE_ALT_ERR_MSG="
    export REACT_APP_ENABLE_EXTRA_ENTRIES=true
    export REACT_APP_ENABLE_KOMPASSI_INTEGRATION=true
    export VITE_USE_ALT_ERR_MSG=
fi
echo Enter value for: REACT_APP_ENTRA_TENANT_ID
read REACT_APP_ENTRA_TENANT_ID
export REACT_APP_ENTRA_TENANT_ID
echo Enter value for: REACT_APP_ENTRA_CLIENT_ID
read REACT_APP_ENTRA_CLIENT_ID
export REACT_APP_ENTRA_CLIENT_ID
echo Enter value for: REACT_APP_ENTRA_REDIRECT_URI
read REACT_APP_ENTRA_REDIRECT_URI
export REACT_APP_ENTRA_REDIRECT_URI

export VITE_API_URL=/api
cd frontend
npm ci
npm run build
cp -r ./build $tmpdir/backend/public
cd ..

export REACT_APP_API_URL=/api
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
zipfile=$(date +"nutakortti-app-%Y%m%d-$githash-$package_env.zip")

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
