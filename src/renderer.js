import * as d3 from "d3";
import { drawRectangularSelection, select } from "./marker";
import { applyHoverEffect, hideHighlightEffect, showHighlightEffect } from "./hoverer";
import { initializeSettingsPopout } from "./popout";
import { addLabels } from "./labels";
import { resources } from "./resources";
import { refreshCenterTextOnMouseLeave, refreshCenterTextOnMouseover, renderCenterText } from "./centerText";

/**
 * @param {object} donutState
 * @param {modProperty} modProperty
 * @param {boolean} circleTypeChanged
 * @param {boolean} labelsPositionChanged
 */
export async function render(donutState, modProperty, circleTypeChanged, labelsPositionChanged) {
    const width = donutState.size.width - resources.sizeModifier;
    const height = donutState.size.height - resources.sizeModifier;

    const circleTypeTransformationHeight =
        modProperty.circleType.value() === resources.popoutCircleTypeSemiValue ? height / 1.5 : height / 2;
    const circleTypeTransformationWidth = width / 2;

    if (height <= 0 || width <= 0) {
        return;
    }

    const radius =
        modProperty.labelsPosition.value() === resources.popoutLabelsPositionOutsideValue
            ? Math.min(width, height) / 2 - resources.sizeModifier - resources.labelsTextOutsideSizeModifier
            : Math.min(width, height) / 2 - resources.sizeModifier;
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

    // Specify the starting and ending angle for the Donut Chart to use, in order to be drawn.
    // Default starts from 0 to 360 degrees. For semi-donut chart the values are -90 to 90 degrees.
    let startPieAngle =
        modProperty.circleType.value() === resources.popoutCircleTypeSemiValue
            ? resources.semiCircleStartAngle
            : resources.wholeCircleStartAngle;
    let endPieAngle =
        modProperty.circleType.value() === resources.popoutCircleTypeSemiValue
            ? resources.semiCircleEndAngle
            : resources.wholeCircleEndAngle;

    // Initialize the circle state
    donutState.donutCircle.x = circleTypeTransformationWidth;
    donutState.donutCircle.y = circleTypeTransformationHeight;
    donutState.donutCircle.radius = radius;
    donutState.donutCircle.innerRadius = innerRadius;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3
        .select("#mod-container svg g")
        .attr("transform", `translate(${circleTypeTransformationWidth}, ${circleTypeTransformationHeight})`);

    const pie = d3
        .pie()
        .startAngle(startPieAngle)
        .endAngle(endPieAngle)
        .value((d) => d.absValue)
        .sort(function (a, b) {
            return calculateSortingOrder(a, b);
        });

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
        .attr("id", function (d) {
            return "sectorID_" + d.data.id;
        })
        .on("click", function (d) {
            select(d);
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
        .duration(resources.animationDuration)
        .attr("value", (d) => d.data.absPercentage)
        .attr("fill", (d) => d.data.color)
        .attrTween("d", tweenArc)
        .attr("stroke", (d) => (d.data.markedRowCount() > 0 ? donutState.styles.fontColor : "none"));

    sectors.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();

    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        let i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    function onMouseLeave(d) {
        donutState.modControls.tooltip.hide();
        hideHighlightEffect(d.data.id);
        if (d3.select("#center-text").style("opacity") === "1" && d.data.centerTotal === 0) {
            refreshCenterTextOnMouseLeave(d);
        }
    }

    function onMouseOver(d) {
        showHighlightEffect(d.data.id);
        if (d.data.centerTotal === 0 && d.data.centerSumFormatted != null) {
            refreshCenterTextOnMouseover(d);
        }
    }

    function calculateSortingOrder(a, b) {
        if (sortingEnabled) {
            if (modProperty.circleType.value() === resources.popoutCircleTypeSemiValue) {
                if (sortingOrder === resources.popoutSortedPlacementOrderAscendingValue) {
                    return a.absValue - b.absValue;
                }
                return b.absValue - a.absValue;
            } else {
                if (sortingOrder === resources.popoutSortedPlacementOrderAscendingValue) {
                    return b.absValue - a.absValue;
                }
                return a.absValue - b.absValue;
            }
        }
        return null;
    }

    // If editing mode is enabled initialize the setting-popout
    donutState.context.isEditing &&
        initializeSettingsPopout(donutState.modControls.popout, donutState.modControls.tooltip, modProperty);

    drawRectangularSelection(donutState, modProperty);
    applyHoverEffect(pie, donutState);
    addLabels(arc, pie, donutState, modProperty, circleTypeChanged, labelsPositionChanged);
    drawOuterLinesForNegativeValues(pie, donutState, padding, svg);
    renderCenterText(donutState, radius, modProperty);

    sectors.exit().transition().duration(resources.animationDuration).attr("fill", "transparent").remove();

    donutState.context.signalRenderComplete();
}

/**
 * Function is creating and drawing the outlines for sectors with negative values
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * @param {number} padding
 * @param {d3.svg} svg
 * */
function drawOuterLinesForNegativeValues(pie, donutState, padding, svg) {
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
        .duration(resources.animationDuration)
        .attrTween("d", function (d) {
            return function () {
                return outerArcNegativeValues(d);
            };
        })
        .attr("class", "outerSectorArc")
        .style("opacity", getOpacityForOuterSide);

    outerSectorsNegativeValues
        .exit()
        .transition()
        .duration(resources.animationDuration)
        .attr("fill", "transparent")
        .remove();
}

/** Function check if a data-set contains negative values and returns the opacity
 * @param {data} d
 * @returns {string} string containing a value for opacity positive for negative value and zero if positive value
 * */
function getOpacityForOuterSide(d) {
    return d.data.value < 0 ? "1" : "0";
}
