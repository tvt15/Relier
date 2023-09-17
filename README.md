# Relier

A fast feature rich minimalistic Microsoft Teams clone.

Postman collection for REST API : [Postman collection]

OpenVidu (a wrapper over the Kurento media server) is used for the video calling functionality.

You can directly use the hosted one to test or deploy your own server.
# Setup instructions

Use Latest nodejs (14+).

Install mysql and edit your mysql credentials in [ormconfig.json]

```bash
cd relier
git pull --recurse-submodules
npm install
```
```bash
cd src/relier-front
npm install
npm run build
```
```bash
cd src/relier
npm install typescript -g
npm start
```
