#!/usr/bin/sh
# Build app and create a zip package.
# The package created by this script can be for example uploaded to AWS Elastic Beanstalk.
# This is useful in situations where the environment update fails via eb deploy, e.g. because of timeout reasons.
# Configure environment variables elsewhere, e.g. in AWS.

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
zipfile=$(date +"nutakortti-%Y%m%d-$githash.zip")

cat > $tmpdir/Dockerfile << EOF
FROM node:24.11.0-alpine

RUN echo "Original zip package: $zipfile"

ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/\$TZ /etc/localtime

COPY ./backend /backend

WORKDIR /backend

ENV APPLICATION_PORT=80
EXPOSE 80
CMD ["npm", "run", "start"]
EOF

cd $tmpdir
echo $githash > git-commit-hash.txt
# Sometimes EB might complain about missing files so make sure there isn't a permission problem.
find ./ -type d -exec chmod a+x {} \;
chmod -R a+r *
# Skip docker-compose.yml so that Elastic Beanstalk uses just the Dockerfile.
zip -q -r --symlinks -x docker-compose.yml $zipfile *
cd -

cp $tmpdir/$zipfile ~/
echo Created: ~/$zipfile
