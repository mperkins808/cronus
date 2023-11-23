<h1 align="center" style="border-bottom: none">
    <a  target="_blank"><img alt="Cronus" width="200px" style="    border-radius: 5px;
" src="./documentation/images/cronus-logo-color.svg"></a><br><br>Cronus
</h1>

## What is Cronus

**Cronus** is used to forward datasource metrics to the mobile companion app [LINK HERE]. It supports client side authentication and authentication to datasources. From Cronus configure the queries you would like your app to use. Once you have connected a mobile device, your queries will instantly appear and can update up to every 15 seconds.

#### Currently supported datasources

- [prometheus](https://github.com/prometheus/prometheus)

## Install

[Example](./example/docker/docker-compose.yaml) deploying with docker compose

[Example](./example/kubernetes/deployment.yaml) deploying to a cluster

## Demonstration

For demonstration purposes you can connect your mobile to the following instance. This instance has several queries already set up. You can scan this QR code or follow the steps below.

<h1 align="center" style="border-bottom: none">
<a  target="_blank"><img alt="Cronus" width="200px" style="    border-radius: 5px;
" src="./documentation/images/qr-code.svg"></a>
</h1>

1. Open the mobile app

2. Navigate to the `Connect` tab

3. Enter `https://example.cronusmonitoring.com` in the instance field and click `connect` button

4. You are now connected to the demonstration instance. Navigate to the queries tab to see the real time queries that you have access to.

## Configuration

Create a config file and place it in the `config/` folder when lauching Cronus.

Here is a sample configuration file `cronus.ini` that configures an instance that uses sqlite as a database. For any keys you can run [key.sh](./scripts/keys.sh) to generate them.

```
[ADMIN]

# The default password that runs on initialisation
DEFAULT_PASSWORD=admin

[DATABASE]

TYPE = sqlite
PATH = ./dev.db

# used to encrpyt values in the database
ENCRYPTION_KEY = Generate from script

[SESSION]

# used to generate session tokens for users and mobile devices
SIGNING_KEY = Generate from script

# how long sessions are active for
LENGTH = 7d

# If enabled. Mobile devices will have their session renew everytime they connect
MOBILE_AUTO_RENEW = true
```

You can also connect Cronus to a postgresql database by placing the following config in `[DATABASE]`

```
TYPE = postgresql
URL  = postgresql://cronus@localhost:5432/cronus?schema=public
HOST = 127.0.0.1
PORT = 3306
USER = cronus
PASSWORD = cronus
```

## Feature Roadmap

#### Multiple datasources

Think we're missing one? Raise an issue.

- Cloudwatch
- Google Cloud Monitoring

#### Alert Notifications

When this is launched you will recieve unlimited alert push notifications to your mobile devices

#### Alert forwarding

Forward alerts from popular alert managers like Grafana and Prometheus Alertmanager to your mobile devices

#### 3rd party authentication providers

We plan on adding core authentication providers like AzureAD to avoid the need to self manage the authentication layer.
