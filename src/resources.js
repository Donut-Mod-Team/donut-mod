export const resources = {
    // Error messages
    errorNoDataOnAxis: (axis) => "No data on " + axis + " axis.",
    errorGeneralOverlay:
        "There was an issue with the mod's data; please try reloading. If it persists please check the mod's requirements.",
    errorNullDonutState: (donutState) => "donutState object is " + donutState,
    errorRendering:
        "There was an issue related to the rendering of the mod; please try reloading and check the console for more details.",
    errorCanvasContainerDimensions:
        "The dimensions of the canvas' container are too small. Please try increasing the canvas' size.",
    errorEmptyDataOnYAxis:
        "The selected data loaded on the Y-axis does not contain any data. Please select non-empty data and reload the mod.",

    // Overlay error categories
    errorOverlayCategoryDataView: "DataView",
    errorOverlayCategoryGeneral: "General",

    // Axis-related
    yAxisName: "Sector size by",
    colorAxisName: "Color",
    centerAxisName: "Center value",

    // Popout settings menu: components' values
    popoutLabelsVisibleAllValue: "all",
    popoutLabelsVisibleMarkedValue: "marked",
    popoutLabelsVisibleNoneValue: "none",
    popoutLabelsPositionInsideValue: "inside",
    popoutLabelsPositionOutsideValue: "outside",
    popoutSortedPlacementOrderAscendingValue: "ascending",
    popoutSortedPlacementOrderDescendingValue: "descending",
    popoutCircleTypeWholeValue: "whole-circle",
    popoutCircleTypeSemiValue: "semi-circle",

    // Popout settings menu: components' text titles
    popoutLabelsHeading: "Show labels for",
    popoutLabelsVisibleAllText: "All",
    popoutLabelsVisibleMarkedText: "Marked rows",
    popoutLabelsVisibleNoneText: "None",
    popoutDisplayedLabelsDataHeading: "Show in labels",
    popoutDisplayedLabelsDataPercentageText: "Sector percentage",
    popoutDisplayedLabelsDataValueText: "Sector value",
    popoutDisplayedLabelsDataCategoryText: "Sector category",
    popoutLabelsPositionHeading: "Labels position",
    popoutLabelsPositionInsideText: "Inside donut",
    popoutLabelsPositionOutsideText: "Outside donut",
    popoutSortedPlacementHeading: "Sorting",
    popoutSortedPlacementCheckboxText: "Sort sectors by size",
    popoutSortedPlacementOrderAscendingText: "Sort sectors ascending",
    popoutSortedPlacementOrderDescendingText: "Sort sectors descending",
    popoutCircleTypeHeading: "Circle type",
    popoutCircleTypeWholeText: "Visualize whole circle",
    popoutCircleTypeSemiText: "Visualize semi-circle",

    // Popout settings menu: components' tooltip text
    popoutDisplayedLabelsDataPercentageTooltip: "Shows sector percentage",
    popoutDisplayedLabelsDataValueTooltip: "Shows sector value",
    popoutDisplayedLabelsDataCategoryTooltip: "Shows sector category",
    popoutSortedPlacementCheckboxTooltip: "Enable/disable sectors sorting",

    // D3 animation duration used for svg shapes
    animationDuration: 250,
    // Value used as a modifier within the width, height and radius calculations
    sizeModifier: 10,
    // Value used as a modifier that specifies the the reduction factor for the donut,
    // when labels are visualized outside of the sectors
    labelsTextOutsideSizeModifier: 40,
    // Delay used for the DOM to properly load (in ms)
    timeoutDelay: 10,
    // Offsets related to the labels' positions
    labelsPositionOffsetInsideDonut: 0.75,
    labelsPositionOffsetOutsideDonut: 1.03,
    // Starting and ending angles, in degrees, for semi and whole circle visualizations
    semiCircleStartAngle: 270 * (Math.PI / 180),
    wholeCircleStartAngle: 0,
    semiCircleEndAngle: 450 * (Math.PI / 180),
    wholeCircleEndAngle: 360 * (Math.PI / 180),
    // Threshold used for not showing sectors' labels based on their percentage value
    sectorHidingPercentageThreshold: 5,
    // Hover highlight offsets
    arcsRadiusInnerOffset: 3,
    arcsRadiusOuterOffset: 4.5,
    // Hover highlight sector-sides id prefix/sides identifier
    leftSectorSideIdentifier: "left",
    rightSectorSideIdentifier: "right",
    // The default offset used which affects the positioning of the center text in the Y-axis on semi-circle mode
    semiCircleCenterTextIncreasedHeightPositioning: 1.9,
    // Offset used which affects the positioning of the center text in the Y-axis on semi-circle mode, when width is low
    semiCircleCenterTextDecreasedHeightPositioning: 2,
    // Threshold for specifying the width value of the canvas, after which the center text shall not follow
    // the default Y-axis positioning offset
    semiCircleCenterTextPositioningThreshold: 260,
    // Symbol used for scientific notation
    scientificSymbol: "E+"
};
