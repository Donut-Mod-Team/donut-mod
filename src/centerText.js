import * as d3 from "d3";
import { calculatePercentageValue, formatTotalSum } from "./utility";
import { resources } from "./resources";

/**
 * Function responsible for the rendering of the center text of the Donut Chart
 * @param {donutState} donutState
 * @param {number} radius
 * @param {modProperty} modProperty
 */
export function renderCenterText(donutState, radius, modProperty) {
    // Constant to be used for making the center value font size larger
    const centerValueFontModifier = 1.2;

    const width = donutState.size.width - resources.sizeModifier;
    const height = donutState.size.height - resources.sizeModifier;

    let centerColorText = d3
        .selectAll("#center-color")
        .style("fill", donutState.styles.fontColor)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-size", donutState.styles.fontSize)
        .style("opacity", 0)
        .text(".");

    let centerText = d3
        .selectAll("#center-text")
        .style("fill", donutState.styles.fontColor)
        .style("opacity", 0)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-size", `${donutState.styles.fontSize * centerValueFontModifier}px`);
    if (donutState.data[0].centerTotal === 0 && donutState.data[0].totalCenterSumFormatted != null) {
        centerText.text(donutState.data[0].totalCenterSumFormatted, 2);
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

    let centerTextBox = d3.selectAll("#center-text").node().getBoundingClientRect();
    // Difference in Y-axis between the centerTextBox and the canvas' height,
    // which affects the positioning of the center text for semi-circle
    let yPointDifference =
        width < resources.semiCircleCenterTextPositioningThreshold
            ? centerTextBox.bottom - height / resources.semiCircleCenterTextDecreasedHeightPositioning
            : centerTextBox.bottom - height / resources.semiCircleCenterTextIncreasedHeightPositioning;
    let centerTextSemiCircleTransformationHeight =
        donutState.donutCircle.y - centerTextBox.bottom - centerTextBox.height + yPointDifference;

    d3.select("#center")
        .transition()
        .duration(resources.animationDuration)
        .style(
            "transform",
            `translate(${0}px, ${
                modProperty.circleType.value() === resources.popoutCircleTypeSemiValue
                    ? centerTextSemiCircleTransformationHeight
                    : 0
            }px)`
        );

    calculateMarkedCenterText(donutState.data);

    // Function that returns the width for the center text
    function calculateCenterTextSpace() {
        const spaceModifier = 0.9;
        return calculatePercentageValue(radius * spaceModifier, width, 0) <
            calculatePercentageValue(radius * spaceModifier, height, 0)
            ? calculatePercentageValue(radius * spaceModifier, width, 0)
            : calculatePercentageValue(radius * spaceModifier, height, 0);
    }

    // Function that calculates and sets the center text when sectors are marked
    function calculateMarkedCenterText(data) {
        let centerTotal = 0;
        let markedSectors = [];

        if (data.length > 0 && data[0].centerSumFormatted === null) {
            return;
        }
        if (data.length === 0) {
            return;
        }

        // Calculate the total center value for all the marked sectors
        for (let i = 0; i < data.length; i++) {
            if (data[i].markedRowCount() > 0) {
                centerTotal += data[i].centerSum;
                markedSectors.push(i);
            }
        }
        // Update the centerTotal
        for (let i = 0; i < data.length; i++) {
            data[i].centerTotal = centerTotal;
        }
        // Depending on whether there are marked sectors, set the center text accordingly
        if (markedSectors.length > 1) {
            centerText
                .text(() => {
                    if (data[0].centerValueSumLastSymbol === resources.scientificSymbol) {
                        return (
                            data[0].centerValueFirstSymbols +
                            formatTotalSum(
                                centerTotal,
                                data[0].centerValueFirstSymbols,
                                data[0].centerValueSumLastSymbol
                            )
                        );
                    }
                    return (
                        data[0].centerValueFirstSymbols +
                        formatTotalSum(centerTotal, data[0].centerValueFirstSymbols, data[0].centerValueSumLastSymbol) +
                        data[0].centerValueSumLastSymbol
                    );
                })
                .style("opacity", 1);
        }
        if (markedSectors.length === 1) {
            centerColorText.text(data[markedSectors[0]].colorValue).style("opacity", 1);
            centerText.text(data[markedSectors[0]].centerSumFormatted).style("opacity", 1);
        } else {
            centerColorText.style("opacity", 0);
        }
    }
}

/**
 * Function responsible for hiding the center text
 * @param {data} d
 */
export function refreshCenterTextOnMouseLeave(d) {
    d3.select("#center-text").text(d.data.totalCenterSumFormatted != null ? d.data.totalCenterSumFormatted : "");
    d3.select("#center-color").style("opacity", 0);
}

/**
 * Function responsible for visualizing the center text
 * @param {data} d
 */
export function refreshCenterTextOnMouseover(d) {
    d3.select("#center-text").text(d.data.centerSumFormatted);
    d3.select("#center-text").style("opacity", 1);
    d3.select("#center-color").style("opacity", 1);
    d3.select("#center-color").text(d.data.colorValue);
}
