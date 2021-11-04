import * as d3 from "d3";

/**
 *
 * @param {Popout} popout
 * @param {Tooltip} tooltip
 * @param {number} animationDuration
 * @param {modProperty} modProperty
 */
export function initializeSettingsPopout(popout, tooltip, animationDuration, modProperty) {
    // Import mod-popout building blocks
    const { radioButton, checkbox } = popout.components;
    const { section } = popout;

    // Select the dom-container
    const modContainer = d3.select("#mod-container");

    // Select the settings icon svg and set the default opacity
    const settingsIcon = modContainer.select("#settings-icon").style("opacity", "0");

    // Set the onclick behaviour for the icon
    settingsIcon.node().onclick = (e) => {
        tooltip.hide();
        popout.show(
            {
                x: e.x,
                y: e.y,
                alignment: "Top",
                autoClose: true,
                // Track the change events and update the mod-property values
                onChange: (event) => {
                    const { name, value } = event;
                    name === modProperty.labelsPosition.name && modProperty.labelsPosition.set(value);
                    name === modProperty.sortedPlacement.name && modProperty.sortedPlacement.set(value);
                    name === modProperty.sortedPlacementOrder.name && modProperty.sortedPlacementOrder.set(value);
                    name === modProperty.labelsVisible.name && modProperty.labelsVisible.set(value);
                    name === modProperty.labelsPercentage.name && modProperty.labelsPercentage.set(value);
                    name === modProperty.labelsValue.name && modProperty.labelsValue.set(value);
                    name === modProperty.labelsCategory.name && modProperty.labelsCategory.set(value);
                }
            },
            // Pass the popout sectors
            settingsPopout
        );
    };

    const settingsPopout = () => [
        // Define sector controlling when to show labels
        section({
            heading: "Show labels for",
            children: [
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: "All",
                    value: "all",
                    checked: modProperty.labelsVisible.value() === "all"
                }),
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: "Marked rows",
                    value: "marked",
                    checked: modProperty.labelsVisible.value() === "marked"
                }),
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: "None",
                    value: "none",
                    checked: modProperty.labelsVisible.value() === "none"
                })
            ]
        }),
        // Define popout sector for the type of data to be displayed for the labels
        section({
            heading: "Show in labels",
            children: [
                checkbox({
                    name: modProperty.labelsPercentage.name,
                    text: "Sector percentage",
                    enabled: true,
                    tooltip: "Shows sector percentage",
                    checked: modProperty.labelsPercentage.value() === true
                }),
                checkbox({
                    name: modProperty.labelsValue.name,
                    text: "Sector value",
                    enabled: true,
                    tooltip: "Shows sector value",
                    checked: modProperty.labelsValue.value() === true
                }),
                checkbox({
                    name: modProperty.labelsCategory.name,
                    text: "Sector category",
                    enabled: true,
                    tooltip: "Shows sector category",
                    checked: modProperty.labelsCategory.value() === true
                })
            ]
        }),
        // Define options for labels position
        section({
            heading: "Labels position",
            children: [
                radioButton({
                    name: modProperty.labelsPosition.name,
                    text: "Inside chart",
                    value: "inside",
                    checked: modProperty.labelsPosition.value() === "inside"
                }),
                radioButton({
                    name: modProperty.labelsPosition.name,
                    text: "Outside chart",
                    value: "outside",
                    checked: modProperty.labelsPosition.value() === "outside"
                })
            ]
        }),
        // Define sorting options for the sectors' visualization
        section({
            heading: "Sorting",
            children: [
                checkbox({
                    name: modProperty.sortedPlacement.name,
                    text: "Sort sectors by size",
                    enabled: true,
                    tooltip: "Biggest sizes placed at the top-right",
                    checked: modProperty.sortedPlacement.value() === true
                }),
                radioButton({
                    name: modProperty.sortedPlacementOrder.name,
                    text: "Sort sectors ascending",
                    value: "ascending",
                    enabled: modProperty.sortedPlacement.value() === true,
                    checked: modProperty.sortedPlacementOrder.value() === "ascending"
                }),
                radioButton({
                    name: modProperty.sortedPlacementOrder.name,
                    text: "Sort sectors descending",
                    value: "descending",
                    enabled: modProperty.sortedPlacement.value() === true,
                    checked: modProperty.sortedPlacementOrder.value() === "descending"
                })
            ]
        })
    ];
    settingsIcon.transition("add labels").duration(animationDuration).style("opacity", "1");

    settingsIcon.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    // Control the visibility of the popout based on the user's mouse
    modContainer
        .on("mouseover", function () {
            settingsIcon.style("opacity", "1");
        })
        .on("mouseleave", function () {
            settingsIcon.style("opacity", "0");
        });
}
