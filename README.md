# ACARS-Recorder
If you use [acarsdec](https://github.com/TLeconte/acarsdec) to decode ACARS messages and want a modern platform where you can store and view all the messages you received, this is what may light you up.

# System Structure

<image src="https://github.com/ErnestThePoet/ACARS-Recorder/blob/main/structure.png"/>

# Start Guide
I will assume you have no background knowledge in the field of Web developing and expand every detail for setting things up.

## Hardware Preparations
Of course you need to have one or more SDRs that [acarsdec](https://github.com/TLeconte/acarsdec) supports to receive ACARS signals. Then, the system needs a Linux server to run. Although you can use your own PC as a server, I would recommend purchasing a low-end, inexpensive mini Linux server for this dedicated job.

## Dependency Installation
On your Linux server, install the following dependencies:
- [acarsdec](https://github.com/TLeconte/acarsdec)
- Latest LTS version of [Node.js](https://nodejs.org/en/download/package-manager)
- [Yarn 1 (Classic)](https://classic.yarnpkg.com/en/docs/install)
- git
- nginx

Node that for acarsdec, it's recommended to compile with libacars installed. ACARS-Recorder has support for showing libacars decoded contents.

## Project Setup
### Cloning the Project
It's recommended to put the project into a subdirectory of `/srv/www` which nginx have access to.
```
cd /srv/www
```
```
git clone https://github.com/ErnestThePoet/ACARS-Recorder.git
```
```
cd ACARS-Recorder
```
### Time Zone Customization
Edit `packages/server/src/common/constants.ts`, set `LOCAL_TIMEZONE_OFFSET` and `LOCAL_TIMEZONE_NAME` to your local time zone offset and name. Do the same for `packages/ui/src/modules/constants.ts`.

### Dependency Installation and Building
```
cd packages/server
```
```
yarn && yarn build
```
```
cd ../ui
```
```
yarn && yarn build
```
```
cd ..
```

## Starting Server
We will use Linux `screen` utility to manage server sessions.  
First we start server of ACARS-Server:
```
screen -S acars.server
```
```
cd server && yarn start:prod
```
Now server is listening to port `16009` for acarsdec UDP messages and port `16010` for API requests from browser.  
Then press `Crtl+A` and `D` to detach from screen session.

Next we start UI SSR server of ACARS-Server:
```
screen -S acars.ui
```
```
cd ui && PORT=16011 yarn start
```
```
Ctrl+A D
```
So we get the SSR server running on port `16011`.

Finally we shall start instances of acarsdec to decode ACARS and feed data into our server. Our server accepts JSON version of acarsdec's output, so we use `-j` for acarsdec.  
Example command using an RTL-SDR(also in a newly started `screen` session):
```
acarsdec -j 127.0.0.1:16009 -r A01 131.45
```
Bear in mind that ACARS frequencies vary in different countries. Make sure to tune to correct frequencies in your area.

## Configuring nginx
One last step to enjoy our efforts. Edit `/etc/nginx/nginx.conf`, add the following block in `http` block:
```
server {
    listen 16000;

    set $root /srv/www/ACARS-Recorder/packages/ui;
    root $root;

    access_log /srv/www/ACARS-Recorder/access.log;
    error_log /srv/www/ACARS-Recorder/error.log;

    location / {
            proxy_pass http://127.0.0.1:16011;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
            proxy_pass http://127.0.0.1:16010;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
    }

    location /_next/ {
            alias $root/.next/;
    }

    location ~ \.(gif|jpg|png|svg)$ {
            root $root/public;
    }
}
```
Save the file. Test the config file with `nginx -t`, make sure no errors are visible. Finally restart nginx with `nginx -s reload`(Error will occur if nginx is not started, in which case just start nginx with `nginx`).

## Enjoy
In any device that can connect to your Linux server, open `<Your server's IP>:16000` to get wild with joy. If connection is refused, check your Linux server's firewall settings.
