projectID=tekwrks
repo=quackup
name=post
version=1.0.0

build: .image-timestamp
	@touch .image-timestamp

.image-timestamp: $(wildcard *.js) package.json yarn.lock Dockerfile
	docker image build \
		-t ${repo}/${name}:${version} \
		.

.PHONY:run
run:
	docker container run \
		--name ${repo}-${name}-dev \
		--env-file .env \
		-p 7000:7000 \
		-t ${repo}/${name}:${version}

.PHONY:run-noenv
run-noenv:
	docker container run \
		--rm \
		--name ${repo}-${name}-dev \
		-p 7000:7000 \
		-t ${repo}/${name}:${version}

.PHONY:kill
kill:
	docker rm $$( \
	docker kill $$( \
	docker ps -aq \
	--filter="name=${repo}-${name}-dev" ))

.PHONY: push
push:
	set -ex;
	docker tag \
		${repo}/${name}:${version} \
		gcr.io/${projectID}/${name}:${version}
	docker push \
		gcr.io/${projectID}/${name}:${version}

