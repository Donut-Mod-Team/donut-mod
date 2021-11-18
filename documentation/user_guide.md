## Getting Started with the Donut-Mod

## Dependencies

To begin using this mod, there are a couple of things you will need to install first, as discussed in [this article written by TIBCO Software](https://tibcosoftware.github.io/spotfire-mods/docs/getting-started/).

1. Spotfire:

Either the desktop client, [Tibco Spotfire® Analyst](https://www.tibco.com/products/tibco-spotfire), or   the web client, TIBCO Spotfire® Business Author.

2. Node.js:

To run the mod and install the necessary dependencies, [Node.js](https://nodejs.org/en/download/) is needed. Without Node.js, connecting to the API and displaying the mod in Spotfire will not work.

## Installation

<!--Describe the prerequisites and how to use the add-on mode, as well as data compatibility.-->

### Option 1: Download and import the .mod file of a released version
You first need to download the latest released mod file from our GitHub repository [releases page](https://github.com/Donut-Mod-Team/donut-mod/releases) found on the GitHub front page by pressing the releases button on the under the releases tag, and, once on the release page, selecting the `Donut.Chart.v*.mod` file of the download options under assets tag. At this stage, you want to open Spotfire and connect the mod. Simply select some data, and switch from "Viewing" to "Editing" by using the drop-down option on the top-right. Afterwards you can simply drag and drop the mod file into the Spotfire canvas.

### Option 2: Download a released instance of the project's repository
You first download the latest released repository from our GitHub repository [releases page](https://github.com/Donut-Mod-Team/donut-mod/releases) found on the GitHub front page by pressing the releases button on the right under the releases tag, and, once on the release page, selecting one of the download options for source code.
Once you have the repository downloaded and extracted, you navigate inside the folder using the command line.

### Option 3: Get the latest version of the project's repository 
You first need to clone or download the repository from the project's GitHub repository homepage, by pressing the `Code` button and selecting one of the cloning or download options.
Once you have the repository downloaded and extracted, you navigate inside the folder using the command line. Alternatively, you can clone it via:

```shell
git clone https://github.com/Donut-Mod-Team/donut-mod.git
```

## Run the mod locally

### Working with a development server

- Open a couple of terminal instances inside the directory of the preferred version you want to run
- In the first one, run `npm start`, which executes `npm install && npm run build-watch` in order to install all the tools and dependencies of this mod. In addition, it enables the tracking of any changes in the code, while continuously running until it is forced to stop.
- In the other terminal instance, run `npm run server` that initiates the development server.

### Working without a development server

#### Using the repository's version from installation steps 2 and/or 3:
- Run `npm install`, in order to install all the needed tools that this project depends on for its operation.
- Run `npm run build`, which creates the `dist` folder, containing all the minimized and optimized output files of the build process (`bundle.js` and `mod-manifest.json` along with the rest of the static files that shall be loaded)
- Open the desktop version of Spotfire, and by following the steps explained in the [official documentation](https://tibcosoftware.github.io/spotfire-mods/docs/getting-started) point to the `mod-manifest.json` that exists in the `dist` folder, which got created in the previous step.

#### Having the `Donut.Chart.v*.mod` downloaded:
- Enable `Editing` mode in Spotfire's top-right drop-down menu that was initially set to `Viewing`
- Since you have the `Donut.Chart.v*.mod` file downloaded and stored locally, you can simply drag and drop it to Spotfire's application window

Your mod should now be up and running, and all that is left is to connect it to Spotfire!

## Connect the mod to Spotfire

<!--Describe how to use the mode and integrate with the Spotfire.-->

At this stage, you want to open Spotfire and connect the mod. Simply select some data, switch from "Viewing" to "Editing" by using the drop-down option on the top-right, and click on the "Tools" section located on the taskbar.

Go to:
> Tools>Development>Create Visualization Mod...

and press the button that says "Connect to project".

Click "Development Server" and connect to the following:

> http://127.0.0.1:8090/

Congratulations! You should now be able to see the Donut Chart!

## How to use the mod:

### Functionality and Features

#### Marking:
- Select/Mark a data-set/slice by clicking (mouse left-click) on a subset of the donut.

- Select and add to a selection set by `left-clicking` (mouse) while holding the `CTRL` key.

- Select single or multiple sectors by drawing a rectangle using your mouse, by holding the mouse `left-click` button, and increasing/decreasing the selection's bounds accordingly.

- Adding to selection by holding the `CTRL` key, while working with rectangle selection.

- Unselect/Unmark by clicking on the background within the mod's canvas area.

#### Tooltip

- Tooltip showing while hovering over a data-set slice of the donut chart. 
- The data displayed in the tooltip is fully customizable from the Spotfire settings in the Desktop client
- The default data displayed in the web-client is the values of the selected axes 

#### Hover

- Black/White colour effect (depending on if it's a light or dark mode) on the edges of the donut-slice shown when hovering over the slice

#### Negative values

- Visualize chart data-slices containing negative values in the data set by adding a red outline to the corresponding data slice

#### Center text

- Dynamically visualize the sum of values as center text, depending on the data-set loaded in Spotfire.
- When selecting/marking sector(s) then this value is calculated based on the corresponding sectors' values.
- When no sector is selected, then by default the center text corresponds to the total sum of the sectors' values. In addition, by hovering upon different sectors then the center text changes by depicting their value, until the user hovers outside their area.
- Functionality has been implemented to alter the type of the center value, based on the options for the loaded data-set in Spotfire, by selecting a different one from corresponding axis found on the axes' sidebar.
- Formatting of center value text to match local machine(or browser for web-client) settings

#### Donut-mod's settings popout menu

The user can find in the top-right corner of the mod's canvas area a settings icon specific to this mode. From there, the following customization options can be applied to the visualization of the mod:

- Change labels' visualization options by:
  - showing text for all the sectors
  - showing text for only the selected/marked sectors
  - not showing any label-related text
- Select the type of information to be included as part of the labels' text among the following options:
  - sector percentage
  - sector value
  - sector category
- Change the labels' position between `inside donut` and `outside donut`
- Select a sorting option for the sectors' position in the Donut Chart:
  - enable ascending sorting
  - enable descending sorting
  - disable the sorting of the sectors
- Select the Donut Chart to be shown as full-circle or semi-circle/half-circle

#### Labels

- Labels displayed on each data slice showing the ratio/percentage of that slice(default, the data can be changed from the pop-out setting menu)
- The colours of the labels changes depending on if it's a light or dark mode
- Formatting of labels value text to match local machine(or browser for web-client) settings

## Testing

Currently, Donut-Mod's testing strategy consists of User Interface related automated tests, as well as unit tests of some classes' components.
Apart from the above, manual testing is being performed by the development team throughout every development stage, in order to ensure the quality of the delivered product.

### Automated UI tests

For this type of testing the `Cypress` testing framework is being used. In order to run these automated tests, first you need to make sure you have installed all the needed packages via:

```shell
npm install
```

Then, you have the option of running Cypress either in `headless` or in `headed` mode. Specifically, for headless try running in your console:

```shell
npm run cypress:run
```

> **_NOTE:_** The above command tries to run Cypress by using Chrome as the headless browser. Please edit the `package.json` file if you need to change it, or run the Cypress manually. For instance, you can use for firefox
`cypress run --browser firefox` instead.

In order to force the browser to be shown in order to have more specific control upon the process of the automated tests, by opening the Cypress Test Runner, please run in your console:

```shell
npm run cypress:open
```

### Unit testing

To run the Jest testing framework for the corresponding unit tests currently available, please execute the following command in your console (assuming you have already run `npm install`, if this is right after cloning the repository):

```shell
npm run test
```
