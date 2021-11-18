import * as d3 from "d3";
import { calculatePercentageValue, formatTotalSum } from "./utility";
import { resources } from "./resources";

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
    let yPointDifference = centerTextBox.bottom - height / 2;
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

    function calculateCenterTextSpace() {
        const spaceModifier = 0.9;
        return calculatePercentageValue(radius * spaceModifier, width, 0) <
            calculatePercentageValue(radius * spaceModifier, height, 0)
            ? calculatePercentageValue(radius * spaceModifier, width, 0)
            : calculatePercentageValue(radius * spaceModifier, height, 0);
    }

    function calculateMarkedCenterText(data) {
        let centerTotal = 0;
        let markedSectors = [];

        if (data.length > 0 && data[0].centerSumFormatted === null) {
            return;
        }
        if (data.length === 0) {
            return;
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].markedRowCount() > 0) {
                // Extract the formated number from the formatted value string and convert it to a number
                centerTotal += data[i].centerSum;
                markedSectors.push(i);
            }
        }
        for (let i = 0; i < data.length; i++) {
            data[i].centerTotal = centerTotal;
        }
        if (markedSectors.length > 1) {
            centerText
                .text(
                    data[0].currencySymbol +
                        formatTotalSum(centerTotal, data[0].centerValueSumLastSymbol) +
                        data[0].centerValueSumLastSymbol
                )
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

export function refreshCenterTextOnMouseLeave(d) {
    d3.select("#center-text").text(d.data.totalCenterSumFormatted != null ? d.data.totalCenterSumFormatted : "");
    d3.select("#center-color").style("opacity", 0);
}

export function refreshCenterTextOnMouseover(d) {
    d3.select("#center-text").text(d.data.centerSumFormatted);
    d3.select("#center-text").style("opacity", 1);
    d3.select("#center-color").style("opacity", 1);
    d3.select("#center-color").text(d.data.colorValue);
}
