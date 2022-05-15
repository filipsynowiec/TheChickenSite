# TheChickenSite

## Install

- `npm install` - install dependencies

## Build

- `npm run compile::sass` - build sass ( while developing use `npm run watch:sass` to compile on every change). _Do not modify `style.css` file. It is an output file and will be overwritten during next compilation. Modify `index.scss` instead._

## Run

- `./src/app.js` in project main directory

## Setup docker

- `sudo docker run --name psql -e POSTGRES_USER=dude -e POSTGRES_PASSWORD=duderino -e POSTGRES_DB=TCSDB -p 5432:5432 -d postgres`

## Connect to container

- `sudo docker exec -it psql /bin/bash`

## Log in to database

- `psql --dbname TCSDB --username dude`

You should change config files to include your actual database login info.

As long as you keep the same server secret key, you might run into issues: if you remove user from database, their token WILL stay valid and might become connected to another account.

It is highly recommended to change private key every time the server is run.
