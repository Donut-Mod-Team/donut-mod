import * as d3 from "d3";
import { calculatePercentageValue, roundNumber } from "./utility";
import { resources } from "./resources";

export function renderCenterText(donutState, radius) {
    // Constant to be used for making the center value font size larger
    const centerValueFontModifier = 1.2;

    const width = donutState.size.width - resources.sizeModifier;
    const height = donutState.size.height - resources.sizeModifier;

    let centerColorText = d3
        .selectAll("#center-color")
        .style("fill", donutState.styles.fontColor)
        .style("max-width", `${calculateCenterTextSpace()}%`)
        .style("font-family", donutState.styles.fontFamily)
        .style("font-size", donutState.styles.fontSize);

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

    calculateMarkedCenterText(donutState.data);

    function calculateCenterTextSpace() {
        return calculatePercentageValue(radius, width, 0) < calculatePercentageValue(radius, height, 0)
            ? calculatePercentageValue(radius, width, 0)
            : calculatePercentageValue(radius, height, 0);
    }

    function calculateMarkedCenterText(data) {
        let centerTotal = 0;
        let markedSectors = [];

        if (data.length > 0 && data[0].centerSumFormatted === null) {
            return;
        } else if (data.length === 0) {
            return;
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i].markedRowCount() > 0) {
                // Extract the number from the formatted value string and convert it to a number
                let centerSumNumber = Number(data[i].centerSumFormatted.replace(/[^0-9,]/g, "").replace(",", "."));
                centerTotal += centerSumNumber;
                markedSectors.push(i);
            }
        }
        for (let i = 0; i < data.length; i++) {
            data[i].centerTotal = centerTotal;
        }
        if (markedSectors.length > 0) {
            centerText
                .text(
                    data[0].currencySymbol +
                        roundNumber(centerTotal, 2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                            .replace(".", ",") +
                        data[0].centerValueSumLastSymbol
                )
                .style("opacity", 1);
        }
        if (markedSectors.length === 1) {
            centerColorText.text(data[markedSectors[0]].colorValue).style("opacity", 1);
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
