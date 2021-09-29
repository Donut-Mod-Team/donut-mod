import * as d3 from "d3";

/**
 * Method for selecting a dataset
 * @param {data} d
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
 * The function handles rectangle drag selection
 * @param {donutState} donutState
 */
export function drawRectangularSelection(donutState) {
    function drawRectangle(x, y, w, h) {
        return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
    }
    let canvas = d3.select("#mod-container svg");
    const rectangle = canvas.append("path").attr("class", "rectangle").attr("visibility", "hidden");

    const startSelection = function (start) {
        /* Here we change the colour to the Tibco-approved colour. (See the style property).
        The problem is that the colour returned is white. Change the colour in the css file
        if you want to see that the colour changes (remove style tag as well).*/
        rectangle.attr("d", drawRectangle(start[0], start[1], 0, 0)).attr("visibility", "visible");
    };

    const moveSelection = function (start, moved) {
        rectangle.attr("d", drawRectangle(start[0], start[1], moved[0] - start[0], moved[1] - start[1]));
    };

    const endSelection = async function (start, end) {
        rectangle.attr("visibility", "hidden");

        // Ignore rectangular markings that were just a click.
        if (Math.abs(start[0] - end[0]) < 2 || Math.abs(start[1] - end[1]) < 2) {
            if (d3.select(d3.event.target).node().nodeName === "path") {
                return;
            }
            return unSelect(donutState);
        }

        const selectionBox = rectangle.node().getBoundingClientRect();
        const svgRadarMarkedCircles = d3
            .select("#mod-container svg g")
            .selectAll("path")
            .filter(function () {
                const boundingClientRect = this.getBoundingClientRect();
                let match = false;
                if (
                    checkIfRectanglesOverlap(selectionBox, boundingClientRect) &&
                    rectangularCircleColliding(selectionBox, donutState.donutCircle)
                ) {
                    let overlappingRectangle = getOverlappingRectangle(selectionBox, boundingClientRect);
                    match = !checkIfRectangularIsInMiddle(overlappingRectangle, donutState.donutCircle);
                }
                return match;
            });

        if (svgRadarMarkedCircles.size() === 0) {
            return;
        }
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

//https://www.codegrepper.com/code-examples/javascript/check+if+two+rectangles+overlap+javascript+canvas
//https://stackoverflow.com/questions/16005136/how-do-i-see-if-two-rectangles-intersect-in-javascript-or-pseudocode/29614525#29614525
function checkIfRectanglesOverlap(selectionBox, rectangle) {
    return !(
        selectionBox.left >= rectangle.right ||
        selectionBox.top >= rectangle.bottom ||
        selectionBox.right <= rectangle.left ||
        selectionBox.bottom <= rectangle.top
    );
}

//https://stackoverflow.com/questions/14097290/check-if-circle-contains-rectangle
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

//https://stackoverflow.com/questions/22437523/return-intersection-position-and-size
function getOverlappingRectangle(selectionBox, rectangle) {
    let x = Math.max(selectionBox.x, rectangle.x);
    let y = Math.max(selectionBox.y, rectangle.y);
    let widthX = Math.min(selectionBox.x + selectionBox.width, rectangle.x + rectangle.width);
    let heightY = Math.min(selectionBox.y + selectionBox.height, rectangle.y + rectangle.height);
    return { x: x, y: y, width: widthX - x, height: heightY - y };
}

//https://www.geeksforgeeks.org/check-if-any-point-overlaps-the-given-circle-and-rectangle/
function rectangularCircleColliding(selectionBox, donutCircle) {
    let closestX = clamp(donutCircle.x, selectionBox.x, selectionBox.x + selectionBox.width);
    let closestY = clamp(donutCircle.y, selectionBox.y, selectionBox.y + selectionBox.height);

    // also test for corner collisions
    let distanceX = donutCircle.x - closestX;
    let distanceY = donutCircle.y - closestY;
    let distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared <= donutCircle.radius * donutCircle.radius;
}

function clamp(min, max, value) {
    return Math.max(max, Math.min(min, value));
}
