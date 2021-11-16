import * as d3 from "d3";
import { resources } from "./resources";

/**
 *
 * @param {Popout} popout
 * @param {Tooltip} tooltip
 * @param {modProperty} modProperty
 */
export function initializeSettingsPopout(popout, tooltip, modProperty) {
    // Import mod-popout building blocks
    const { radioButton, checkbox } = popout.components;
    const { section } = popout;

    // Select the dom-container
    const modContainer = d3.select("#mod-container");

    // Select the settings icon svg and set the default opacity
    const settingsIcon = modContainer.select("#settings-icon");

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
                    name === modProperty.circleType.name && modProperty.circleType.set(value);
                }
            },
            // Pass the popout sectors
            settingsPopout
        );
    };

    const settingsPopout = () => [
        // Define sector controlling when to show labels
        section({
            heading: resources.popoutLabelsHeading,
            children: [
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: resources.popoutLabelsVisibleAllText,
                    value: resources.popoutLabelsVisibleAllValue,
                    checked: modProperty.labelsVisible.value() === resources.popoutLabelsVisibleAllValue
                }),
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: resources.popoutLabelsVisibleMarkedText,
                    value: resources.popoutLabelsVisibleMarkedValue,
                    checked: modProperty.labelsVisible.value() === resources.popoutLabelsVisibleMarkedValue
                }),
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: resources.popoutLabelsVisibleNoneText,
                    value: resources.popoutLabelsVisibleNoneValue,
                    checked: modProperty.labelsVisible.value() === resources.popoutLabelsVisibleNoneValue
                })
            ]
        }),
        // Define popout sector for the type of data to be displayed for the labels
        section({
            heading: resources.popoutDisplayedLabelsDataHeading,
            children: [
                checkbox({
                    name: modProperty.labelsPercentage.name,
                    text: resources.popoutDisplayedLabelsDataPercentageText,
                    enabled: true,
                    tooltip: resources.popoutDisplayedLabelsDataPercentageTooltip,
                    checked: modProperty.labelsPercentage.value() === true
                }),
                checkbox({
                    name: modProperty.labelsValue.name,
                    text: resources.popoutDisplayedLabelsDataValueText,
                    enabled: true,
                    tooltip: resources.popoutDisplayedLabelsDataValueTooltip,
                    checked: modProperty.labelsValue.value() === true
                }),
                checkbox({
                    name: modProperty.labelsCategory.name,
                    text: resources.popoutDisplayedLabelsDataCategoryText,
                    enabled: true,
                    tooltip: resources.popoutDisplayedLabelsDataCategoryTooltip,
                    checked: modProperty.labelsCategory.value() === true
                })
            ]
        }),
        // Define options for labels position
        section({
            heading: resources.popoutLabelsPositionHeading,
            children: [
                radioButton({
                    name: modProperty.labelsPosition.name,
                    text: resources.popoutLabelsPositionInsideText,
                    value: resources.popoutLabelsPositionInsideValue,
                    checked: modProperty.labelsPosition.value() === resources.popoutLabelsPositionInsideValue
                }),
                radioButton({
                    name: modProperty.labelsPosition.name,
                    text: resources.popoutLabelsPositionOutsideText,
                    value: resources.popoutLabelsPositionOutsideValue,
                    checked: modProperty.labelsPosition.value() === resources.popoutLabelsPositionOutsideValue
                })
            ]
        }),
        // Define sorting options for the sectors' visualization
        section({
            heading: resources.popoutSortedPlacementHeading,
            children: [
                checkbox({
                    name: modProperty.sortedPlacement.name,
                    text: resources.popoutSortedPlacementCheckboxText,
                    enabled: true,
                    tooltip: resources.popoutSortedPlacementCheckboxTooltip,
                    checked: modProperty.sortedPlacement.value() === true
                }),
                radioButton({
                    name: modProperty.sortedPlacementOrder.name,
                    text: resources.popoutSortedPlacementOrderAscendingText,
                    value: resources.popoutSortedPlacementOrderAscendingValue,
                    enabled: modProperty.sortedPlacement.value() === true,
                    checked:
                        modProperty.sortedPlacementOrder.value() === resources.popoutSortedPlacementOrderAscendingValue
                }),
                radioButton({
                    name: modProperty.sortedPlacementOrder.name,
                    text: resources.popoutSortedPlacementOrderDescendingText,
                    value: resources.popoutSortedPlacementOrderDescendingValue,
                    enabled: modProperty.sortedPlacement.value() === true,
                    checked:
                        modProperty.sortedPlacementOrder.value() === resources.popoutSortedPlacementOrderDescendingValue
                })
            ]
        }),
        section({
            heading: resources.popoutCircleTypeHeading,
            children: [
                radioButton({
                    name: modProperty.circleType.name,
                    text: resources.popoutCircleTypeWholeText,
                    value: resources.popoutCircleTypeWholeValue,
                    checked: modProperty.circleType.value() === resources.popoutCircleTypeWholeValue
                }),
                radioButton({
                    name: modProperty.circleType.name,
                    text: resources.popoutCircleTypeSemiText,
                    value: resources.popoutCircleTypeSemiValue,
                    checked: modProperty.circleType.value() === resources.popoutCircleTypeSemiValue
                })
            ]
        })
    ];
    settingsIcon.transition("add labels").duration(resources.animationDuration).style("opacity", "1");

    settingsIcon.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();

    // Control the visibility of the popout based on the user's mouse
    modContainer
        .on("mouseover", function () {
            settingsIcon.style("opacity", "1").style("visibility", "visible");
        })
        .on("mouseleave", function () {
            settingsIcon.style("opacity", "0").style("visibility", "hidden");
        });
}
