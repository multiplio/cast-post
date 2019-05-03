project=multipl
name=cast-post

.PHONY:build
build: .image-timestamp
	@touch .image-timestamp

.image-timestamp: $(wildcard *.js) package.json yarn.lock Dockerfile
	docker image build \
		-t ${project}/${name}:latest \
		.

.PHONY:run
run:
	docker container run \
		--name ${project}-${name}-dev \
		--env-file .env \
		-p 7000:7000 \
		-t ${project}/${name}:latest

.PHONY:kill
kill:
	docker rm $$( \
	docker kill $$( \
	docker ps -aq \
	--filter="name=${project}-${name}-dev" ))

