# post
[![Build Status](https://travis-ci.org/multiplio/cast-post.svg?branch=master)](https://travis-ci.org/multiplio/cast-post)

Receive, verify and route content to publishers.

## routes

| method | route | success | failure | comment |
|:---:|:---|:---|:---|---:|
| GET | /ready | 200 'ok' | - | kubernetes ready probe |
| POST | / | 200 'ok' | 401 \<error\> \|\| 400 \<error\> \|\| 503 | assumes session cookie present |

## format
Expects request to have the following format:
```
{
  text: "Post text.",
  desc: "Post description.",
  fontSize: "Preffered size of the text.",
  spacing: "Preffered line spacing.",
}
```

## environment
```
NODE_ENV=production
PROGRAM_ALIAS=post
PORT=7000

#level=debug|info
LOG_LEVEL=debug
#file=true|false
LOG_FILE=false

#must be same as for login server
COOKIE_SECRET=

DATABASE_NAME=
DATABASE_PROTOCOL=
DATABASE_ADDRESS=
DATABASE_OPTIONS=
DATABASE_USER=
DATABASE_PASSWORD=

IPFS_ADDRESS=
IPFS_PORT=
IPFS_PROTOCOL=

PUBLISHER_ADDRESS=
```
