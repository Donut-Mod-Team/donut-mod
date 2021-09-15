# Continuous Integration / Continuous Deployment

## Continuous Integration pipeline

The integration of a CI pipeline to the development workflow of the `Donut-Mod` has the purpose of automating the build and testing processes, every time a code is pushed to the branches. Therefore, it aims to increase the confidence of the team that newly introduced code is automatically checked, of course, depending on the corresponding configuration of the pipeline and the tests that exist.

Based on the current development stage, the pipeline currently only checks if the installation process of the needed Node.js related packages is succeeding. However, in the future its configuration shall be extended, as more functionality is expected to be added, by the implementation of new features.

## Continuous Deployment

Currently, there has been no need to create a CD pipeline yet. However, depending on possible requirements' updates, a pipeline that automates the deployment process *may* be introduced.