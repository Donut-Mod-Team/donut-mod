# Donut-Mod Architecture

This document gives a high level overview of the structural and behavioral architectural design of the Donut-Mod

## Architectural drivers

The main architectural driver that is being considered during development is usability. The team wants to make sure that the end-user does not have any major issues while operating the mode. Therefore the team is looking into other Spotfire and their behavior and functionality( in particular the Pie-chart) in order to make sure that the end-user does not get confuse but also that the Donut-Chart provides the functionality, behavior and look the end-user is used to expect from a Spotfire chart.
## Diagrams

Overview of the system.

### Use Case Diagram

The diagram below showcases the main use cases that are to be implemented in the Donut-Mod.

![Use Case Diagram](./diagrams/Use_Case_Diagram_v1.png "Use Case Diagram")

### System Architecture

The diagram below showcases the basic components of the system on a high level. The diagram excludes that html, css and manifest files used for the mod to run in the Spotfire sandboxes environment. The mod uses Tibco Spotfire API( from main.js).

![High Level Architectural Diagram](./diagrams/system_architecture_v2.png "System Architecture Diagram")
