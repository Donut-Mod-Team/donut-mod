import * as d3 from "d3";
import * as marker from "./marker";
import { calculatePercentageValue, roundNumber } from "./utility";
import { applyHoverEffect } from "./hoverer";
import { initializeSettingsPopout } from "./popout";

/**
 * @param {object} donutState
 * @param {modProperty} modProperty
 */
export async function render(donutState, modProperty) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 10;
    // D3 animation duration used for svg shapes

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

    // Initialize the circle state
    donutState.donutCircle.x = width / 2;
    donutState.donutCircle.y = height / 2;
    donutState.donutCircle.radius = radius;
    donutState.donutCircle.innerRadius = innerRadius;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.absValue);

    const arc = d3.arc().padAngle(padding).innerRadius(innerRadius).outerRadius(radius);

    let centerColorText = d3
        .selectAll("#center-color")
        .style("fill", donutState.styles.fontColor)
        .style("width", `${calculateCenterTextSpace()}%`)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-weight", donutState.styles.fontWeight)
        .style("font-size", donutState.styles.fontSize);

    let centerText = d3
        .selectAll("#center-text")
        .style("fill", donutState.styles.fontColor)
        .style("opacity", 0)
        .style("width", `${calculateCenterTextSpace()}%`)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-size", donutState.styles.fontSize);

    calculateMarkedCenterText(donutState.data);

    // Join new data
    const sectors = svg
        .select("g#sectors")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });

    const labelColorLuminance = calculateLuminance(
        parseInt(donutState.styles.fontColor.substr(1, 2), 16),
        parseInt(donutState.styles.fontColor.substr(3, 2), 16),
        parseInt(donutState.styles.fontColor.substr(5, 2), 16)
    );

    const backgroundLuminance = calculateLuminance(
        parseInt(donutState.styles.backgroundColor.substr(1, 2), 16),
        parseInt(donutState.styles.backgroundColor.substr(3, 2), 16),
        parseInt(donutState.styles.backgroundColor.substr(5, 2), 16)
    );

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
                    .text(modProperty.labelsVisible.value === "none" ? "" : getLabelText())
                    .attr("text-anchor", "middle")
                    .call((enter) =>
                        enter
                            .transition("add labels")
                            .duration(animationDuration)
                            .style("opacity", calculateTextOpacity)
                            .attrTween("transform", calculateLabelPosition)
                            .styleTween("text-anchor", getLabelAlignment)
                            .attr("fill", (d) => calculateTextColor(d.data.color))
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
                        .text(modProperty.labelsVisible.value === "none" ? "" : getLabelText())
                        .attrTween("transform", calculateLabelPosition)
                        .styleTween("text-anchor", getLabelAlignment)
                        .attr("fill", (d) => calculateTextColor(d.data.color))
                        .attr("font-family", donutState.styles.fontFamily)
                        .attr("font-style", donutState.styles.fontStyle)
                        .attr("font-weight", donutState.styles.fontWeight)
                        .attr("font-size", donutState.styles.fontSize)
                ),
            (exit) => exit.transition("remove labels").duration(animationDuration).style("opacity", 0).remove()
        );

    function getLabelAlignment(d) {
        if (modProperty.labelsPosition.value() === "inside") {
            return function () {
                return "middle";
            };
        }
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
            let d2 = interpolate(t);
            return midAngle(d2) < Math.PI ? "start" : "end";
        };
    }

    /**
     * This function gets the sector's color, and returns the corresponding color for the text
     * of its label.
     * @param {string} sectorColor
     * @returns {string}
     */
    function calculateTextColor(sectorColor) {
        if (sectorColor === "transparent") {
            return donutState.styles.fontColor;
        }
        if (modProperty.labelsPosition.value() === "outside") {
            return donutState.styles.fontColor;
        }
        // Check if background luminance is closer to dark background color
        if (backgroundLuminance < 0.5) {
            return contrastToLabelColor(sectorColor) > 1.7
                ? donutState.styles.fontColor
                : donutState.styles.backgroundColor;
        }

        return contrastToLabelColor(sectorColor) > 2.7
            ? donutState.styles.fontColor
            : donutState.styles.backgroundColor;
    }

    /**
     * This function calculates the contrast ratio between the passed selector color,
     * and the default one (labelColorLuminance).
     * Further reading on the calculation part: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
     * @param sectorColor
     * @returns {number}
     */
    function contrastToLabelColor(sectorColor) {
        let fillLuminance = calculateLuminance(
            parseInt(sectorColor.substr(1, 2), 16),
            parseInt(sectorColor.substr(3, 2), 16),
            parseInt(sectorColor.substr(5, 2), 16)
        );
        // Calculating the relative luminance for the brightest of the colors
        let brightest = Math.max(fillLuminance, labelColorLuminance);
        // Calculating the relative luminance for the darkest of the colors
        let darkest = Math.min(fillLuminance, labelColorLuminance);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * This function gets the RGB values for a given sector's color, and calculates the corresponding luminance.
     * Further reading on the calculations used: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-procedure
     * @param r
     * @param g
     * @param b
     * @returns {number}
     */
    function calculateLuminance(r, g, b) {
        let a = [r, g, b].map(function (v) {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function calculateTextOpacity(data) {
        let box = this.getBoundingClientRect();
        let labelWidth = box.right - box.left;
        let labelHeight = box.bottom - box.top;
        let labelVisibilityBound = donutState.donutCircle.radius - donutState.donutCircle.innerRadius;
        return labelWidth < labelVisibilityBound && labelHeight < labelVisibilityBound && data.data.absPercentage >= 5
            ? "1"
            : "0";
    }

    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        let i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    // Returns the function and/or empty string depending for the labels depending on the settings selected in popout(defined in the modProperty
    function getLabelText() {
        if (modProperty.labelsVisible.value() === "all") {
            return (d) => d.data.getLabelText(modProperty);
        } else if (modProperty.labelsVisible.value() === "marked") {
            return (d) => {
                if (d.data.markedRowCount() > 0) {
                    return d.data.getLabelText(modProperty);
                } else return "";
            };
        }
        return "";
    }
    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    function calculateLabelPosition(data) {
        let positionOffset = modProperty.labelsPosition.value() === "inside" ? 0.75 : 1.03;
        let centeringFactor = radius * positionOffset;
        let centroid = arc.centroid(data);
        let x = centroid[0];
        let y = centroid[1];
        let h = Math.sqrt(x * x + y * y);
        return function () {
            return "translate(" + (x / h) * centeringFactor + "," + (y / h) * centeringFactor + ")";
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
            centerText.style("opacity", 0);
            centerColorText.style("opacity", 0);
        }
    }

    function onMouseOver(d) {
        d3.select("path#hoverID_" + d.data.renderID)
            .transition()
            .duration(animationDuration)
            .style("opacity", "1");
        if (d.data.markedRowCount() === 0 && centerText.style("opacity") === "0") {
            centerText.text(roundNumber(d.data.centerSum, 2));
            centerText.style("opacity", 1);
            centerColorText.style("opacity", 1);
            centerColorText.text(d.data.colorValue);
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
