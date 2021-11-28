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
        .innerRadius(donutState.donutCircle.radius + 4.5)
        .outerRadius(donutState.donutCircle.radius + 4.5);
    drawArc(pie, arc, donutState, "outer");

    // Define the inner highlight arc for hovering
    arc = d3
        .arc()
        .innerRadius(donutState.donutCircle.innerRadius - 3)
        .outerRadius(donutState.donutCircle.innerRadius - 3);
    drawArc(pie, arc, donutState, "inner");
    // Draw the side parallel lines
    drawLines(pie, donutState);
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
export async function hideHighlightEffect(d) {
    d3.select("path#hoverID_inner_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_outer_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_line_end_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_line_start_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
}

/**
 *
 * @param sectorData
 */
export async function showHighlightEffect(sectorData) {
    d3.select("path#hoverID_inner_" + sectorData.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_outer_" + sectorData.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_line_end_" + sectorData.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_line_start_" + sectorData.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
}

/**
 *
 * @param pie
 * @param donutState
 */
function drawLines(pie, donutState) {
    let oldSideLinesPresent = false;

    let startLines = d3
        .select("g#highlight-side-lines-start")
        .selectAll("path")
        .data(pie(donutState.data), (d, i) => {
            return d.data.id + i;
        });

    let linesStart = startLines
        .enter()
        .append("path")
        .attr("pointer-events", "none")
        .attr("id", function (d) {
            return "hoverID_line_start_" + d.data.renderID;
        })
        .style("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .attr("class", "line-hover")
        .style("opacity", (d) => (oldSideLinesPresent && d.data.markedRowCount() > 0 ? "1" : "0"))
        .attr("d", (d) => {
            let points = getPoints(d, donutState);
            return d3.line()([
                [points[4][0], points[4][1]],
                [points[0][0], points[0][1]],
                [points[1][0], points[1][1]],
                [points[5][0], points[5][1]]
            ]);
        });

    startLines
        .merge(linesStart)
        .transition()
        .duration(resources.animationDuration)
        .attr("d", (d) => {
            let points = getPoints(d, donutState);
            return d3.line()([
                [points[4][0], points[4][1]],
                [points[0][0], points[0][1]],
                [points[1][0], points[1][1]],
                [points[5][0], points[5][1]]
            ]);
        });

    let endLines = d3
        .select("g#highlight-side-lines-end")
        .selectAll("path")
        .data(pie(donutState.data), (d, i) => {
            return d.data.id + i;
        });
    let linesEnd = endLines
        .enter()
        .append("path")
        .attr("pointer-events", "none")
        .attr("id", function (d) {
            return "hoverID_line_end_" + d.data.renderID;
        })
        .style("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .attr("class", "line-hover")
        .attr("d", (d) => {
            let points = getPoints(d, donutState);
            return d3.line()([
                [points[6][0], points[6][1]],
                [points[2][0], points[2][1]],
                [points[3][0], points[3][1]],
                [points[7][0], points[7][1]]
            ]);
        })
        .style("opacity", (d) => (oldSideLinesPresent && d.data.markedRowCount() > 0 ? "1" : "0"));
    endLines
        .merge(linesEnd)
        .transition()
        .duration(resources.animationDuration)
        .attr("d", (d) => {
            let points = getPoints(d, donutState);
            return d3.line()([
                [points[6][0], points[6][1]],
                [points[2][0], points[2][1]],
                [points[3][0], points[3][1]],
                [points[7][0], points[7][1]]
            ]);
        });

    startLines.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();
    endLines.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();
}

/**
 *
 * @param sectorData
 * @param donutState
 * @return {((number|*)[]|*[])[]}
 */
function getPoints(sectorData, donutState) {
    let innerRadius = donutState.donutCircle.innerRadius - 3;
    let radius = donutState.donutCircle.radius + 4;
    let distance = 3;
    let startPointInnerOriginal = getPointFromCircle(donutState.donutCircle, sectorData.startAngle, innerRadius);
    let startPointOuterOriginal = getPointFromCircle(donutState.donutCircle, sectorData.startAngle, radius);
    let startPointOuterOffset = {
        x:
            startPointOuterOriginal.x -
            distance *
                Math.sin(
                    Math.atan2(
                        startPointInnerOriginal.y - startPointOuterOriginal.y,
                        startPointInnerOriginal.x - startPointOuterOriginal.x
                    )
                ),
        y:
            startPointOuterOriginal.y +
            distance *
                Math.cos(
                    Math.atan2(
                        startPointInnerOriginal.y - startPointOuterOriginal.y,
                        startPointInnerOriginal.x - startPointOuterOriginal.x
                    )
                )
    };

    let startPointInnerOffset = {
        x:
            startPointInnerOriginal.x -
            distance *
                Math.sin(
                    Math.atan2(
                        startPointInnerOriginal.y - startPointOuterOriginal.y,
                        startPointInnerOriginal.x - startPointOuterOriginal.x
                    )
                ),
        y:
            startPointInnerOriginal.y +
            distance *
                Math.cos(
                    Math.atan2(
                        startPointInnerOriginal.y - startPointOuterOriginal.y,
                        startPointInnerOriginal.x - startPointOuterOriginal.x
                    )
                )
    };
    //https://stackoverflow.com/questions/58727038/draw-parallel-measurement-notation-lines-using-d3js
    let endPointInnerOriginal = getPointFromCircle(donutState.donutCircle, sectorData.endAngle, innerRadius);
    let endPointOuterOriginal = getPointFromCircle(donutState.donutCircle, sectorData.endAngle, radius);
    let endPointOuterOffset = {
        x:
            endPointOuterOriginal.x -
            distance *
                Math.sin(
                    Math.atan2(
                        endPointInnerOriginal.y - endPointOuterOriginal.y,
                        endPointInnerOriginal.x - endPointOuterOriginal.x
                    )
                ) *
                -1,
        y:
            endPointOuterOriginal.y +
            distance *
                Math.cos(
                    Math.atan2(
                        endPointInnerOriginal.y - endPointOuterOriginal.y,
                        endPointInnerOriginal.x - endPointOuterOriginal.x
                    )
                ) *
                -1
    };
    let endPointInnerOffset = {
        x:
            endPointInnerOriginal.x -
            distance *
                Math.sin(
                    Math.atan2(
                        endPointInnerOriginal.y - endPointOuterOriginal.y,
                        endPointInnerOriginal.x - endPointOuterOriginal.x
                    )
                ) *
                -1,
        y:
            endPointInnerOriginal.y +
            distance *
                Math.cos(
                    Math.atan2(
                        endPointInnerOriginal.y - endPointOuterOriginal.y,
                        endPointInnerOriginal.x - endPointOuterOriginal.x
                    )
                ) *
                -1
    };
    return [
        [startPointInnerOffset.x, startPointInnerOffset.y],
        [startPointOuterOffset.x, startPointOuterOffset.y],
        [endPointInnerOffset.x, endPointInnerOffset.y],
        [endPointOuterOffset.x, endPointOuterOffset.y],
        [startPointInnerOriginal.x, startPointInnerOriginal.y],
        [startPointOuterOriginal.x, startPointOuterOriginal.y],
        [endPointInnerOriginal.x, endPointInnerOriginal.y],
        [endPointOuterOriginal.x, endPointOuterOriginal.y]
    ];
}
