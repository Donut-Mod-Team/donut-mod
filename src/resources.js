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

    // Overlay error categories
    errorOverlayCategoryDataView: "DataView",
    errorOverlayCategoryGeneral: "General",

    // Axis-related
    yAxisName: "Sector size by",
    colorAxisName: "Color",
    centerAxisName: "Center value by"
};
