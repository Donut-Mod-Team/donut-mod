#!/bin/bash

pwd
whoami
sudo mkdir dist
sudo chown -R runner:docker dist
ls -lha
npm start & npm run server &