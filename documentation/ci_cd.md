# Continuous Integration / Continuous Deployment

## Continuous Integration pipeline

The integration of a CI pipeline to the development workflow of the `Donut-Mod` has the purpose of automating the build and testing processes every time code is pushed to the branches. Through doing this, it aims to increase the confidence of the team that newly introduced the code by automatically checking it. This of course depends on the corresponding configuration of the pipeline and the tests that exist.

Based on the current development stage, the Continuous Integration pipeline is built upon [Github Actions](https://github.com/Donut-Mod-Team/donut-mod/actions), and consists of two workflows.
The first one, namely `Cypress CI`, is responsible for triggering any User Interface related automated tests available, by using the Cypress framework.
The second workflow is called `Node.js CI`, which has the purpose of initiating any available unit tests for the corresponding classes' components, using the Jest testing framework.

Further details can be found in the following table:

CI pipeline | Status
--- | --- |
[Cypress CI](https://github.com/Donut-Mod-Team/donut-mod/actions/workflows/cypress.yml) | ![Cypress CI status](https://github.com/Donut-Mod-Team/donut-mod/actions/workflows/cypress.yml/badge.svg)
[Node.js CI](https://github.com/Donut-Mod-Team/donut-mod/actions/workflows/node.js.yml) | ![Node.js CI status](https://github.com/Donut-Mod-Team/donut-mod/actions/workflows/node.js.yml/badge.svg)

## Continuous Deployment

There has been no need to create a CD pipeline yet. However, depending on possible requirements' updates, a pipeline that automates the deployment process *may* be introduced.
