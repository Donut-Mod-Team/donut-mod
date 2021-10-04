import * as d3 from "d3";
import * as math from "mathjs"

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
                    const overlap = canvas.append("path").attr("class", "rectangle").attr("visibility", "visible");
                    overlap
                        .attr(
                            "d",
                            drawRectangle(
                                overlappingRectangle.x,
                                overlappingRectangle.y,
                                overlappingRectangle.width,
                                overlappingRectangle.height
                            )
                        )
                        .attr("visibility", "visible");
                    match = !checkIfRectangularIsInMiddle(overlappingRectangle, donutState.donutCircle);
                    //https://stackoverflow.com/questions/17427088/how-to-get-coordinates-of-slices-along-the-edge-of-a-pie-chart/37502964

                    // let vector1 = [
                    //     [donutState.donutCircle.x, donutState.donutCircle.y],
                    //     [overlappingRectangle.x, overlappingRectangle.y]
                    // ];
                    // let vector2 = [
                    //     [donutState.donutCircle.x, donutState.donutCircle.y],
                    //     [0,1]
                    // ];
                    // // Math.acos returns the arccosine in radians
                    //
                    // let vecDistance = Math.sqrt(Math.pow(vector1[0]-vector2[0],2)+Math.pow(vector1[1]-vector2[1],2));
                    // let dotProduct = math.dot(vector1, vector2);
                    // console.log(Math.acos(dotProduct/vecDistance));

                    let a = [overlappingRectangle.x, overlappingRectangle.y];
                    let b = [donutState.donutCircle.x,donutState.donutCircle.y + donutState.donutCircle.radius];
                    let circlePoint = [donutState.donutCircle.x,donutState.donutCircle.y];

                    let vector1 = math.matrix([a, circlePoint]);
                    let vector2 = math.matrix([b, circlePoint]);

                    console.log("Vector 1:" + vector1);
                    console.log("Vector 2:" + vector2);

                    let dotProduct = math.dot(vector1, vector2);
                    //let dotProduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
                    let vecDistance = Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));

                    console.log("dot product: " + dotProduct);
                    console.log("distance " + vecDistance);

                    let acos = Math.acos(dotProduct/vecDistance);

                    console.log("Top left angle: " + acos);

                    let xStart =
                        donutState.donutCircle.x +
                        donutState.donutCircle.radius * Math.sin((d.startAngle - Math.PI) * -1);
                    let yStart =
                        donutState.donutCircle.y +
                        donutState.donutCircle.radius * Math.cos((d.startAngle - Math.PI) * -1);
                    let xEnd =
                        donutState.donutCircle.x +
                        donutState.donutCircle.radius * Math.sin((d.endAngle - Math.PI) * -1);
                    let yEnd =
                        donutState.donutCircle.y +
                        donutState.donutCircle.radius * Math.cos((d.endAngle - Math.PI) * -1);
                    canvas
                        .append("line")
                        .style("stroke", "green")
                        .style("stroke-width", 1)
                        .attr("x1", xStart)
                        .attr("y1", yStart)
                        .attr("x2", donutState.donutCircle.x)
                        .attr("y2", donutState.donutCircle.y);
                    canvas
                        .append("line")
                        .style("stroke", "red")
                        .style("stroke-width", 1)
                        .attr("x1", xEnd)
                        .attr("y1", yEnd)
                        .attr("x2", donutState.donutCircle.x)
                        .attr("y2", donutState.donutCircle.y);
                    let xTopLeft = overlappingRectangle.x;
                    let yTopLeft = overlappingRectangle.y;
                    let xTopRight = overlappingRectangle.x + overlappingRectangle.width;
                    let yTopRight = overlappingRectangle.y;
                    let xBLeft = overlappingRectangle.x;
                    let yBleft = overlappingRectangle.y + overlappingRectangle.height;
                    let xBRight = overlappingRectangle.x + overlappingRectangle.width;
                    let yBRight = overlappingRectangle.y + overlappingRectangle.height;
                    canvas
                        .append("line")
                        .style("stroke", "blue")
                        .style("stroke-width", 1)
                        .attr("x1", xBRight)
                        .attr("y1", yBRight)
                        .attr("x2", donutState.donutCircle.x)
                        .attr("y2", donutState.donutCircle.y);
                    canvas
                        .append("line")
                        .style("stroke", "blue")
                        .style("stroke-width", 1)
                        .attr("x1", xBLeft)
                        .attr("y1", yBleft)
                        .attr("x2", donutState.donutCircle.x)
                        .attr("y2", donutState.donutCircle.y);
                    canvas
                        .append("line")
                        .style("stroke", "blue")
                        .style("stroke-width", 1)
                        .attr("x1", xTopLeft)
                        .attr("y1", yTopLeft)
                        .attr("x2", donutState.donutCircle.x)
                        .attr("y2", donutState.donutCircle.y);
                    canvas
                        .append("line")
                        .style("stroke", "blue")
                        .style("stroke-width", 1)
                        .attr("x1", xTopRight)
                        .attr("y1", yTopRight)
                        .attr("x2", donutState.donutCircle.x)
                        .attr("y2", donutState.donutCircle.y);
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
