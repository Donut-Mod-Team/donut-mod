#!/bin/bash

sudo mkdir dist
sudo chown -R runner:docker dist
npm run cypress:ci