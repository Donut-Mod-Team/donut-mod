import * as d3 from "d3";
import * as marker from "./marker";
import { roundNumber } from "./utility";
import { applyHoverEffect } from "./hoverer";

/**
 * @param {object} donutState
 */
export async function render(donutState) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 10;
    // D3 animation duration used for svg shapes

    const animationDuration = 250;

    const width = donutState.size.width - sizeModifier;
    const height = donutState.size.height - sizeModifier;
    const radius = Math.min(width, height) / 2 - sizeModifier;
    const innerRadius = radius * 0.5;
    const padding = 0.05 / donutState.data.length;

    // Initialize the circle state
    donutState.donutCircle.x = width / 2;
    donutState.donutCircle.y = height / 2;
    donutState.donutCircle.radius = radius;
    donutState.donutCircle.innerRadius = innerRadius;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.absValue);

    const arc = d3.arc().padAngle(padding).innerRadius(innerRadius).outerRadius(radius);

    // Join new data
    const sectors = svg
        .select("g#sectors")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });

    let newSectors = sectors
        .enter()
        .append("svg:path")
        .on("click", function (d) {
            marker.select(d);
            d3.event.stopPropagation();
        })
        .on("mouseenter", function (d) {
            donutState.modControls.tooltip.show(d.data.tooltip());
        })
        .on("mouseleave", function (d) {
            donutState.modControls.tooltip.hide();
            d3.select("path#hoverID_" + d.data.id)
                .transition()
                .duration(animationDuration)
                .style("opacity", "0");
        })
        .on("mouseover", function (d) {
            d3.select("path#hoverID_" + d.data.id)
                .transition()
                .duration(animationDuration)
                .style("opacity", "1");
        })
        .attr("fill", () => "transparent")
        .attr("stroke", (d) => (d.data.markedRowCount() > 0 ? donutState.styles.fontColor : "none"));
    sectors
        .merge(newSectors)
        .transition()
        .duration(animationDuration)
        .attr("value", (d) => d.data.absPercentage)
        .attr("fill", (d) => d.data.color)
        .attrTween("d", tweenArc)
        .attr("stroke", (d) => (d.data.markedRowCount() > 0 ? donutState.styles.fontColor : "none"));

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    svg.select("g#labels")
        .attr("pointer-events", "none")
        .selectAll("text")
        .data(pie(donutState.data), (d) => `label-${d.data.id}`)
        .join(
            (enter) => {
                return enter
                    .append("text")
                    .style("opacity", 0)
                    .attr("dy", "0.35em")
                    .attr("fill", donutState.styles.fontColor)
                    .attr("font-family", donutState.styles.fontFamily)
                    .attr("font-style", donutState.styles.fontStyle)
                    .attr("font-weight", donutState.styles.fontWeight)
                    .attr("font-size", donutState.styles.fontSize)
                    .text((d) => d.data.absPercentage + "%")
                    .attr("text-anchor", "middle")
                    .call((enter) =>
                        enter
                            .transition("add labels")
                            .duration(animationDuration)
                            .style("opacity", calculateTextOpacity)
                            .attr("transform", calculateLabelPosition)
                            .attr("fill", donutState.styles.fontColor)
                            .attr("font-family", donutState.styles.fontFamily)
                            .attr("font-style", donutState.styles.fontStyle)
                            .attr("font-weight", donutState.styles.fontWeight)
                            .attr("font-size", donutState.styles.fontSize)
                    );
            },
            (update) =>
                update.call((update) =>
                    update
                        .transition("update labels")
                        .duration(animationDuration)
                        .style("opacity", calculateTextOpacity)
                        .text((d) => d.data.absPercentage + "%")
                        .attr("transform", calculateLabelPosition)
                        .attr("fill", donutState.styles.fontColor)
                        .attr("font-family", donutState.styles.fontFamily)
                        .attr("font-style", donutState.styles.fontStyle)
                        .attr("font-weight", donutState.styles.fontWeight)
                        .attr("font-size", donutState.styles.fontSize)
                ),
            (exit) => exit.transition("remove labels").duration(animationDuration).style("opacity", 0).remove()
        );

    function calculateTextOpacity(data) {
        let box = this.getBoundingClientRect();
        let labelWidth = box.right - box.left;
        let labelHeight = box.bottom - box.top;
        let labelVisibilityBound = donutState.donutCircle.radius - donutState.donutCircle.innerRadius;
        return labelWidth < labelVisibilityBound && labelHeight < labelVisibilityBound && data.data.absPercentage >= 5
            ? "1"
            : "0";
    }

    d3.select("#centertext")
        .text("Sum: " + calculateMiddleText(donutState.data))
        .attr("fill", donutState.styles.fontColor)
        .attr("font-family", donutState.styles.fontFamily)
        .attr("font-style", donutState.styles.fontStyle)
        .attr("font-weight", donutState.styles.fontWeight)
        .attr("font-size", donutState.styles.fontSize);

    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        let i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    function calculateLabelPosition(data) {
        let centeringFactor = radius * 0.75;
        let centroid = arc.centroid(data);
        let x = centroid[0];
        let y = centroid[1];
        let h = Math.sqrt(x * x + y * y);
        return "translate(" + (x / h) * centeringFactor + "," + (y / h) * centeringFactor + ")";
    }

    function calculateMiddleText(data) {
        let middleText = 0;
        for (let i = 0; i < data.length; i++) {
            middleText += data[i].absValue;
        }
        return roundNumber(middleText, 2);
    }

    marker.drawRectangularSelection(donutState);
    applyHoverEffect(pie, donutState, animationDuration);

    drawOuterLinesForNegativeValues(pie, donutState, animationDuration, padding, svg);

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    donutState.context.signalRenderComplete();
}
/**
 * Function is creating and drawing the outlines for sectors with negative values
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * @param {number} animationDuration
 * @param {number} padding
 * @param {d3.svg} svg
 * */
function drawOuterLinesForNegativeValues(pie, donutState, animationDuration, padding, svg) {
    // Used for the outer side showing negative values
    let outerArcNegativeValues = d3
        .arc()
        .padAngle(padding)
        .innerRadius(donutState.donutCircle.radius + 2) // makes the outer arc bigger than the original
        .outerRadius(donutState.donutCircle.radius + 3); // defines the size of the outer arc as 1
    // Define the outer arc paths and data
    let outerSectorsNegativeValues = svg
        .select("g#outer-sectors")
        .attr("pointer-events", "none")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });

    // Initial rendering
    outerSectorsNegativeValues
        .enter()
        .append("path")
        .attr("d", function (d) {
            return outerArcNegativeValues(d);
        })
        .attr("class", "outerSectorArc")
        .style("opacity", getOpacityForOuterSide);

    // Define behavior on transition
    outerSectorsNegativeValues
        .transition()
        .duration(animationDuration)
        .attrTween("d", function (d) {
            return function () {
                return outerArcNegativeValues(d);
            };
        })
        .attr("class", "outerSectorArc")
        .style("opacity", getOpacityForOuterSide);

    outerSectorsNegativeValues.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();
}

/** Function check if a data-set contains negative values and returns the opacity
 * @param {data} d
 * @returns {string} string containing a value for opacity positive for negative value and zero if positive value
 * */
function getOpacityForOuterSide(d) {
    return d.data.value < 0 ? "0.8" : "0";
}
