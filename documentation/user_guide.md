## Getting Started with the Donut-Mod

## Dependencies

To begin using this mod, there are a couple things you will need to install first, as discussed in [this article written by TIBCO Software](https://tibcosoftware.github.io/spotfire-mods/docs/getting-started/).

1. Spotfire:

Either the desktop client, [Tibco Spotfire® Analyst](https://www.tibco.com/products/tibco-spotfire), or   the web client, TIBCO Spotfire® Business Author.

2. Node.js:

To run the mod and install the necessary dependencies, [Node.js](https://nodejs.org/en/download/) is needed. Without Node.js, connecting to the API and displaying the mod in Spotfire will not work.

## Installation

<!--Describe the prerequisites and how to use the add-on mode, as well as data compatibility.-->

To install this mod:

Option 1 latest release mod file: You first need to download the latest released mod file from our GitHub repository [releases page](https://github.com/Donut-Mod-Team/donut-mod/releases) found on the GitHub front page by pressing the releases button on the under the releases tag, and, once on the release page, selecting the .mod file of the download options under assets tag. At this stage, you want to open Spotfire and connect the mod. Simply select some data, and switch from "Viewing" to "Editing" by using the drop-down option on the top-right. Afterwards you can simply drag and drop the mod file into the Spotfire canvas.

Option 2 latest release: You first need to download the latest released repository from our GitHub repository [releases page](https://github.com/Donut-Mod-Team/donut-mod/releases) found on the GitHub front page by pressing the releases button on the right under the releases tag, and, once on the release page, selecting one of the download options for source code.
Once you have the repository downloaded and extracted, you navigate inside the folder using the command line.

Option 3 latest development: You first need to download the repository from the GitHub repository homepage where on the front page by pressing the Code button and selecting one of the download options.
Once you have the repository downloaded and extracted, you navigate inside the folder using the command line.

For option 2 and 3 follow the steps bellow.

Run:

>npm start

Followed by:
>npm run server

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

- Black colour effect on the edges of the donut-slice shown when hovering over the slice

#### Labels

- Labels displayed on each data slice showing the ratio/percentage of that slice
- The colours of the labels changes depending if it's a light or dark mode
