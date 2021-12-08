import { resources } from "./resources";
import { calculatePercentageValue, formatTotalSum } from "./utility";

/** Definition for the data included in the donutState.data array
 * @typedef {{
 *     color: string,
 *     value: number,
 *     absValue: number,
 *     id: string | null,
 *     renderID: string,
 *     percentage: number,
 *     absPercentage: number,
 *     centerSumFormatted: string,
 *     centerSum: number,
 *     centerValueFirstSymbols: string,
 *     centerValueSumLastSymbol: string,
 *     colorValue: Spotfire.DataViewCategoricalValue.formattedValue,
 *     totalCenterSumFormatted() : string,
 *     centerTotal: number,
 *     getLabelText(modProperty): string,
 *     mark(operation?: Spotfire.MarkingOperation) : void,
 *     markedRowCount(): Spotfire.DataViewHierarchyNode.markedRowCount,
 *     tooltip(): Spotfire.DataViewRow | string,
 * }} data
 */

/** Definition of the donutState object which is used to render the Donut Chart
 * @typedef {{
 *     data: data[],
 *     size: Spotfire.Size,
 *     dataView: Spotfire.DataView,
 *     modControls: Spotfire.Controls,
 *     donutCircle: {x: number, y: number, radius: number, innerRadius: number},
 *     context: Spotfire.RenderContext,
 *     centerExpression: string,
 *     clearMarking(): Spotfire.DataView.clearMarking,
 *     styles: {fontColor: string, fontFamily: string, fontWeight: string, fontSize: string, fontStyle: string, backgroundColor: string, lineStroke: string, tick: string}
 * }} donutState
 */

/**
 * Render the visualization
 * @param {Spotfire.Mod} mod API
 * @return {donutState}
 */
