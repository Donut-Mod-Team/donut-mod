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

>git clone https://github.com/Donut-Mod-Team/donut-mod.git

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

>http://127.0.0.1:8090/

Congratulations! You should now be able to see the Donut Chart!

## How to use the mod:

### Functionality and Features

#### Marking:
- Select/Mark a data-set/slice by clicking(mouse left) on a sub-set of the donut.

- Select and add to a selection set by left-clicking(mouse) while holding CTRL.

- Select single/multiple sub-sets by clicking and holding the left mouse button and dragging(rectangle selection) - selects everything the rectangle overlaps.

- Adding to selection with holding CTRL while working with rectangle selection.

- Unselect/Unmark by clicking on the background(within the mod canvas.

#### Tooltip

- Tooltip showing while hovering over a data-set slice of the donut chart. 
- Tooltip shows the Ratio, Name of the data showing on the Y axis with total rows count, Name of the color axis and the leaf formatted value

#### Hover

- Black/White colour effect (depending on if it's a light or dark mode) on the edges of the donut-slice shown when hovering over the slice

#### Labels

- Labels displayed on each data slice showing the ratio/percentage of that slice
- The colours of the labels changes depending on if it's a light or dark mode
