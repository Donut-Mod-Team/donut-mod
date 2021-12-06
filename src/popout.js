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

    // Extract the property values used to initialize the popout components
    /***
     *
     * @type {{labelsPosition: *, labelsValue: *, circleType: *, labelsCategory: *, sortedPlacement: *, labelsPercentage: *, sortedPlacementOrder: *, labelsVisible: *}}
     */
    let properties = {
        labelsVisible: modProperty.labelsVisible.value(),
        sortedPlacement: modProperty.sortedPlacement.value(),
        sortedPlacementOrder: modProperty.sortedPlacementOrder.value(),
        labelsPosition: modProperty.labelsPosition.value(),
        labelsPercentage: modProperty.labelsPercentage.value(),
        labelsValue: modProperty.labelsValue.value(),
        labelsCategory: modProperty.labelsCategory.value(),
        circleType: modProperty.circleType.value()
    };

    // Set the onclick behaviour for the icon
    settingsIcon.node().onclick = (e) => {
        tooltip.hide();

        popout.show(
            {
                x: e.x,
                y: e.y,
                alignment: "Top",
                autoClose: false,
                // Track the change events and update the mod-properties and component properties values
                onChange: (event) => {
                    const { name, value } = event;
                    switch (name) {
                        case modProperty.labelsPosition.name:
                            properties.labelsPosition = value;
                            modProperty.labelsPosition.set(value);
                            break;
                        case modProperty.sortedPlacement.name:
                            properties.sortedPlacement = value;
                            modProperty.sortedPlacement.set(value);
                            break;
                        case modProperty.sortedPlacementOrder.name:
                            properties.sortedPlacementOrder = value;
                            modProperty.sortedPlacementOrder.set(value);
                            break;
                        case modProperty.labelsVisible.name:
                            properties.labelsVisible = value;
                            modProperty.labelsVisible.set(value);
                            break;
                        case modProperty.labelsPercentage.name:
                            properties.labelsPercentage = value;
                            modProperty.labelsPercentage.set(value);
                            break;
                        case modProperty.labelsValue.name:
                            properties.labelsValue = value;
                            modProperty.labelsValue.set(value);
                            break;
                        case modProperty.labelsCategory.name:
                            properties.labelsCategory = value;
                            modProperty.labelsCategory.set(value);
                            break;
                        case modProperty.circleType.name:
                            properties.circleType = value;
                            modProperty.circleType.set(value);
                            break;
                    }
                }
            },
            // Pass the popout sectors the the mod by creating the components with the assigned properties
            () => createPopoutComponents(properties)
        );
    };

    /**
     * Function creates and sets the popout components sections by given properties values object and returns the array with sections
     * @param properties
     * @return {PopoutSection[]} popout section components
     */
    function createPopoutComponents(properties) {
        return [
            // Define sector controlling when to show labels
            section({
                heading: resources.popoutLabelsHeading,
                children: [
                    radioButton({
                        name: modProperty.labelsVisible.name,
                        text: resources.popoutLabelsVisibleAllText,
                        value: resources.popoutLabelsVisibleAllValue,
                        checked: properties.labelsVisible === resources.popoutLabelsVisibleAllValue
                    }),
                    radioButton({
                        name: modProperty.labelsVisible.name,
                        text: resources.popoutLabelsVisibleMarkedText,
                        value: resources.popoutLabelsVisibleMarkedValue,
                        checked: properties.labelsVisible === resources.popoutLabelsVisibleMarkedValue
                    }),
                    radioButton({
                        name: modProperty.labelsVisible.name,
                        text: resources.popoutLabelsVisibleNoneText,
                        value: resources.popoutLabelsVisibleNoneValue,
                        checked: properties.labelsVisible === resources.popoutLabelsVisibleNoneValue
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
                        checked: properties.labelsPercentage === true
                    }),
                    checkbox({
                        name: modProperty.labelsValue.name,
                        text: resources.popoutDisplayedLabelsDataValueText,
                        enabled: true,
                        tooltip: resources.popoutDisplayedLabelsDataValueTooltip,
                        checked: properties.labelsValue === true
                    }),
                    checkbox({
                        name: modProperty.labelsCategory.name,
                        text: resources.popoutDisplayedLabelsDataCategoryText,
                        enabled: true,
                        tooltip: resources.popoutDisplayedLabelsDataCategoryTooltip,
                        checked: properties.labelsCategory === true
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
                        checked: properties.labelsPosition === resources.popoutLabelsPositionInsideValue
                    }),
                    radioButton({
                        name: modProperty.labelsPosition.name,
                        text: resources.popoutLabelsPositionOutsideText,
                        value: resources.popoutLabelsPositionOutsideValue,
                        checked: properties.labelsPosition === resources.popoutLabelsPositionOutsideValue
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
                        checked: properties.sortedPlacement === true
                    }),
                    radioButton({
                        name: modProperty.sortedPlacementOrder.name,
                        text: resources.popoutSortedPlacementOrderAscendingText,
                        value: resources.popoutSortedPlacementOrderAscendingValue,
                        enabled: properties.sortedPlacement === true,
                        checked: properties.sortedPlacementOrder === resources.popoutSortedPlacementOrderAscendingValue
                    }),
                    radioButton({
                        name: modProperty.sortedPlacementOrder.name,
                        text: resources.popoutSortedPlacementOrderDescendingText,
                        value: resources.popoutSortedPlacementOrderDescendingValue,
                        enabled: properties.sortedPlacement === true,
                        checked: properties.sortedPlacementOrder === resources.popoutSortedPlacementOrderDescendingValue
                    })
                ]
            }),
            // Define options for chart visibility (semi-circle or circle)
            section({
                heading: resources.popoutCircleTypeHeading,
                children: [
                    radioButton({
                        name: modProperty.circleType.name,
                        text: resources.popoutCircleTypeWholeText,
                        value: resources.popoutCircleTypeWholeValue,
                        checked: properties.circleType === resources.popoutCircleTypeWholeValue
                    }),
                    radioButton({
                        name: modProperty.circleType.name,
                        text: resources.popoutCircleTypeSemiText,
                        value: resources.popoutCircleTypeSemiValue,
                        checked: properties.circleType === resources.popoutCircleTypeSemiValue
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