export async function createDonutState(mod) {
    /**
     * Initialize dataView, size, and context based on the mod API
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} size
     * @param {Spotfire.RenderContext} context
     */
    const dataView = await mod.visualization.data();
    const size = await mod.windowSize();
    const context = await mod.getRenderContext();

    /**
     * Check for any errors.
     */
    let errors = await dataView.getErrors();
    if (errors.length > 0) {
        mod.controls.errorOverlay.show(errors, resources.errorOverlayCategoryDataView);
        return;
    }

    mod.controls.errorOverlay.hide(resources.errorOverlayCategoryDataView);

    // Get the leaf nodes for the x hierarchy. We will iterate over them to
    // render the chart.
    let colorHierarchy = await dataView.hierarchy(resources.colorAxisName);
    if (colorHierarchy == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let colorRoot = await colorHierarchy.root();
    if (colorRoot == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let dataViewYAxis = await dataView.continuousAxis(resources.yAxisName);
    if (dataViewYAxis == null) {
        mod.controls.errorOverlay.show(resources.errorNoDataOnAxis(resources.yAxisName), resources.yAxisName);
        return;
    } else {
        mod.controls.errorOverlay.hide(resources.yAxisName);
    }

    let dataViewCenterAxis = await dataView.continuousAxis(resources.centerAxisName);

    // Hide tooltip
    mod.controls.tooltip.hide();

    let colorLeaves = colorRoot.leaves();
    if (colorLeaves.length === 0) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let centerAxis = await mod.visualization.axis(resources.centerAxisName);
    let yAxis = await mod.visualization.axis(resources.yAxisName);
    let colorAxis = await mod.visualization.axis(resources.colorAxisName);

    let totalYSum = calculateTotalSum(colorLeaves, resources.yAxisName);
    let totalCenterSum = dataViewCenterAxis != null ? calculateTotalSum(colorLeaves, resources.centerAxisName) : null;

    let data;
    try {
        data = colorLeaves.map((leaf) => {
            let rows = leaf.rows();
            if (rows.length === 0) {
                return;
            }
            let yValue = sumValue(rows, resources.yAxisName);
            let percentage = calculatePercentageValue(yValue, totalYSum, 1);
            let absPercentage = Math.abs(percentage).toFixed(1);
            // Extract the first symbols from the formatted value if any
            let firstSymbols =
                dataViewCenterAxis != null ? getFirstSymbolsContinuesAxis(rows, resources.centerAxisName) : "";
            let labelFirstSymbols = getFirstSymbolsContinuesAxis(rows, resources.yAxisName);
            let centerSum = dataViewCenterAxis != null ? sumValue(rows, resources.centerAxisName) : null;
            // Extract last symbols from the formatting
            let centerValueLastSymbols =
                dataViewCenterAxis != null ? getLastSymbolsContinuousAxis(rows, resources.centerAxisName) : "";
            let labelLastSymbols = getLastSymbolsContinuousAxis(rows, resources.yAxisName);
            let formattedCenterValue = "";
            // Assign a value to formattedCenterValue depending on whether scientific symbol was included
            if (centerValueLastSymbols === resources.scientificSymbol) {
                formattedCenterValue =
                    dataViewCenterAxis != null
                        ? firstSymbols +
                          formatTotalSum(
                              rows[0].continuous(resources.centerAxisName).value(),
                              firstSymbols,
                              centerValueLastSymbols
                          ) +
                          ""
                        : null;
            } else {
                formattedCenterValue =
                    dataViewCenterAxis != null
                        ? firstSymbols +
                          formatTotalSum(
                              rows[0].continuous(resources.centerAxisName).value(),
                              firstSymbols,
                              centerValueLastSymbols
                          ) +
                          centerValueLastSymbols
                        : null;
            }
            let tooltipFormattedCenterValue =
                centerAxis.parts.length !== 0
                    ? centerAxis.parts[0].displayName + ": " + formattedCenterValue + "\n"
                    : "";
            let tooltipLabelsLastSymbol = labelLastSymbols.includes(resources.scientificSymbol) ? "" : labelLastSymbols;
            let tooltipFormattedYValue =
                yAxis.parts.length !== 0
                    ? yAxis.parts[0].displayName +
                      ": " +
                   labelFirstSymbols + formatTotalSum(yValue, labelFirstSymbols,labelLastSymbols) + tooltipLabelsLastSymbol +
                      "\n"
                    : "";
            let tooltipFormattedColorValue =
                colorAxis.parts.length !== 0
                    ? colorAxis.parts[0].displayName + ": " + leaf.formattedValue() + "\n"
                    : "";
            return {
                color: rows.length ? rows[0].color().hexCode : "transparent",
                value: yValue,
                absValue: Math.abs(yValue),
                id: leaf.key,
                renderID: leaf.key !== null ? leaf.key.replace(/[^\w]/g, "") : "empty",
                percentage: percentage.toFixed(1),
                absPercentage: absPercentage,
                centerSumFormatted: formattedCenterValue,
                centerSum: centerSum,
                centerValueFirstSymbols: firstSymbols,
                centerValueSumLastSymbol: centerValueLastSymbols,
                colorValue: leaf.formattedValue(),
                totalCenterSumFormatted: () => {
                    if (centerValueLastSymbols === resources.scientificSymbol) {
                        return firstSymbols + formatTotalSum(totalCenterSum, firstSymbols, centerValueLastSymbols);
                    }
                    return (
                        firstSymbols +
                        formatTotalSum(totalCenterSum, firstSymbols, centerValueLastSymbols) +
                        centerValueLastSymbols
                    );
                },
                centerTotal: 0,
                getLabelText: (modProperty) => {
                    if (labelLastSymbols === resources.scientificSymbol) {
                        return createLabelText(
                            modProperty,
                            absPercentage,
                            labelFirstSymbols +
                                formatTotalSum(
                                    rows[0].continuous(resources.yAxisName).value(),
                                    labelFirstSymbols,
                                    labelLastSymbols
                                ),
                            leaf.formattedValue()
                        );
                    }
                    return createLabelText(
                        modProperty,
                        absPercentage,
                        labelFirstSymbols +
                            formatTotalSum(
                                rows[0].continuous(resources.yAxisName).value(),
                                labelFirstSymbols,
                                labelLastSymbols
                            ) +
                            labelLastSymbols,
                        leaf.formattedValue()
                    );
                },
                mark: (m) => (m ? leaf.mark(m) : leaf.mark()),
                markedRowCount: () => leaf.markedRowCount(),
                tooltip: () => {
                    return (
                        tooltipFormattedColorValue +
                        tooltipFormattedYValue +
                        "Ratio: " +
                        percentage +
                        "%" +
                        "\n" +
                        tooltipFormattedCenterValue
                    );
                }
            };
        });
    } catch (error) {
        console.error(error);
    }

    data = data.filter((d) => {
        if (d !== undefined && d.value !== 0) {
            return d;
        }
    });

    let donutState = {
        data: data,
        size: size,
        dataView: dataView,
        modControls: mod.controls,
        donutCircle: { x: 0, y: 0, radius: 0, innerRadius: 0 },
        context: context,
        centerExpression: centerAxis.parts[0] != null ? centerAxis.parts[0].displayName : "",
        clearMarking: () => dataView.clearMarking(),
        styles: {
            fontColor: context.styling.general.font.color,
            fontFamily:
                context.styling.general.font.fontFamily.indexOf(",") > -1
                    ? context.styling.general.font.fontFamily.split(",")[0]
                    : context.styling.general.font.fontFamily,
            fontWeight: context.styling.general.font.fontWeight,
            fontSize: context.styling.general.font.fontSize,
            fontStyle: context.styling.general.font.fontStyle,
            backgroundColor: context.styling.general.backgroundColor,
            lineStroke: context.styling.scales.line.stroke,
            tick: context.styling.scales.tick.stroke
        }
    };

    return donutState;
}

/***
 * Function returns the last symbols(after the numbers) if any from the formatted value of a continues axis
 * @param {Spotfire.DataViewRow[]} rows
 * @param {string} axisName
 * @returns {string} last symbol of formatted value/if any otherwise empty string
 */
function getLastSymbolsContinuousAxis(rows, axisName) {
    let centerString = rows[0].continuous(axisName).formattedValue();
    if (centerString.includes(resources.scientificSymbol)) {
        return resources.scientificSymbol;
    }
    if (!/\d/.test(centerString)) {
        return "";
    }
    let firstNumberIndex = centerString.search(/\d/);
    let centerValueSumLastSymbol = centerString.substr(firstNumberIndex);
    centerValueSumLastSymbol = centerValueSumLastSymbol.replace(/[\d.,]+/g, "");
    return centerValueSumLastSymbol;
}

/**
 * Calculate the total value for an axis from a set of rows. Null values are treated as 0.
 * @param {Spotfire.DataViewRow[]} rows Rows to calculate the total value from
 * @param {string} axis Name of Axis to use to calculate the value.
 */
function sumValue(rows, axis) {
    return rows.reduce((p, c) => +c.continuous(axis).value() + p, 0);
}

/** Function sums the values of each leaf in the data
 * @param {Spotfire.DataViewHierarchyNode[]} leaves
 * @param {string} yAxisName
 * @return {Number} sumOfValues
 * */
function calculateTotalSum(leaves, yAxisName) {
    let sumOfValues = 0;
    leaves.map((leaf) => {
        let rows = leaf.rows();
        let yValue = sumValue(rows, yAxisName);
        sumOfValues += yValue;
    });
    return sumOfValues;
}

/**
 * Returns the currency symbol for continues axis given a name
 * @param {Spotfire.DataViewRow[]} rows Rows to calculate the total value from
 * @param {string} axisName
 * @returns {string} currency symbol or empty string if not a currency
 */
function getFirstSymbolsContinuesAxis(rows, axisName) {
    let formattedCenterValue = rows[0].continuous(axisName).formattedValue();
    let firstNumberIndex = formattedCenterValue.search(/\d/);
    let currencySymbol = formattedCenterValue.substr(0, firstNumberIndex);
    return currencySymbol.replace(/[-]+/g, "");
}
/**
 * This function creates the sector's label text based on the provided modProperty
 * @param {modProperty} modProperty
 * @param {number} sectorPercentage
 * @param {string} sectorValue
 * @param {Spotfire.DataViewHierarchyNode.formattedValue} sectorCategory
 * @returns {string} labelText
 */
function createLabelText(modProperty, sectorPercentage, sectorValue, sectorCategory) {
    let labelValues = [];
    let labelText = "";
    // Assigning a value to the labelValue depending on the modProperty selected
    modProperty.labelsPercentage.value() && labelValues.push(sectorPercentage + "%");
    modProperty.labelsCategory.value() && labelValues.push(sectorCategory);
    modProperty.labelsValue.value() && labelValues.push(sectorValue);

    if (labelValues.length === 0) {
        return labelText;
    } else if (labelValues.length === 1) {
        labelText = labelValues[0];
        return labelText;
    } else {
        // The returned labelText follows the format of "Category, Value (Percentage), e.g.: "Large Cap, 22, (38.6%)"
        labelText += labelValues[1];
        for (let i = 2; i < labelValues.length; i++) {
            labelText += ", " + labelValues[i];
        }
        if (modProperty.labelsPercentage.value()) {
            labelText += " (" + labelValues[0] + ")";
        } else {
            labelText = labelValues[0] + ", " + labelText;
        }
    }
    return labelText;
}
