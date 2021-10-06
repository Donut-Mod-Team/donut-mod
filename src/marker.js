import * as d3 from "d3";

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
 */
export function drawRectangularSelection(donutState) {
    /**
     * Function to draw rectangle given a set of parameters
     * @returns {rectangle}
     * */
    function drawRectangle(x, y, w, h) {
        return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
    }

    let canvas = d3.select("#mod-container svg");
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
                /**
                 * Get the coordinates of the bounding rectangle around the path element
                 * @typedef boundingClientRect
                 */
                const boundingClientRect = this.getBoundingClientRect();
                let match = false;
                // Check if the selection and bounding rectangles overlap and check if the selection rectangle is within the donut-circle
                // (handles edge case rectangle outside circle giving false positive)
                if (
                    checkIfRectanglesOverlap(selectionRectangle, boundingClientRect) &&
                    rectangularCircleColliding(selectionRectangle, donutState.donutCircle)
                ) {
                    /**
                     * Get the overlapping rectangle-area coordinates ( given that both rectangles are static(not rotated) on the dom the overlap is a rectangle as well)
                     * @typedef overlappingRectangle
                     */
                    let overlappingRectangle = getOverlappingRectangle(selectionRectangle, boundingClientRect);
                    // Check if the overlap-area is inside the middle of the donut.
                    // Handles error case where the rectangle selection overlaps only inside the middle of the donut but don't touch the data-set
                    match = !checkIfRectangularIsInMiddle(overlappingRectangle, donutState.donutCircle);
                    // Error case check for matches outside of the data slice
                    if (match) {
                        // Check rectangle points are in the data slice
                        match = checkRectanglesPoints(overlappingRectangle, donutState.donutCircle, d);
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
 * @returns boolean true if points are withing the slice angles and not in the middle
 */
function checkRectanglesPoints(overlappingRectangle, donutCircle, dataSlice) {
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
    let startPoint = getPointFromCircle(donutCircle, 0, donutCircle.radius);
    // Default center point
    let centerPoint = { x: donutCircle.x, y: donutCircle.y };

    let validMatch = false;
    // Loop in each point
    for (let i = 0; i < overlappingRectanglePoints.length; i++) {
        // Get the angle of the point
        let angle = calculateAngle(centerPoint, overlappingRectanglePoints[i], startPoint);
        // Verify that the angle of the point is within the bounds of the slice
        if (angle <= dataSlice.endAngle && angle >= dataSlice.startAngle) {
            // Exclude matches in the donut hole
            if (!insideInnerCircle(overlappingRectanglePoints[i], centerPoint, donutCircle.innerRadius)) {
                validMatch = true;
            } else {
                // Check if the overlapping rectangle intersects with the current sides of the sector
                if (checkIfRectangleIntersectsSides(dataSlice.startAngle, dataSlice.endAngle, donutCircle, overlappingRectangle)) {
                    validMatch = true;
                }
            }
        }
    }
    return validMatch;
}
/**
 * Function checks if a point is inside a circle given the circle's centerPoint and radius
 * @param {point} point
 * @param {point} circleCenter
 * @param {radius} radius
 * @returns boolean true if point is inside the circle
 */
function insideInnerCircle(point, circleCenter, radius) {
    let distanceX = point.x - circleCenter.x;
    let distanceY = point.y - circleCenter.y;
    return distanceX * distanceX + distanceY * distanceY < radius * radius;
}

/**
 * Function calculates the angle of between 3 points CRS -> point C is the centerPoint, point R is the rectanglePoint and point S is the startPoint
 * resources: https://stackoverflow.com/questions/3486172/angle-between-3-points
 * @param {point} centerPoint
 * @param {point} rectanglePoint
 * @param {point} startPoint
 * @returns {angle} angle: returns the angle of CRS in radians between 0 and 2*PI
 */
function calculateAngle(centerPoint, rectanglePoint, startPoint) {
    let distanceToRectangle = {};
    let distanceToStart = {};
    // Calculate the distance to rectangle
    distanceToRectangle.x = centerPoint.x - rectanglePoint.x;
    distanceToRectangle.y = centerPoint.y - rectanglePoint.y;
    // Calculate the distance to start
    distanceToStart.x = centerPoint.x - startPoint.x;
    distanceToStart.y = centerPoint.y - startPoint.y;
    // Calculate the arctangent
    let atanToRectPoint = Math.atan2(distanceToRectangle.x, distanceToRectangle.y);
    let atanToStartPoint = Math.atan2(distanceToStart.x, distanceToStart.y);
    // Calculate the angle in -PI to + PI
    let angle = atanToStartPoint - atanToRectPoint;
    // Handle negative radian angles and transform them to positive
    if (angle < 0) {
        angle = angle + 2 * Math.PI;
    }
    return angle;
}

/**
 * Function is checking if two rectangles overlap
 * resources: https://www.codegrepper.com/code-examples/javascript/check+if+two+rectangles+overlap+javascript+canvas
 * resourses: https://stackoverflow.com/questions/16005136/how-do-i-see-if-two-rectangles-intersect-in-javascript-or-pseudocode/29614525#29614525
 * @param {selectionRectangle} selectionRectangle
 * @param {boundingClientRect} boundingClientRect
 * @returns boolean true if rectangles overlap
 */
function checkIfRectanglesOverlap(selectionRectangle, boundingClientRect) {
    return !(
        selectionRectangle.left >= boundingClientRect.right ||
        selectionRectangle.top >= boundingClientRect.bottom ||
        selectionRectangle.right <= boundingClientRect.left ||
        selectionRectangle.bottom <= boundingClientRect.top
    );
}

/**
 * Function is checking if an rectangle is in the empty middle space of the donut-chart
 * recourses: https://stackoverflow.com/questions/14097290/check-if-circle-contains-rectangle
 * @param {overlappingRectangle} overlappingRectangle
 * @param {donutCircle} donutCircle
 * @returns boolean true if rectangle is in the middle of the donut-chart
 *  */
function checkIfRectangularIsInMiddle(overlappingRectangle, donutCircle) {
    let distanceX = Math.max(
        donutCircle.x - overlappingRectangle.x,
        overlappingRectangle.x + overlappingRectangle.width - donutCircle.x
    );

    let distanceY = Math.max(
        donutCircle.y - overlappingRectangle.y,
        overlappingRectangle.y + overlappingRectangle.height - donutCircle.y
    );

    return donutCircle.innerRadius * donutCircle.innerRadius >= distanceX * distanceX + distanceY * distanceY;
}

/**
 * Function returns the overlapped area rectangle given two rectangles
 * recourses: https://stackoverflow.com/questions/22437523/return-intersection-position-and-size
 * @param {selectionRectangle} selectionRectangle
 * @param {boundingClientRect} boundingClientRect
 * @returns {overlappingRectangle} overlappingRectangle
 *  */
function getOverlappingRectangle(selectionRectangle, boundingClientRect) {
    let x = Math.max(selectionRectangle.x, boundingClientRect.x);
    let y = Math.max(selectionRectangle.y, boundingClientRect.y);

    let widthX = Math.min(
        selectionRectangle.x + selectionRectangle.width,
        boundingClientRect.x + boundingClientRect.width
    );
    let heightY = Math.min(
        selectionRectangle.y + selectionRectangle.height,
        boundingClientRect.y + boundingClientRect.height
    );

    return { x: x, y: y, width: widthX - x, height: heightY - y };
}
/**
 * Function is checking if two rectangles overlap
 * resources: https://www.geeksforgeeks.org/check-if-any-point-overlaps-the-given-circle-and-rectangle/
 * @param {selectionRectangle} selectionRectangle
 * @param {donutState.donutCircle} donutCircle
 * @returns boolean true if rectangle overlaps/collides with the donut chart
 */
function rectangularCircleColliding(selectionRectangle, donutCircle) {
    let closestX = clamp(donutCircle.x, selectionRectangle.x, selectionRectangle.x + selectionRectangle.width);
    let closestY = clamp(donutCircle.y, selectionRectangle.y, selectionRectangle.y + selectionRectangle.height);

    let distanceX = donutCircle.x - closestX;
    let distanceY = donutCircle.y - closestY;
    let distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared <= donutCircle.radius * donutCircle.radius;
}

function clamp(min, max, value) {
    return Math.max(max, Math.min(min, value));
}

/**
 * Function that returns a point on the circumference of a circle
 * @param {point} centerPoint
 * @param {number} angle: measured in radians
 * @param {radius} radius
 * @returns {point} point on the circle's circumference
 *  */
function getPointFromCircle(centerPoint, angle, radius) {
    // Default start point coordinates of the donut-chart
    let xStart = centerPoint.x + radius * Math.sin((angle - Math.PI) * -1);
    let yStart = centerPoint.y + radius * Math.cos((angle - Math.PI) * -1);

    return {x: xStart, y: yStart}
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

    let startOuterPoint = getPointFromCircle(donutCircle, startAngle, donutCircle.radius);
    let startInnerPoint = getPointFromCircle(donutCircle, startAngle, donutCircle.innerRadius);

    let endOuterPoint = getPointFromCircle(donutCircle, endAngle, donutCircle.radius);
    let endInnerPoint = getPointFromCircle(donutCircle, endAngle, donutCircle.innerRadius);

    let startLine = {innerPoint: startInnerPoint, outerPoint: startOuterPoint};
    let endLine = {innerPoint: endInnerPoint, outerPoint: endOuterPoint};

    let rectangleSides = [
        // Top side of the rectangle
        {x1: rectangle.x, y1: rectangle.y, x2: rectangle.x + rectangle.width, y2: rectangle.y},
        // Bottom side of the rectangle
        {x1: rectangle.x, y1: rectangle.y + rectangle.height, x2: rectangle.x + rectangle.width, y2: rectangle.y + rectangle.height},
        // Right side of the rectangle
        {x1: rectangle.x + rectangle.width, y1: rectangle.y, x2: rectangle.x + rectangle.width, y2: rectangle.y + rectangle.height},
        // Left side of the rectangle
        {x1: rectangle.x, y1: rectangle.y, x2: rectangle.x, y2: rectangle.y + rectangle.height}
    ]

    let intersections = [];

    // Concatenation of the intersection array's results into one
    intersections = intersections.concat(checkIfRectangleSidesIntersectLine(startLine, rectangleSides));
    intersections = intersections.concat(checkIfRectangleSidesIntersectLine(endLine, rectangleSides));

    // If the length of the intersections array is > 0, then it means we found at least one intersection between the lines and the rectangle
    return intersections.length > 0;
}

/**
 * Function that checks if the provided rectangle sides intersect with a given line
 * @param {line} line
 * @param {rectangleSides} rectangleSides
 * @returns {array} intersections
 *  */
function checkIfRectangleSidesIntersectLine(line, rectangleSides) {
    let intersections = [];
    for (let i = 0; i < rectangleSides.length; i++){
        let denominator = calculateDenominator(line, rectangleSides[i]);

        if (denominator !== 0) {
            let gamma = calculateGamma(line, rectangleSides[i], denominator);
            let lambda = calculateLambda(line, rectangleSides[i], denominator);

            if ((0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)) {
                intersections.push(true);
            }
        }
    }
    return intersections;
}

/**
 * Function that calculates the denominator used for the intersection calculations between two lines
 * @param {line} line
 * @param {rectangleLine} rectangleLine
 * @returns {number}
 *  */
function calculateDenominator(line, rectangleLine) {
    return ((line.outerPoint.x - line.innerPoint.x) * (rectangleLine.y2 - rectangleLine.y1) -
        (rectangleLine.x2 - rectangleLine.x1) * (line.outerPoint.y - line.innerPoint.y));
}

/**
 * Function that calculates the lambda used for the intersection calculations between two lines
 * @param {line} line
 * @param {rectangleLine} rectangleLine
 * @param {number} denominator
 * @returns {number}
 *  */
function calculateLambda(line, rectangleLine, denominator) {
    return denominator !== 0 ? ((rectangleLine.y2 - rectangleLine.y1) * (rectangleLine.x2 - line.innerPoint.x)
    + (rectangleLine.x1 - rectangleLine.x2) * (rectangleLine.y2 - line.innerPoint.y)) / denominator : 0;
}

/**
 * Function that calculates the gamma used for the intersection calculations between two lines
 * @param {line} line
 * @param {rectangleLine} rectangleLine
 * @param {number} denominator
 * @returns {number}
 *  */
function calculateGamma(line, rectangleLine, denominator) {
    return denominator !== 0 ? ((line.innerPoint.y - line.outerPoint.y) * (rectangleLine.x2 - line.innerPoint.x)
    + (line.outerPoint.x - line.innerPoint.x) * (rectangleLine.y2 - line.innerPoint.y)) / denominator : 0;
}