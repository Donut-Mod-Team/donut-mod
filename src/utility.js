/**
 * Function checks if a point is inside a circle given the circle's centerPoint and radius
 * @param {point} point
 * @param {point} circleCenter
 * @param {radius} radius
 * @returns boolean true if point is inside the circle
 */
import { resources } from "./resources";

export function checkIfPointIsInsideCircle(point, circleCenter, radius) {
    let distanceX = point.x - circleCenter.x;
    let distanceY = point.y - circleCenter.y;
    return distanceX * distanceX + distanceY * distanceY < radius * radius;
}

/***
 * Function returns the formatted value of a given number by a given symbol(last symbol can be B, M, K, T)
 * @param {number} totalSum
 * @param {string} firstSymbol
 * @param {string} lastSymbol
 * @returns {string|Number} returns a formatted number or empty string if provided value is null
 */
export function formatTotalSum(totalSum, firstSymbol, lastSymbol) {
    if (totalSum != null) {
        if (lastSymbol != null && lastSymbol.length !== 0) {
            lastSymbol = lastSymbol.toLowerCase();
            let unit = lastSymbol.length > 1 ? lastSymbol[0] : lastSymbol;
            let total = totalSum;
            let isRounded = false;
            if (lastSymbol.includes(resources.scientificSymbol.toLowerCase())) {
                return total.toExponential(6);
            }
            if (unit === "b") {
                total = roundNumber(totalSum / 1000000000, 0);
                isRounded = true;
            }
            if (unit === "k") {
                total = roundNumber(totalSum / 1000, 0);
                isRounded = true;
            }
            if (unit === "m") {
                total = roundNumber(totalSum / 1000000, 0);
                isRounded = true;
            }
            if (unit === "t") {
                total = roundNumber(totalSum / 1000000000000, 0);
                isRounded = true;
            }
            if (unit === "%") {
                total = roundNumber(totalSum * 100, 2);
                return total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }

            if (!isRounded) {
                return formatNumber(roundNumber(total, 2), firstSymbol, lastSymbol).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            } else {
                return formatNumber(total, firstSymbol, lastSymbol).toLocaleString(undefined, {
                    maximumFractionDigits: total % 1 !== 0 ? 2 : 0,
                    minimumFractionDigits: total % 1 !== 0 ? 2 : 0
                });
            }
        }
        return formatNumber(roundNumber(totalSum, 2), firstSymbol, lastSymbol).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    return "";
}

/**
 * Function that formats a number depending on the negative number representation
 * @param {number} number
 * @param {string} firstSymbol
 * @param {string} lastSymbol
 * @returns {number} number
 */
function formatNumber(number, firstSymbol, lastSymbol) {
    if (firstSymbol.length > 0 && lastSymbol.length > 0) {
        if (firstSymbol[0].includes("(") && lastSymbol[lastSymbol.length - 1].includes(")") && number < 0) {
            return Math.abs(number);
        }
    }
    return number;
}

/**
 * Function calculates the angle of between 3 points CRS -> point C is the centerPoint, point R is the rectanglePoint and point S is the startPoint
 * resources: https://stackoverflow.com/questions/3486172/angle-between-3-points
 * @param {point} centerPoint
 * @param {point} rectanglePoint
 * @param {point} startPoint
 * @returns {angle} angle: returns the angle of CRS in radians between 0 and 2*PI
 */
export function calculateAngle(centerPoint, rectanglePoint, startPoint) {
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
export function checkIfRectanglesOverlap(selectionRectangle, boundingClientRect) {
    return !(
        selectionRectangle.left >= boundingClientRect.right ||
        selectionRectangle.top >= boundingClientRect.bottom ||
        selectionRectangle.right <= boundingClientRect.left ||
        selectionRectangle.bottom <= boundingClientRect.top
    );
}

/**
 * Function is checking if a given rectangle's X-axis dimensions go outside of a specified (container-like) rectangle
 * @param {selectionRectangle} selectionRectangle
 * @param {boundingClientRectangle} boundingClientRectangle
 * @returns {boolean}
 */
export function checkIfRectanglesGoOutside(selectionRectangle, boundingClientRectangle) {
    // Offset used to narrow the space which is considered to be marked as "outside" of the epxected one
    const centeringFactor = 7;
    return (
        selectionRectangle.left < boundingClientRectangle.left + centeringFactor ||
        selectionRectangle.right > boundingClientRectangle.right - centeringFactor
    );
}

/**
 * Function is checking if a rectangle is inside a circle
 * recourses: https://stackoverflow.com/questions/14097290/check-if-circle-contains-rectangle
 * @param {overlappingRectangle} overlappingRectangle
 * @param {donutCircle} donutCircle
 * @param {radius} radius
 * @returns boolean true if rectangle is in the middle of the circle
 *  */
export function checkIfRectangularIsInCircle(overlappingRectangle, donutCircle, radius) {
    let distanceX = Math.max(
        donutCircle.x - overlappingRectangle.x,
        overlappingRectangle.x + overlappingRectangle.width - donutCircle.x
    );

    let distanceY = Math.max(
        donutCircle.y - overlappingRectangle.y,
        overlappingRectangle.y + overlappingRectangle.height - donutCircle.y
    );

    return radius * radius >= distanceX * distanceX + distanceY * distanceY;
}

/**
 * Function returns the overlapped area rectangle given two rectangles
 * recourses: https://stackoverflow.com/questions/22437523/return-intersection-position-and-size
 * @param {selectionRectangle} selectionRectangle
 * @param {boundingClientRect} boundingClientRect
 * @returns {overlappingRectangle} overlappingRectangle
 *  */
export function getOverlappingRectangle(selectionRectangle, boundingClientRect) {
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
export function rectangularCircleColliding(selectionRectangle, donutCircle) {
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
export function getPointFromCircle(centerPoint, angle, radius) {
    // Default start point coordinates of the donut-chart
    let xStart = centerPoint.x + radius * Math.sin((angle - Math.PI) * -1);
    let yStart = centerPoint.y + radius * Math.cos((angle - Math.PI) * -1);

    return { x: xStart, y: yStart };
}

/**
 * Function that checks if the provided rectangle sides intersect with a given line
 * @param {line} line
 * @param {lines[]} rectangleSides
 * @returns {array} intersections
 *  */
export function checkIfRectangleSidesIntersectLine(line, rectangleSides) {
    let intersections = [];
    for (let i = 0; i < rectangleSides.length; i++) {
        let denominator = calculateDenominator(line, rectangleSides[i]);

        if (denominator !== 0) {
            let gamma = calculateGamma(line, rectangleSides[i], denominator);
            let lambda = calculateLambda(line, rectangleSides[i], denominator);

            if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
                intersections.push(true);
            }
        }
    }
    return intersections;
}

/**
 * Function that calculates the denominator used for the intersection calculations between two lines
 * @param {line} line
 * @param {line} rectangleLine
 * @returns {number}
 *  */
function calculateDenominator(line, rectangleLine) {
    return (
        (line.outerPoint.x - line.innerPoint.x) * (rectangleLine.y2 - rectangleLine.y1) -
        (rectangleLine.x2 - rectangleLine.x1) * (line.outerPoint.y - line.innerPoint.y)
    );
}

/**
 * Function that calculates the lambda used for the intersection calculations between two lines
 * @param {line} line
 * @param {line} rectangleLine
 * @param {number} denominator
 * @returns {number}
 *  */
function calculateLambda(line, rectangleLine, denominator) {
    return denominator !== 0
        ? ((rectangleLine.y2 - rectangleLine.y1) * (rectangleLine.x2 - line.innerPoint.x) +
              (rectangleLine.x1 - rectangleLine.x2) * (rectangleLine.y2 - line.innerPoint.y)) /
              denominator
        : 0;
}

/**
 * Function that calculates the gamma used for the intersection calculations between two lines
 * @param {line} line
 * @param {line} rectangleLine
 * @param {number} denominator
 * @returns {number}
 *  */
function calculateGamma(line, rectangleLine, denominator) {
    return denominator !== 0
        ? ((line.innerPoint.y - line.outerPoint.y) * (rectangleLine.x2 - line.innerPoint.x) +
              (line.outerPoint.x - line.innerPoint.x) * (rectangleLine.y2 - line.innerPoint.y)) /
              denominator
        : 0;
}

/** Function takes a float value and returns it with
 * set amount of decimals
 * @param {Number} value
 * @param {int} decimals
 * @return {Number}
 */
export function roundNumber(value, decimals) {
    return Number(Math.round(parseFloat(value + "e" + decimals)) + "e-" + decimals);
}
/** Function calculates the percentage value of two given params, rounding by given decimals
 * @param {Number} value
 * @param {Number} denominator
 * @param {Number} decimals
 * @return {Number}
 */
export function calculatePercentageValue(value, denominator, decimals) {
    return roundNumber((value / denominator) * 100, decimals);
}
