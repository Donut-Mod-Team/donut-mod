import * as d3 from "d3";
import * as utilityCalculator from "./utility";
import {resources} from "./resources";

/**
 * Method for selecting a dataset
 * @param {data} d: a single subset on the donut chart
 */
export function select(d) {
    event.ctrlKey ? d.data.mark("ToggleOrAdd") : d.data.mark();
}

/**
 * Method for clearing the selected dataView elements
 * @param {donutState} donutState
 */
export function unSelect(donutState) {
    return donutState.clearMarking();
}

/**
 * The function handles rectangle drag selection and marks all sub-datasets within the selection rectangle
 * The function also covers single click un-selecting edge case
 * Skeleton structure from https://github.com/TIBCOSoftware/spotfire-mods/blob/be96519cf67e301611468c9bd4c638f3fa0371a2/examples/ts-spiderchart-d3/src/render.ts#L655
 * Updated logic for selection from the spider chart
 * @param {donutState} donutState
 * @param {modProperty} modProperty
 */
export function drawRectangularSelection(donutState, modProperty) {
    /**
     * Function to draw rectangle given a set of parameters
     * @returns {rectangle}
     * */
    function drawRectangle(x, y, w, h) {
        return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
    }

    let canvas = d3.select("#mod-container svg");

    // Remove previously appended rectangles before creating a new one
    d3.select("svg")
        .selectAll("path")
        .filter(function () {
            return d3.select(this).attr("class") === "rectangle";
        })
        .remove();

    const rectangle = canvas.append("path").attr("class", "rectangle").attr("visibility", "hidden");

    // Start drawing the selection-rectangle
    const startSelection = function (start) {
        rectangle.attr("d", drawRectangle(start[0], start[1], 0, 0)).attr("visibility", "visible");
    };
    // Update the rectangle coordinates on each mouse move
    const moveSelection = function (start, moved) {
        rectangle.attr("d", drawRectangle(start[0], start[1], moved[0] - start[0], moved[1] - start[1]));
    };

    // Handles end of rectangle selection
    const endSelection = async function (start, end) {
        rectangle.attr("visibility", "hidden");

        // Ignore rectangular markings that were just a click.
        if (Math.abs(start[0] - end[0]) < 2 || Math.abs(start[1] - end[1]) < 2) {
            // Handle single clicks on the donut-chart
            if (d3.select(d3.event.target).node().nodeName === "path") {
                return;
            }
            // Default behaviour for single click is unmark all selection
            return unSelect(donutState);
        }
        /**
         * Get the bounding rectangle used for coordinates of the selection-rectangle
         * @typedef selectionRectangle
         */
        const selectionRectangle = rectangle.node().getBoundingClientRect();

        // Loop in each "path"-data-set and check if it's within the selection rectangle
        const svgRadarMarkedCircles = d3
            .select("#mod-container svg g")
            .selectAll("path")
            .filter(function (d) {
                let id = this.id.toString();
                // Check if the selected path is of a type of sector
                if (!id.includes("sectorID_")) {
                    return false;
                }
                /**
                 * Get the coordinates of the bounding rectangle around the path element
                 * @typedef boundingClientRect
                 */
                const boundingClientRect = this.getBoundingClientRect();
                let match = false;
                // Check if the selection and bounding rectangles overlap and check if the selection rectangle is within the donut-circle
                // (handles edge case rectangle outside circle giving false positive)
                if (
                    utilityCalculator.checkIfRectanglesOverlap(selectionRectangle, boundingClientRect) &&
                    utilityCalculator.rectangularCircleColliding(selectionRectangle, donutState.donutCircle)
                ) {
                    /**
                     * Get the overlapping rectangle-area coordinates ( given that both rectangles are static(not rotated) on the dom the overlap is a rectangle as well)
                     * @typedef overlappingRectangle
                     */
                    let overlappingRectangle = utilityCalculator.getOverlappingRectangle(
                        selectionRectangle,
                        boundingClientRect
                    );
                    // Check if the overlap-area is inside the middle of the donut.
                    // Handles error case where the rectangle selection overlaps only inside the middle of the donut but don't touch the data-set
                    match = !utilityCalculator.checkIfRectangularIsInCircle(
                        overlappingRectangle,
                        donutState.donutCircle,
                        donutState.donutCircle.innerRadius
                    );
                    // Error case check for matches outside of the data slice
                    if (match) {
                        // Check rectangle points are in the data slice
                        match = checkRectanglesPoints(overlappingRectangle, donutState.donutCircle, d, modProperty);
                    }
                }
                return match;
            });

        if (svgRadarMarkedCircles.size() === 0) {
            return;
        }
        // Mark each element within the selection-rectangle
        svgRadarMarkedCircles.each(select);
    };

    canvas.on("mousedown", function () {
        if (d3.event.which === 3 || d3.event.which === 2) {
            return;
        }
        let subject = d3.select(window),
            start = d3.mouse(this);
        startSelection(start);
        subject
            .on("mousemove.rectangle", function () {
                moveSelection(start, d3.mouse(canvas.node()));
            })
            .on("mouseup.rectangle", function () {
                endSelection(start, d3.mouse(canvas.node()));
                subject.on("mousemove.rectangle", null).on("mouseup.rectangle", null);
            });
    });
}

