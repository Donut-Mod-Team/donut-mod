import * as d3 from "d3";
import { resources } from "./resources";
import { getPointFromCircle } from "./utility";

/**
 * Function is responsible for creating and applying hover effect on the donut-chart
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * */
export function applyHoverEffect(pie, donutState) {
    const angleOffset = 0;
    // Define the sectors to be shown when hovering over

    // Define the highlight arc for hovering
    let arc = d3
        .arc()
        .innerRadius(donutState.donutCircle.radius + 4.5)
        .outerRadius(donutState.donutCircle.radius + 4);
    drawArc(pie, arc, donutState, angleOffset, "outer");
    // Define the highlight arc for hovering
    arc = d3
        .arc()
        .innerRadius(donutState.donutCircle.innerRadius - 2.5)
        .outerRadius(donutState.donutCircle.innerRadius - 1.5);
    drawArc(pie, arc, donutState, angleOffset, "inner");
    drawLines(pie, donutState);
}

function drawArc(pie, highlightArc, donutState, angleOffset, idKey) {
    let highlightedSectors = d3
        .select("g#highlight-sector-" + idKey)
        .attr("pointer-events", "none")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });
    // Create the sectors to be shown when hovering over with id's and set them as unseen
    highlightedSectors
        .enter()
        .append("path")
        .attr("id", function (d) {
            return "hoverID_" + idKey + "_" + d.data.renderID;
        })
        .attr("d", function (d) {
            highlightArc.startAngle(d.startAngle - angleOffset).endAngle(d.endAngle + angleOffset);
            return highlightArc(d);
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // define behaviour for transition
    highlightedSectors
        .transition()
        .duration(resources.animationDuration)
        .attrTween("d", function (d) {
            return function () {
                highlightArc.startAngle(d.startAngle - angleOffset).endAngle(d.endAngle + angleOffset);
                return highlightArc(d);
            };
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px");

    highlightedSectors.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();
}
export function hideHighlightEffect(d) {
    d3.select("path#hoverID_inner_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("path#hoverID_outer_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("line#hoverID_line_end_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
    d3.select("line#hoverID_line_start_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "0");
}

export function showHighlightEffect(d) {
    d3.select("path#hoverID_inner_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("path#hoverID_outer_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("line#hoverID_line_end_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
    d3.select("line#hoverID_line_start_" + d.data.renderID)
        .transition()
        .duration(resources.animationDuration)
        .style("opacity", "1");
}

function drawLines(pie, donutState) {
    // Define the sectors to be shown when hovering over
    let svg = d3
        .select("#mod-container svg")
        .selectAll("line")
        .data(pie(donutState.data), (d, i) => {
            return d.data.id + i;
        });

    svg.enter()
        .append("line")
        .attr("pointer-events", "none")
        .attr("id", function (d) {
            return "hoverID_line_start_" + d.data.renderID;
        })
        .style("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .attr("class", "line-hover")
        .attr("x1", (d) => getPoints(d, donutState)[0][0])
        .attr("x2", (d) => getPoints(d, donutState)[1][0])
        .attr("y1", (d) => getPoints(d, donutState)[0][1])
        .attr("y2", (d) => getPoints(d, donutState)[1][1])
        .style("opacity", "0");

    svg.enter()
        .append("line")
        .attr("pointer-events", "none")
        .attr("id", function (d) {
            return "hoverID_line_end_" + d.data.renderID;
        })
        .style("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .attr("class", "line-hover")
        .attr("x1", (d) => getPoints(d, donutState)[2][0])
        .attr("x2", (d) => getPoints(d, donutState)[3][0])
        .attr("y1", (d) => getPoints(d, donutState)[2][1])
        .attr("y2", (d) => getPoints(d, donutState)[3][1])
        .style("opacity", "0")
        .transition()
        .duration(resources.animationDuration)
        .attr("x1", (d) => getPoints(d, donutState)[2][0])
        .attr("x2", (d) => getPoints(d, donutState)[3][0])
        .attr("y1", (d) => getPoints(d, donutState)[2][1])
        .attr("y2", (d) => getPoints(d, donutState)[3][1])
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px");
}

function getPoints(d, donutState) {
    const angleOffset = 0;

    let innerRadius = donutState.donutCircle.innerRadius - 2.5;
    let radius = donutState.donutCircle.radius + 4;
    let distance = 3;
    let startPointInnerOriginal = getPointFromCircle(donutState.donutCircle, d.startAngle - angleOffset, innerRadius);
    let startPointOuterOriginal = getPointFromCircle(donutState.donutCircle, d.startAngle - angleOffset, radius);
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
    let endPointInnerOriginal = getPointFromCircle(donutState.donutCircle, d.endAngle + angleOffset, innerRadius);
    let endPointOuterOriginal = getPointFromCircle(donutState.donutCircle, d.endAngle + angleOffset, radius);
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
        [endPointOuterOffset.x, endPointOuterOffset.y]
    ];
}
