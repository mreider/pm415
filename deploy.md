# Deployment instructions

## Heroku

Heroku is cloud platform that uses `Procfile` to identify starting file. In this app it is `server.js`. Used environment is Nodejs version 8.11.x. Application can work on any other host \(AWS, DigitalOcean\) with corresponding setup.

### Prerequisites

* Heroku CLI

### How to

* Create Heroku app

  ```text
    heroku apps:create $APP
  ```

* Install addons, log viewer and MariaDB \(modern MySQL\):

  ```text
    heroku addons:create logentries:le_tryit --app $APP
    heroku addons:create jawsdb-maria:kitefin --app $APP
    heroku addons:create sendgrid:starter --app zag1
  ```

* Clone repository from GitHub

  ```text
    git clone git@github.com:mreider/zagnut.git
    cd zagnut
  ```

* Add new remote to Git pointing to Heroku

  ```text
    heroku git:remote --app zag1
  ```

* Review existing app environment variables, 3 should exists: sendgrid username, password and jawsdb connection string

  ```text
    heroku config
  ```

* Set require environment variables

  ```text
    heroku config:set DATABASE_URL=$JAWSDB_MARIA_URL (see output of previous step)
  ```

* Push code to heroku

  ```text
    git push heroku
  ```

