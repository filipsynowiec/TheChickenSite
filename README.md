
# TheChickenSite

## Install
  - `npm install` - install dependencies
## Build
  -  `npm run compile::sass` - build sass ( while developing use `npm run watch:sass` to compile on every change). *Do not modify `style.css` file. It is an output file and will be overwritten during next compilation. Modify `index.scss` instead.*
 
## Run
  - `./game/app.js` in project main directory

## Setup docker
  - `sudo docker run --name psql -e POSTGRES_USER=dude -e POSTGRES_PASSWORD=duderino -e POSTGRES_DB=TCSDB -p 5432:5432 -d postgres`
  
## Connect to container
  - `sudo docker exec -it psql /bin/bash`

## Log in to database
  - `psql --dbname TCSDB --username dude`

You should probably change config files to include your actual database login info and replace the secret key for AWT tokens. 