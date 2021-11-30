import * as d3 from "d3";
import { resources } from "./resources";
import { getPointFromCircle } from "./utility";

/**
 * Function is responsible for creating and applying hover effect on the donut-chart
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * */
export function applyHoverEffect(pie, donutState) {
    // Define the outer highlight arc for hovering
    let arc = d3
        .arc()
        .innerRadius(donutState.donutCircle.radius + resources.arcsRadiusOuterOffset)
        .outerRadius(donutState.donutCircle.radius + resources.arcsRadiusOuterOffset);
    drawArc(pie, arc, donutState, "outer");

    // Define the inner highlight arc for hovering
    arc = d3
        .arc()
        .innerRadius(donutState.donutCircle.innerRadius - resources.arcsRadiusInnerOffset)
        .outerRadius(donutState.donutCircle.innerRadius - resources.arcsRadiusInnerOffset);
    drawArc(pie, arc, donutState, "inner");
    // Draw the side parallel lines
    drawLines(pie, donutState, resources.leftSectorSideIdentifier);
    drawLines(pie, donutState, resources.rightSectorSideIdentifier);
}

/**
 * Function draws a highlighted sector arc
 * @param pie
 * @param highlightArc
 * @param donutState
 * @param idKey
 */
function drawArc(pie, highlightArc, donutState, idKey) {
    let highlightedSectors = d3
        .select("#highlight-sector-" + idKey)
        .attr("pointer-events", "none")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });
    // Create the sectors to be shown when hovering over with id's and set them as unseen
    let sectors = highlightedSectors
        .enter()
        .append("path")
        .attr("id", function (d) {
            return "hoverID_" + idKey + "_" + d.data.renderID;
        })
        .attr("d", function (d) {
            highlightArc.startAngle(d.startAngle).endAngle(d.endAngle);
            return highlightArc(d);
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // define behaviour for transition
    highlightedSectors
        .merge(sectors)
        .transition()
        .duration(resources.animationDuration)
        .attrTween("d", function (d) {
            return function () {
                highlightArc.startAngle(d.startAngle).endAngle(d.endAngle);
                return highlightArc(d);
            };
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px");

    highlightedSectors.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();
}

/**
 * Function hides the highlight effect for a given sector id by setting the opacity to 0
 * @param {string} renderID
 */
export async function hideHighlightEffect(renderID) {
    d3.select("path#hoverID_inner_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_outer_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_line_right_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_line_left_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
}

/**
 * Function shows the highlight effect for a given sector id by setting the opacity to 1
 * @param renderID
 */
export async function showHighlightEffect(renderID) {
    d3.select("path#hoverID_inner_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_outer_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_line_right_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_line_left_" + renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
}

/**
 * Function draws the highlight side lines for a given sector side
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * @param {string} sectorSide: "left" or "right"
 */
function drawLines(pie, donutState, sectorSide) {
    let lines = d3
        .select("g#highlight-side-lines-" + sectorSide)
        .selectAll("path")
        .data(pie(donutState.data), (d, i) => {
            return d.data.id + i;
        });

    let sectorLines = lines
        .enter()
        .append("path")
        .attr("pointer-events", "none")
        .attr("id", function (d) {
            return "hoverID_line_" + sectorSide + "_" + d.data.renderID;
        })
        .style("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .attr("class", "line-hover")
        .attr("d", lineCoordinates)
        .style("opacity", "0");

    lines.merge(sectorLines).transition().duration(1).attr("d", lineCoordinates);

    function lineCoordinates(d) {
        let points = calculatePointsForLine(d, donutState, sectorSide);
        return d3.line()([
            [points[2][0], points[2][1]],
            [points[0][0], points[0][1]],
            [points[1][0], points[1][1]],
            [points[3][0], points[3][1]]
        ]);
    }

    lines.exit().transition().duration(1).attr("fill", "transparent").remove();
}

/**
 * Calculates the Points for the parallel line of a given sector and the side of the parallel in relation to the original
 * (Ex. "right" sectorSide will produce parallel points for a line on the right to the original)
 * @param {donutState.data} sectorData
 * @param {donutState} donutState
 * @param {string} sectorSide: "left" or "right", left side will produce parallel on the left and right will return parallel line points on the right
 * @return {((number|*)[]|*[])[]} array of points coordinates, [0] and [1] are the parallel line points, [2] and [3] are the original sector line points
 */
function calculatePointsForLine(sectorData, donutState, sectorSide) {
    // Radius and inner radius are offset by the same constants as the arcs highlight
    let innerRadius = donutState.donutCircle.innerRadius - resources.arcsRadiusInnerOffset;
    let radius = donutState.donutCircle.radius + resources.arcsRadiusOuterOffset;
    // The distance constant is used to define the distance between the original and parallel points
    const distance = 3;
    let parallelPoints = [];
    let originalPoints = [];
    // Calculate the original and parallel points depending on the side given
    if (sectorSide === resources.leftSectorSideIdentifier) {
        originalPoints[0] = getPointFromCircle(donutState.donutCircle, sectorData.startAngle, innerRadius);
        originalPoints[1] = getPointFromCircle(donutState.donutCircle, sectorData.startAngle, radius);
        parallelPoints = calculateParallelPoints(
            distance,
            originalPoints[0],
            originalPoints[1],
            resources.leftSectorSideIdentifier
        );
    } else if (sectorSide === resources.rightSectorSideIdentifier) {
        originalPoints[0] = getPointFromCircle(donutState.donutCircle, sectorData.endAngle, innerRadius);
        originalPoints[1] = getPointFromCircle(donutState.donutCircle, sectorData.endAngle, radius);
        parallelPoints = calculateParallelPoints(
            distance,
            originalPoints[0],
            originalPoints[1],
            resources.rightSectorSideIdentifier
        );
    }
    // return all the points
    return [
        [parallelPoints[0].x, parallelPoints[0].y],
        [parallelPoints[1].x, parallelPoints[1].y],
        [originalPoints[0].x, originalPoints[0].y],
        [originalPoints[1].x, originalPoints[1].y]
    ];
}

/**
 * Function calculates the parallel points of given points by the distance and the specified side (the point can be on the right or left of the original).
 * @param {number} distance
 * @param {{x:number,y:number}} firstPoint
 * @param {{x:number,y:number}} secondPoint
 * @param {string} sideOfPoints: "right" for getting parallel points position on the right of the original, else it returns the points on the left side
 * @return {{x: number, y: *}[]} array containing the parallel points [0] position for the parallel of the fist point
 */
function calculateParallelPoints(distance, firstPoint, secondPoint, sideOfPoints) {
    // Used to position the points on the left or right side of the original set
    let parallelPointsPosition = sideOfPoints === resources.rightSectorSideIdentifier ? -1 : 1;
    // Calculate the sine and cosine
    let cosine = Math.cos(Math.atan2(firstPoint.y - secondPoint.y, firstPoint.x - secondPoint.x));
    let sine = Math.sin(Math.atan2(firstPoint.y - secondPoint.y, firstPoint.x - secondPoint.x));
    // Calculate the parallel points
    let firstParallelPoint = {
        x: firstPoint.x - distance * sine * parallelPointsPosition,
        y: firstPoint.y + distance * cosine * parallelPointsPosition
    };
    let secondParallelPoint = {
        x: secondPoint.x - distance * sine * parallelPointsPosition,
        y: secondPoint.y + distance * cosine * parallelPointsPosition
    };
    return [firstParallelPoint, secondParallelPoint];
}
