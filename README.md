# Noversi 
[![](https://raw.githubusercontent.com/NOOXY-inc/Art-Collection/master/NoService/NoService.png)](https://github.com/noOXY-research/noservice)
An online reversi service powered by NOOXY NoService and Nodenet.

## Dependencies
A UNIX system.

### system
git, nodejs, npm, openssl

### node
ws, sqlite3

### python
numpy

## Deploy Method

1. Deploy NoService
```bash
npm install noservice -save
npx create-noservice .
```
note that "." can be replace by anywhere you'd like to deploy!

2. Copy these files into "services/noversi"  the folder you deploy noservice.
3. Add "noversi" into "settings.json"(in the folder you deploy noservice) "services" settings.

Then you are ready to play! By typing "node launch.js" under NoService deployed folder. And open the client in browser.

## Play
see client directory readme.md
