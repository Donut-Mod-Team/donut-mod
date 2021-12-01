# Donut Chart mod for Tibco Spotfire 
The Donut Mod is an extension addon for the TIBCO Spotfire platform, which complements its environment by allowing the users to visualize their data using a donut chart representation. A donut chart is a variation of a pie chart with a hole in the middle, which contains a dynamically changing center text.  


## Try this mod in TIBCO Spotfire® Analyst
[Download this mod.](https://github.com/Donut-Mod-Team/donut-mod/releases) Click the Download button and follow the instructions below the button to open the mod in Spotfire Analyst.
 
### How to open the mod
1. Open Spotfire® Analyst, and create an analysis by loading some data.
2. Unzip the downloaded file, and locate the .mod file in the unzipped folder.
3. Drag the file into the analysis.
4. The visualization mod is added to the analysis.
5. To learn about the capabilities and limitations of this visualization mod, keep reading.
 
For general information on how to use and share visualization mods, [read the Spotfire documentation](https://docs.tibco.com/pub/sfire-analyst/latest/doc/html/en-US/TIB_sfire-analyst_UsersGuide/index.htm#t=modvis%2Fmodvis_how_to_use_a_visualization_mod.htm).
## Data requirement
**Every mod handles missing, corrupted and/or inconsistent data in different ways. It is advised to always review how the data is visualized.**

In order to make the mod work properly the data table needs to be formatted in a certain way. The type of values on the Y-axis (“Sector size by”) need to be continuous and labeled correctly, but as long as the correct formatting is followed, all data types supported by Spotfire® are supported in the donut chart. 
The type of values on the X-axis (“Color by”) need to be categorical. 
The center value supports only numerical values and the formatting supported for the center values is currency, scientific notation(6 digits), as well as both integer and real numbers.
Data needs to be loaded on both the Y and X axis. 
Percentages should be represented on a scale of 0-1. 

## Setting up the Donut chart

Let's say we have a grocery sales dataset that contains data about prices, costs and sales volume for different items:

| Date | AveragePrice | Total Volume | Total Bags | type | region |
|---|---|---|---|---|---|
| 2015-12-27 | 1.03 | 663 | 7 | conventional | Albany |
| 2015-12-30 | 2.33 | 6426 | 6 | organic | Albany |
| 2016-01-19 | 1.33 | -36 | -2 | conventional | Chicago |
| 2016-01-12 | 5.33 | 4513 | 10 | organic | Detroit |
| 2015-12-25 | 2.33 | -436 | -5 | conventional | Chicago |
| 2015-12-22 | 5.43 | 5123 | 9 | organic | Detroit |
| 2015-11-03 | 1.33 | 6423 | 10 | conventional | Alabama |
| 2016-08-17 | 1.73 | 4230 | 11 | conventional | Boston |
| 2015-05-07 | 1.33 | 236 | 4 | conventional | Albany |
| 2015-03-11 | 1.53 | 626 | 5 | organic | Chicago |

In the donut chart configuration in Spotfire, we would specify the “Region” column from the data table above as our X-axis, by selecting the “Region” in the “Color by” option. Then we can configure the Y-axis to illustrate the “Total Volume” column as the size of the sectors for the region, by selecting “Total Volume” in the “Sector size by” option. Furthermore we can configure the center of the donut to display the average price by selecting the “AveragePrice” in the “Center value” drop down.	



## Using the Donut chart

### Labels

Labels display the percentage of the sector rounded to 2 decimal places. In addition to that, the user can choose from the custom settings menu several visualization options. Such as: 
	Showing labels for only marked sections, all sectors and/or not showing labels at all.
	Switching the position of labels from inside to outside the sectors. 
	Select what type of data is shown for the sector’s labels. Options available are the ratio/percentage(default), the sector value and sector category(from the value in the “Color by”). The user can select all options, a combination of options or none. 

### Center text

The donut chart demonstrates a dynamic visualization of sectors’ values as its center text, depending on the current dataset loaded in Spotfire. This text by default corresponds to the total sum of the sectors’ values, while any intervention by the user such as either hovering over sectors or marking any of them, results in displaying the corresponding value. In addition, there is the option for the user to alter the type of the center value, based on the options for the loaded dataset in Spotfire, by selecting a different one from the corresponding axis found in the axes' sidebar.

### Sorting

The donut chart has the option allowing for sorting sectors by ascending and descending proportions by selecting the corresponding section in the settings panel. The default setting for the chart itself is that the sectors are sorted, but the user can choose to disable the sector sorting to present the sectors in an unsorted fashion.

### Marking

The donut chart allows for multiple ways of marking and visualizing the selected data by having the corresponding value be displayed in the center of the donut.
Marking data can be done by clicking (mouse left-click) on a sector of the donut.
In order to mark multiple sectors or add to marking set, the user must click (mouse left-click) a sector whilst holding the CTRL key, 
The donut chart also allows for rectangular marking; whilst holding down a mouse click (left-click) and dragging the cursor across the chart, the user may mark one or multiple sectors corresponding to the sectors that the rectangle overlaps with. 
To unmark all marked sectors, the user may click (mouse left-click) the background of the mods canvas area. 
To unmark specific sectors from a subset of marked sectors, the user may click (mouse-left click) a marked sector whilst holding the CTRL key to unmark the marked sector.

### Hovering

Theme highlight colour effect (depending on the theme mode) on the edges of the donut-slice shown when hovering over the slice. When hovering over the center value is updated to display the highlighted sectors information(if no sector is marked) and a tooltip is displayed. 

### Tooltip

When hovering over the sectors a tooltip popup is shown. The tooltip is fully customizable from the main chart property settings(available in the desktop client only). The default values displayed are the ones selected in the axes.

### Semi-circle visualization

An additional functionality of switching between the whole-circle and the semi-circle visualization is found in the popout settings menu of the donut chart mod. 



## Help and support

Please note that this Mod for TIBCO Spotfire® is not supported through support.tibco.com. In the event of issues or to get help or to suggest enhancements, please post in the TIBCO Community Wiki here: https://community.tibco.com/wiki

## More information about TIBCO Spotfire® Mods
- [Spotfire® Mods on the TIBCO Community Exchange](https://community.tibco.com/exchange): A safe and trusted place to discover ready-to-use mods
- [Spotfire® Mods Developer Documentation](https://tibcosoftware.github.io/spotfire-mods/docs/):  Introduction and tutorials for mods developers
- [Spotfire® Mods by TIBCO Spotfire®](https://github.com/TIBCOSoftware/spotfire-mods/releases/latest): A public repository for example projects
