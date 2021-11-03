import * as d3 from "d3";
import * as marker from "./marker";
import { calculatePercentageValue, roundNumber } from "./utility";
import { applyHoverEffect } from "./hoverer";
import { initializeSettingsPopout } from "./popout";
import { addLabels } from "./labels";

/**
 * @param {object} donutState
 * @param {modProperty} modProperty
 */
export async function render(donutState, modProperty) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 10;
    // D3 animation duration used for svg shapes

    // Constant to be used for making the center value font size larger
    const centerValueFontModifier = 1.2;

    const animationDuration = 250;

    const width = donutState.size.width - sizeModifier;
    const height = donutState.size.height - sizeModifier;

    if (height <= 0 || width <= 0) {
        return;
    }

    const radius = Math.min(width, height) / 2 - sizeModifier;
    const innerRadius = radius * 0.5;

    let padding = 0;
    // The padding threshold is set to 6 because this is the amount of sectors where the padding becomes too small.
    const paddingThreshold = 6;

    if (donutState.data.length < paddingThreshold) {
        padding = 0.02 / donutState.data.length;
    } else {
        padding = 0.05 / donutState.data.length;
    }

    let sortingEnabled = modProperty.sortedPlacement.value();
    let sortingOrder = modProperty.sortedPlacementOrder.value();

    // Initialize the circle state
    donutState.donutCircle.x = width / 2;
    donutState.donutCircle.y = height / 2;
    donutState.donutCircle.radius = radius;
    donutState.donutCircle.innerRadius = innerRadius;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3
        .pie()
        .value((d) => d.absValue)
        .sort(function (a, b) {
            if (sortingEnabled) {
                if (sortingOrder === "ascending") {
                    return b.value - a.value;
                }
                return a.value - b.value;
            }
            return null;
        });

    const arc = d3.arc().padAngle(padding).innerRadius(innerRadius).outerRadius(radius);

    let centerColorText = d3
        .selectAll("#center-color")
        .style("fill", donutState.styles.fontColor)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-size", donutState.styles.fontSize)
        .text("init");

    let centerText = d3
        .selectAll("#center-text")
        .style("fill", donutState.styles.fontColor)
        .style("opacity", 0)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-size", `${donutState.styles.fontSize * centerValueFontModifier}px`);
    if (donutState.data[0].centerTotal === 0) {
        centerText.text(roundNumber(donutState.totalCenterSum, 2));
        centerText.style("opacity", 1);
    }

    d3.selectAll("#center-expression")
        .style("opacity", 1)
        .style("fill", donutState.styles.fontColor)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-weight", donutState.styles.fontWeight)
        .style("font-size", donutState.styles.fontSize)
        .text(donutState.centerExpression);

    calculateMarkedCenterText(donutState.data);

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
        .on("mouseleave", onMouseLeave)
        .on("mouseover", onMouseOver)
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

    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        let i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    function calculateCenterTextSpace() {
        return calculatePercentageValue(innerRadius, width, 0) > calculatePercentageValue(radius, height, 0)
            ? calculatePercentageValue(innerRadius, width, 0)
            : calculatePercentageValue(innerRadius, height, 0);
    }

    function calculateMarkedCenterText(data) {
        let centerTotal = 0;
        let markedSectors = [];

        if (data.length > 0 && data[0].centerSum === null) {
            return;
        } else if (data.length === 0) {
            return;
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].markedRowCount() > 0) {
                centerTotal += data[i].centerSum;
                markedSectors.push(i);
            }
        }
        for (let i = 0; i < data.length; i++) {
            data[i].centerTotal = centerTotal;
        }
        if (markedSectors.length > 0) {
            centerText.text(roundNumber(centerTotal, 2)).style("opacity", 1);
        }
        if (markedSectors.length === 1) {
            centerColorText.text(data[markedSectors[0]].colorValue).style("opacity", 1);
        } else {
            centerColorText.style("opacity", 0);
        }
    }
    function onMouseLeave(d) {
        donutState.modControls.tooltip.hide();
        d3.select("path#hoverID_" + d.data.renderID)
            .transition()
            .duration(animationDuration)
            .style("opacity", "0");
        if (centerText.style("opacity") === "1" && d.data.centerTotal === 0) {
            centerText.text(roundNumber(donutState.totalCenterSum, 2));
            centerColorText.style("opacity", 0);
        }
    }

    function onMouseOver(d) {
        d3.select("path#hoverID_" + d.data.renderID)
            .transition()
            .duration(animationDuration)
            .style("opacity", "1");
        if (d.data.centerTotal === 0) {
            centerText.text(d.data.centerSum != null ? roundNumber(d.data.centerSum, 2) : "");
            centerText.style("opacity", 1);
            centerColorText.style("opacity", 1);
            centerColorText.text(d.data.centerSum != null ? d.data.colorValue : "");
        }
    }
    // If editing mode is enabled initialize the setting-popout
    donutState.context.isEditing &&
        initializeSettingsPopout(
            donutState.modControls.popout,
            donutState.modControls.tooltip,
            animationDuration,
            modProperty
        );

    marker.drawRectangularSelection(donutState);
    applyHoverEffect(pie, donutState, animationDuration);
    addLabels(arc, pie, donutState, modProperty, animationDuration);
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
