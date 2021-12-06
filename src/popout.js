import * as d3 from "d3";
import { resources } from "./resources";

/**
 * Function initializes the popout and sets/creates and updates the components for the settings popout given the property
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
        let property = {
            labelsVisible: modProperty.labelsVisible.value(),
            sortedPlacement: modProperty.sortedPlacement.value(),
            sortedPlacementOrder: modProperty.sortedPlacementOrder.value(),
            labelsPosition: modProperty.labelsPosition.value(),
            labelsPercentage: modProperty.labelsPercentage.value(),
            labelsValue: modProperty.labelsValue.value(),
            labelsCategory: modProperty.labelsCategory.value(),
            circleType: modProperty.circleType.value()
        };
        popout.show(
            {
                x: e.x,
                y: e.y,
                alignment: "Top",
                autoClose: false,
                // Track the change events and update the mod-property values
                onChange: (event) => {
                    const { name, value } = event;
                    switch (name) {
                        case modProperty.labelsPosition.name:
                            property.labelsPosition = value;
                            modProperty.labelsPosition.set(value);
                            break;
                        case modProperty.sortedPlacement.name:
                            property.sortedPlacement = value;
                            modProperty.sortedPlacement.set(value);
                            break;
                        case modProperty.sortedPlacementOrder.name:
                            property.sortedPlacementOrder = value;
                            modProperty.sortedPlacementOrder.set(value);
                            break;
                        case modProperty.labelsVisible.name:
                            property.labelsVisible = value;
                            modProperty.labelsVisible.set(value);
                            break;
                        case modProperty.labelsPercentage.name:
                            property.labelsPercentage = value;
                            modProperty.labelsPercentage.set(value);
                            break;
                        case modProperty.labelsValue.name:
                            property.labelsValue = value;
                            modProperty.labelsValue.set(value);
                            break;
                        case modProperty.labelsCategory.name:
                            property.labelsCategory = value;
                            modProperty.labelsCategory.set(value);
                            break;
                        case modProperty.circleType.name:
                            property.circleType = value;
                            modProperty.circleType.set(value);
                            break;
                    }
                }
            },
            // Pass the popout sectors
            () => createPopoutComponents(property)
        );
    };

    function createPopoutComponents(property) {
        return [
            // Define sector controlling when to show labels
            section({
                heading: resources.popoutLabelsHeading,
                children: [
                    radioButton({
                        name: modProperty.labelsVisible.name,
                        text: resources.popoutLabelsVisibleAllText,
                        value: resources.popoutLabelsVisibleAllValue,
                        checked: property.labelsVisible === resources.popoutLabelsVisibleAllValue
                    }),
                    radioButton({
                        name: modProperty.labelsVisible.name,
                        text: resources.popoutLabelsVisibleMarkedText,
                        value: resources.popoutLabelsVisibleMarkedValue,
                        checked: property.labelsVisible === resources.popoutLabelsVisibleMarkedValue
                    }),
                    radioButton({
                        name: modProperty.labelsVisible.name,
                        text: resources.popoutLabelsVisibleNoneText,
                        value: resources.popoutLabelsVisibleNoneValue,
                        checked: property.labelsVisible === resources.popoutLabelsVisibleNoneValue
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
                        checked: property.labelsPercentage === true
                    }),
                    checkbox({
                        name: modProperty.labelsValue.name,
                        text: resources.popoutDisplayedLabelsDataValueText,
                        enabled: true,
                        tooltip: resources.popoutDisplayedLabelsDataValueTooltip,
                        checked: property.labelsValue === true
                    }),
                    checkbox({
                        name: modProperty.labelsCategory.name,
                        text: resources.popoutDisplayedLabelsDataCategoryText,
                        enabled: true,
                        tooltip: resources.popoutDisplayedLabelsDataCategoryTooltip,
                        checked: property.labelsCategory === true
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
                        checked: property.labelsPosition === resources.popoutLabelsPositionInsideValue
                    }),
                    radioButton({
                        name: modProperty.labelsPosition.name,
                        text: resources.popoutLabelsPositionOutsideText,
                        value: resources.popoutLabelsPositionOutsideValue,
                        checked: property.labelsPosition === resources.popoutLabelsPositionOutsideValue
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
                        checked: property.sortedPlacement === true
                    }),
                    radioButton({
                        name: modProperty.sortedPlacementOrder.name,
                        text: resources.popoutSortedPlacementOrderAscendingText,
                        value: resources.popoutSortedPlacementOrderAscendingValue,
                        enabled: property.sortedPlacement === true,
                        checked: property.sortedPlacementOrder === resources.popoutSortedPlacementOrderAscendingValue
                    }),
                    radioButton({
                        name: modProperty.sortedPlacementOrder.name,
                        text: resources.popoutSortedPlacementOrderDescendingText,
                        value: resources.popoutSortedPlacementOrderDescendingValue,
                        enabled: property.sortedPlacement === true,
                        checked: property.sortedPlacementOrder === resources.popoutSortedPlacementOrderDescendingValue
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
                        checked: property.circleType === resources.popoutCircleTypeWholeValue
                    }),
                    radioButton({
                        name: modProperty.circleType.name,
                        text: resources.popoutCircleTypeSemiText,
                        value: resources.popoutCircleTypeSemiValue,
                        checked: property.circleType === resources.popoutCircleTypeSemiValue
                    })
                ]
            })
        ];
    }

    settingsIcon.transition("add labels").duration(resources.animationDuration).style("opacity", "1");

    // Control the visibility of the popout based on the user's mouse
    modContainer
        .on("mouseover", function () {
            settingsIcon.style("opacity", "1").style("visibility", "visible");
        })
        .on("mouseleave", function () {
            settingsIcon.style("opacity", "0").style("visibility", "hidden");
        });
}
