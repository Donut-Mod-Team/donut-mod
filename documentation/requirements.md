# Requirements/Feature specification

This document gives a descriptive overview for the requirements used for the development of the Donut-Mod. The requirements capturing both functional and non-functional behavior will be documented using Epics (corresponding to the main use cases that can be seen in the [Use Case diagram](/documentation/diagrams/Use_Case_Diagram_v1.png)). Each Epic will be then broken down to more concrete user-stories that define a more specific behavior that is subset of the Epic. Furthermore, lower level technical requirements, such as CI/CD will be handled by breaking down the user stories to smaller tasks (this document shows only the Epics and user stories). Requirements traceability will be handled using Jira and jira-ids.


## Epics [last update: 2021/09/10]
* [DMT-16](https://donut-mod-team.atlassian.net/browse/DMT-16) UX Prototyping
* [DMT-18](https://donut-mod-team.atlassian.net/browse/DMT-18) Project Setup and Documentation
* [DMT-12](https://donut-mod-team.atlassian.net/browse/DMT-12) Customize Visualization
* [DMT-9](https://donut-mod-team.atlassian.net/browse/DMT-9) Select Data
* [DMT-7](https://donut-mod-team.atlassian.net/browse/DMT-7) Visualize Data


## User Stories [last update: 2021/11/08]
* [DMT-57](https://donut-mod-team.atlassian.net/browse/DMT-57) As a data analyst, I want to be able to customize the visualization of the labels, so that I am able to quickly reference different values of the data.
* [DMT-56](https://donut-mod-team.atlassian.net/browse/DMT-56) As a data analyst, I want the tooltip of a hovered over sector to be customizable, so that I can show data that is important to my analysis.
* [DMT-55](https://donut-mod-team.atlassian.net/browse/DMT-55) As a data analyst, I want a setting panel from which I can customize features of the chart, so that I can visualize the data in a manner that suits my preference.
* [DMT-54](https://donut-mod-team.atlassian.net/browse/DMT-54) As a data analyst, I want to be able to see the data in a semi-donut format so that I have a better overview of certain data-type.
* [DMT-53](https://donut-mod-team.atlassian.net/browse/DMT-53) As a data analyst, I want to be able to choose where the label’s text is displayed(switch between inside the donut-slice/or outside) so that I can see certain sectors better.
* [DMT-37](https://donut-mod-team.atlassian.net/browse/DMT-37) As a data analyst, I want negative value sectors to stand out, so that I have a visual cue on which data contains negative values.
* [DMT-36](https://donut-mod-team.atlassian.net/browse/DMT-36) As a data analyst, I want to be able to view and change the data in the middle of the donut-chart, so that I can adjust the summary to my current needs
* [DMT-30](https://donut-mod-team.atlassian.net/browse/DMT-30) As a data analyst, I want labels to be visualized on each sector with data specific to that sector, so that I have a quick overview of the data.
* [DMT-19](https://donut-mod-team.atlassian.net/browse/DMT-16) As a developer, I want to establish a CI/CD pipeline, so that I am confident that the changes I make do not harm the code base.
* [DMT-15](https://donut-mod-team.atlassian.net/browse/DMT-15) As a data analyst, I want to be able to see how the mod will look like, so that I can evaluate the state of the mod.
* [DMT-14](https://donut-mod-team.atlassian.net/browse/DMT-14) As a data analyst, I want to be able to change the fonts and font sizes on the Donut Chart, so that I can improve the readability.
* [DMT-13](https://donut-mod-team.atlassian.net/browse/DMT-13) As a data analyst, I want to be able to change the colours on the Donut Chart, so that I can utilize different colour schemes.
* [DMT-11](https://donut-mod-team.atlassian.net/browse/DMT-11) As a data analyst, I want to be able to de-select subsets of data on the Donut Chart, so that I can review the data as a whole.
* [DMT-10](https://donut-mod-team.atlassian.net/browse/DMT-10) As a data analyst, I want to be able to select multiple subsets of data on the Donut Chart, so that I can highlight multiple aspects of my data.
* [DMT-8](https://donut-mod-team.atlassian.net/browse/DMT-8) As a data analyst, I want to be able to select a single subset of data on the Donut Chart, so that I can highlight an aspect of my data.
* [DMT-6](https://donut-mod-team.atlassian.net/browse/DMT-6) As a data analyst, I want the mod to display data in a Donut Chart representation, so that I can visualize my data in the appropriate format.
* [DMT-5](https://donut-mod-team.atlassian.net/browse/DMT-5) As a data analyst, I want the mod to be able to connect to the Spotfire framework, so that I can visualize my data.

