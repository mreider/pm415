##  pm415
Agile Product Management Software

![Alt text](https://monosnap.com/image/pj9qo9Bu0rFieI4kOEqK7lm7MyzMzT.png)

PM415 is an open source agile product management tool for product managers, and stakeholders, to strategize, prioritize, and implement agile software initiatives.

The project is a work in progress. We expect to be finished sometime in 2018. You can read the original specification[here](https://docs.google.com/document/d/1qzyaIZrmZrHYXqvUXQiCPW2eyldHfv0tzkH92gdFEgQ/edit).

## Installation

To install pm415 on Ubuntu, just spin up a server, login, and do the following.

### Sign up for Sendgrid

Go to [Sendgrid's](http://sendgrid.com) website and sign up for their free service to get started.

### Install MySQL

```
sudo apt install mysql-server
sudo mysql_secure_installation
```

Make sure you can login using `mysql -u root -p`. If not, you should read this [solution](https://askubuntu.com/questions/472811/unable-to-login-as-root-after-mysql-service-restart).

### Create a MySQL database

```
mysql -u root -p
mysql> create database pm415
```

### Install Node via NVM

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

### Give node permissions to run on port 80

```
which node
setcap 'cap_net_bind_service=+ep' /home/foo/.nvm/versions/node/v10.11.0/bin/node (or the location of your node)
```

### Edit environment file

```
sudo nano environment
```

Now paste the following environment variables declarations in the file:

```
export NODE_ENV=production
export DATABASE_URL=mysql://root:your-password@localhost:3306/pm415
export PORT=80
export SENDGRID_USERNAME=your-username
export SENDGRID_PASSWORD=your-password
```

Now restart your server `sudo reboot now`

### Fork this repo

1. Fork the [pm415](https://github.com/mreider/pm415) repo to your personal GitHub account.
2. Clone the repository to your ubuntu machine 
`git clone git@github.com:(your account)/pm415.git`
3. Optionally checkout a new branch for changes you want to make 
`git checkout -b <your_branch_name>`
4. Add a new remote for your local repository
`git remote add github <your_repository_ssh_url>`

### Install dependencies

```
cd pm415
npm install
```

### Run migrations

```
npx knex-migrate up
npm install knex -g
knex migrate:latest
```

### Whitelist your domain

Use an editor to edit config.js and add your domain name to the whitelist

```
sudo nano config.js
```

Now add your domain to this section:

```
const whitelist = [
        /localhost/,
        /your-domain.com/
      ];
```

### Install pm2

```
npm install pm2@latest -g
```

### Start the app

```
pm2 start server.js --name pm415
```

Now you should be able to browse the pm415 app at http://your-domain!