/**
 * Function is checking if any of the rectangle points are between the start - end angle of a given data slice
 * @param {overlappingRectangle} overlappingRectangle
 * @param {donutState.donutCircle} donutCircle
 * @param {d} dataSlice
 * @param {modProperty} modProperty
 * @returns boolean true if points are withing the slice angles and not in the middle
 */
function checkRectanglesPoints(overlappingRectangle, donutCircle, dataSlice, modProperty) {
    // The starting angle depends on the type of the donut; when semi-circle is selected it corresponds to 3π/2 radians, otherwise 0.
    const startAngle = modProperty.circleType.value() === resources.popoutCircleTypeSemiValue ? 3*Math.PI/2 : 0;

    // Define all the points that need to checked
    let overlappingRectanglePoints = [
        { x: overlappingRectangle.x, y: overlappingRectangle.y },
        { x: overlappingRectangle.x + overlappingRectangle.width, y: overlappingRectangle.y },
        { x: overlappingRectangle.x, y: overlappingRectangle.y + overlappingRectangle.height },
        {
            x: overlappingRectangle.x + overlappingRectangle.width,
            y: overlappingRectangle.y + overlappingRectangle.height
        }
    ];
    let startPoint = utilityCalculator.getPointFromCircle(donutCircle, startAngle, donutCircle.radius);
    // Default center point
    let centerPoint = { x: donutCircle.x, y: donutCircle.y };

    let validMatch = false;
    // Loop in each point
    for (let i = 0; i < overlappingRectanglePoints.length; i++) {
        // Get the angle of the point
        let angle = utilityCalculator.calculateAngle(centerPoint, overlappingRectanglePoints[i], startPoint);

        // Verify that the angle of the point is within the bounds of the slice
        if (
            (angle <= dataSlice.endAngle - startAngle  && angle >= dataSlice.startAngle - startAngle) ||
            checkIfRectangleIntersectsSides(dataSlice.startAngle, dataSlice.endAngle, donutCircle, overlappingRectangle)
        ) {
            // Exclude matches in the donut hole
            if (
                !utilityCalculator.checkIfPointIsInsideCircle(
                    overlappingRectanglePoints[i],
                    centerPoint,
                    donutCircle.innerRadius
                )
            ) {
                validMatch = true;
            }
        }
    }
    return validMatch;
}

/**
 * Function that checks if the rectangle intersects with the circle's sector
 * @param {angle} startAngle: measured in radians
 * @param {angle} endAngle: measured in radians
 * @param {donutCircle} donutCircle
 * @param {overlappingRectangle} rectangle
 * @returns {boolean} true when there exists at least one intersection, false otherwise
 *  */
function checkIfRectangleIntersectsSides(startAngle, endAngle, donutCircle, rectangle) {
    let startOuterPoint = utilityCalculator.getPointFromCircle(donutCircle, startAngle, donutCircle.radius);
    let startInnerPoint = utilityCalculator.getPointFromCircle(donutCircle, startAngle, donutCircle.innerRadius);

    let endOuterPoint = utilityCalculator.getPointFromCircle(donutCircle, endAngle, donutCircle.radius);
    let endInnerPoint = utilityCalculator.getPointFromCircle(donutCircle, endAngle, donutCircle.innerRadius);

    let startLine = { innerPoint: startInnerPoint, outerPoint: startOuterPoint };
    let endLine = { innerPoint: endInnerPoint, outerPoint: endOuterPoint };

    let rectangleSides = [
        // Top side of the rectangle
        { x1: rectangle.x, y1: rectangle.y, x2: rectangle.x + rectangle.width, y2: rectangle.y },
        // Bottom side of the rectangle
        {
            x1: rectangle.x,
            y1: rectangle.y + rectangle.height,
            x2: rectangle.x + rectangle.width,
            y2: rectangle.y + rectangle.height
        },
        // Right side of the rectangle
        {
            x1: rectangle.x + rectangle.width,
            y1: rectangle.y,
            x2: rectangle.x + rectangle.width,
            y2: rectangle.y + rectangle.height
        },
        // Left side of the rectangle
        { x1: rectangle.x, y1: rectangle.y, x2: rectangle.x, y2: rectangle.y + rectangle.height }
    ];

    let intersections = [];

    // Concatenation of the intersection array's results into one
    intersections = intersections.concat(
        utilityCalculator.checkIfRectangleSidesIntersectLine(startLine, rectangleSides)
    );
    intersections = intersections.concat(utilityCalculator.checkIfRectangleSidesIntersectLine(endLine, rectangleSides));

    // If the length of the intersections array is > 0, then it means we found at least one intersection between the lines and the rectangle
    return intersections.length > 0;
}
