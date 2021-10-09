## Getting Started with the Donut-Mod

## Dependencies

To begin using this mod, there are a couple things you will need to install first, as discussed in [this article written by TIBCO Software](https://tibcosoftware.github.io/spotfire-mods/docs/getting-started/).

1. Spotfire:

Either the desktop client, [Tibco Spotfire® Analyst](https://www.tibco.com/products/tibco-spotfire), or   the web client, TIBCO Spotfire® Business Author.

2. Node.js:

To run the mod and install the necessary dependencies, [Node.js](https://nodejs.org/en/download/) is needed. Without Node.js, connecting to the API and displaying the mod in Spotfire will not work.

## Installation

<!--Describe the prerequisites and how to use the add-on mode, as well as data compatibility.-->

To install this mod, you first need to download the repository from the repository on the front page by pressing the Code button and selecting one of the options.
Once you have the repository downloaded and extracted, you navigate inside the folder using the command line, and run:

>npm start

Followed by:
>npm run server

Your mod should now be up and running, and all that is left is to connect it to Spotfire!

## Connect the mod to Spotfire

<!--Describe how to use the mode and integrate with the Spotfire.-->

At this stage, you want to open Spotfire and connect the mod. Simply select some data, and click on the "Tools" section located on the taskbar.

Go to:
> Tools>Development>Create Visualization Mod...

and press the button that says "Connect to project".

Click "Development Server" and connect to the following:

>http://127.0.0.1:8090/

Congratulations! You should now be able to see the Donut Chart!

## How to use the mod:

### Functionality

#### Marking:
- Select by clicking(mouse left) on a sub-set of the donut.

- Select and add to selection set by holding left-clicking and holding CTRL.

- Select single/multiple sub-sets by clicking and holding the left mouse button and dragging(rectangle selection) - selects everything within the rectangle.

- Adding to selection with CTRL working with rectangle selection.

- Unselect by clicking on the background(within the mod canvas.

#### Negative values
- Visualize chart data-slices containing negative values in the data set by adding a red outline to the corresponding data slice


