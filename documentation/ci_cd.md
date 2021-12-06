# Continuous Integration / Continuous Deployment

## Continuous Integration pipeline

The integration of a CI pipeline to the development workflow of the `Donut-Mod` has the purpose of automating the build and testing processes every time code is pushed to the branches. Through doing this, it aims to increase the confidence of the team that newly introduced the code by automatically checking it. This of course depends on the corresponding configuration of the pipeline and the tests that exist.

Based on the current development stage, the Continuous Integration pipeline is built upon [Github Actions](https://github.com/Donut-Mod-Team/donut-mod/actions), and consists of one workflow, namely [Node.js CI](https://github.com/Donut-Mod-Team/donut-mod/actions/workflows/node.js.yml). This pipeline is responsible for initiating any available unit tests for the corresponding classes' components, using the `Jest` testing framework. Its current status is illustrated by the following badge:

![Node.js CI status](https://github.com/Donut-Mod-Team/donut-mod/actions/workflows/node.js.yml/badge.svg)

## Continuous Deployment

There has been no need to create a CD pipeline yet. However, depending on possible requirements' updates, a pipeline that automates the deployment process *may* be introduced.
