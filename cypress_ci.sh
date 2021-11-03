#!/bin/bash

sudo mkdir dist
sudo chown -R runner:docker dist
ls -lha
npm start & npm run server &
cypress run