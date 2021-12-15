import * as d3 from "d3";
import { resources } from "./resources";
import { checkIfRectanglesGoOutside } from "./utility";

/**
 * This function is responsible to generate the labels and handle their behavior
 * @param {d3.arc} arc
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * @param {modProperty} modProperty
 * @param {boolean} circleTypeChanged
 * @param {boolean} labelsPositionChanged
 */
export function addLabels(arc, pie, donutState, modProperty, circleTypeChanged, labelsPositionChanged) {
    const middleRadiansThreshold =
        modProperty.circleType.value() === resources.popoutCircleTypeSemiValue ? 2 * Math.PI : Math.PI;

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
    const svg = d3.select("#mod-container svg g");

    let labels = svg
        .select("g#labels")
        .attr("pointer-events", "none")
        .selectAll("text")
        .data(pie(donutState.data), (d) => `label-${d.data.id}`);

    labels
        .enter()
        .append("text")
        .attr("id", function (d) {
            return "labelID_" + d.data.id;
        })
        .attr("dy", ".35em")
        .attr("fill", donutState.styles.fontColor)
        .attr("font-family", donutState.styles.fontFamily)
        .attr("font-style", donutState.styles.fontStyle)
        .attr("font-weight", donutState.styles.fontWeight)
        .attr("font-size", donutState.styles.fontSize)
        .attr("transform", calculateLabelPosition)
        .style("text-anchor", (d) => {
            if (modProperty.labelsPosition.value() === resources.popoutLabelsPositionInsideValue) {
                return "middle";
            }
            if (modProperty.circleType.value() === resources.popoutCircleTypeSemiValue) {
                return midAngle(d) < middleRadiansThreshold ? "end" : "start";
            }
            return midAngle(d) < middleRadiansThreshold ? "start" : "end";
        })
        .attr("fill", (d) => calculateTextColor(d.data.color))
        .text(
            modProperty.labelsVisible.value === resources.popoutLabelsVisibleNoneValue ? "" : (d) => returnLabelText(d)
        );

    labels
        .transition("update labels")
        .duration(resources.animationDuration)
        .attrTween("transform", function (d) {
            return function () {
                return calculateLabelPosition(d);
            };
        })
        .styleTween("text-anchor", getLabelAlignment)
        .attr("fill", (d) => calculateTextColor(d.data.color))
        .attr("font-family", donutState.styles.fontFamily)
        .attr("font-style", donutState.styles.fontStyle)
        .attr("font-weight", donutState.styles.fontWeight)
        .attr("font-size", donutState.styles.fontSize)
        .text(
            modProperty.labelsVisible.value === resources.popoutLabelsVisibleNoneValue ? "" : (d) => returnLabelText(d)
        );

    labels
        .exit()
        .transition("remove labels")
        .duration(resources.animationDuration)
        .attr("fill", "transparent")
        .remove();

    /** Function that returns the label's text with a timeout to allow the DOM to refresh, in order to
     *  get the correct bounding boxes.
     * @param {donutState.data} d
     */
    function returnLabelText(d) {
        let text = "";
        if (d.data.absPercentage < resources.sectorHidingPercentageThreshold) {
            return text;
        }

        if (modProperty.labelsVisible.value() === resources.popoutLabelsVisibleAllValue) {
            text = d.data.getLabelText(modProperty);
            d3.timeout(
                () => {
                    return adjustLabelTextToFit(d, text);
                },
                circleTypeChanged || labelsPositionChanged ? resources.animationDuration : resources.timeoutDelay
            );
        }

        if (modProperty.labelsVisible.value() === resources.popoutLabelsVisibleMarkedValue) {
            if (d.data.markedRowCount() > 0) {
                text = d.data.getLabelText(modProperty);
                d3.timeout(
                    () => {
                        return adjustLabelTextToFit(d, text);
                    },
                    circleTypeChanged || labelsPositionChanged ? resources.animationDuration : resources.timeoutDelay
                );
            }
        }
        return text;
    }

    /** Function that adjusts given label's text based on whenever they overlap with the mod-container.
     * @param {donutState.data} d
     * @param {string} text label's text
     * @returns {string} adjusted label's text
     */
    function adjustLabelTextToFit(d, text) {
        let labelNodes = d3.selectAll("g#labels").selectAll("text");
        let label = labelNodes.filter(function () {
            return this.id === "labelID_" + d.data.id;
        });
        let container = d3.select("#mod-container");
        text = text.toString();
        label.text(text);
        while (
            label.node() &&
            checkIfRectanglesGoOutside(label.node().getBoundingClientRect(), container.node().getBoundingClientRect())
        ) {
            if (text.length < 2) {
                text = "";
                return text;
            }
            text = text.slice(0, text.length - 1);
            label.text(text);

            if (
                !checkIfRectanglesGoOutside(
                    label.node().getBoundingClientRect(),
                    container.node().getBoundingClientRect()
                )
            ) {
                text = text.slice(0, text.length - 2);
                text = text + "...";
                label.text(text);
                return text;
            }
        }
        return text;
    }

    /**
     * This function returns the corresponding alignment for the label's text
     * @param {donutState.data} d
     * @returns {(function(): string)|(function(*=): string)} label's alignment
     */
    function getLabelAlignment(d) {
        if (modProperty.labelsPosition.value() === resources.popoutLabelsPositionInsideValue) {
            return function () {
                return "middle";
            };
        }
        this._current = this._current || d;
        let interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
            let d2 = interpolate(t);

            if (modProperty.circleType.value() === resources.popoutCircleTypeSemiValue) {
                return midAngle(d2) < middleRadiansThreshold ? "end" : "start";
            }
            return midAngle(d2) < middleRadiansThreshold ? "start" : "end";
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
        if (modProperty.labelsPosition.value() === resources.popoutLabelsPositionOutsideValue) {
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

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    /**
     * This function calculates the position of the labels, by taking into consideration the popout settings selection
     * @param {donutState.data} data
     * @returns {string} label position
     */
    function calculateLabelPosition(data) {
        let positionOffset =
            modProperty.labelsPosition.value() === resources.popoutLabelsPositionInsideValue
                ? resources.labelsPositionOffsetInsideDonut
                : resources.labelsPositionOffsetOutsideDonut;

        let centeringFactor = donutState.donutCircle.radius * positionOffset;
        let centroid = arc.centroid(data);
        let x = centroid[0];
        let y = centroid[1];
        let h = Math.sqrt(x * x + y * y);
        return "translate(" + (x / h) * centeringFactor + "," + (y / h) * centeringFactor + ")";
    }
}
