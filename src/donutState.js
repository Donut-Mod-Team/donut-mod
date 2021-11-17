import { resources } from "./resources";
import { calculatePercentageValue, parseToNumber, roundNumber } from "./utility";

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
        // TODO clear DOM
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

    let totalYSum = calculateTotalYSum(colorLeaves, resources.yAxisName);
    let totalCenterSum =
        dataViewCenterAxis != null ? calculateTotalCenterSum(colorLeaves, resources.centerAxisName) : null;

    let data;
    try {
        data = colorLeaves.map((leaf) => {
            let rows = leaf.rows();
            let yValue = sumValue(rows, resources.yAxisName);
            let percentage = calculatePercentageValue(yValue, totalYSum, 1);
            let absPercentage = Math.abs(percentage).toFixed(1);
            // Get the formatted value from the api
            let formattedCenterValue =
                dataViewCenterAxis != null ? rows[0].continuous(resources.centerAxisName).formattedValue() : null;
            // Extract the currency symbol from the formatted value if any
            let currencySymbol =
                dataViewCenterAxis != null ? getCurrencySymbolContinuesAxis(rows, resources.centerAxisName) : "";
            // Extract last symbols from the formatting
            let lastSymbols = dataViewCenterAxis != null ? getLastCenterSymbols(rows, resources.centerAxisName) : "";
            return {
                color: rows.length ? rows[0].color().hexCode : "transparent",
                value: yValue,
                absValue: Math.abs(yValue),
                id: leaf.key,
                renderID: leaf.leafIndex,
                percentage: percentage.toFixed(1),
                absPercentage: absPercentage,
                centerSumFormatted: formattedCenterValue,
                currencySymbol: currencySymbol,
                centerValueSumLastSymbol: lastSymbols,
                colorValue: leaf.formattedValue(),
                totalCenterSumFormatted: currencySymbol + formatTotalSum(totalCenterSum) + lastSymbols,
                centerTotal: 0,
                getLabelText: (modProperty) =>
                    createLabelText(
                        modProperty,
                        absPercentage,
                        rows[0].continuous(resources.yAxisName).formattedValue(),
                        leaf.formattedValue()
                    ),
                mark: (m) => (m ? leaf.mark(m) : leaf.mark()),
                markedRowCount: () => leaf.markedRowCount(),
                tooltip: () => {
                    return rows.length ? rows[0] : "N/A";
                }
            };
        });
    } catch (error) {
        console.error(error);
    }

    /**
     * @typedef {donutState} donutState containing mod, dataView, size, data[], modControls, context
     */
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
 * Function rounds a given number to 2 decimals
 * @param {number} totalSum
 * @returns {string|Number} returns a rounded number or empty string if provided value is null
 */
function formatTotalSum(totalSum) {
    if (totalSum != null) {
        return roundNumber(totalSum, 2)
            .toLocaleString();
    }
    return "";
}

/***
 * Function returns the last symbols(after the numbers) if any from the formatted value of a continues axis
 * @param {Spotfire.DataViewRow[]} rows
 * @param {string} axisName
 * @returns {string} last symbol of formatted value/if any otherwise empty string
 */
function getLastCenterSymbols(rows, axisName) {
    let centerString = rows[0].continuous(axisName).formattedValue();
    let firstNumberIndex = centerString.search(/\d/);
    let centerValueSumLastSymbol = centerString.substr(firstNumberIndex);
    centerValueSumLastSymbol = centerValueSumLastSymbol.replace(/[\d.,\s]+/g, "");
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
function calculateTotalYSum(leaves, yAxisName) {
    let sumOfValues = 0;
    leaves.map((leaf) => {
        let rows = leaf.rows();
        let yValue = sumValue(rows, yAxisName);
        sumOfValues += yValue;
    });
    return sumOfValues;
}

/***
 * Function calculates the total center value for all leaves
 * @param {Spotfire.DataViewHierarchyNode[]} leaves
 * @param {string} centerAxisName
 * @returns {number} total sum of all the sectors
 */
function calculateTotalCenterSum(leaves, centerAxisName) {
    let sumOfValues = 0;
    leaves.map((leaf) => {
        let rows = leaf.rows();
        let centerSum = rows[0].continuous(centerAxisName).formattedValue()
        centerSum = centerSum.replace(/[^\d.,\s]+/g, "");
        // Extract the number from the formatted value string and convert it to a number
        let centerValue = parseToNumber(centerSum);
        sumOfValues += centerValue;
    });
    return sumOfValues;
}

/**
 * Returns the currency symbol for continues axis given a name
 * @param {Spotfire.DataViewRow[]} rows Rows to calculate the total value from
 * @param {string} axisName
 * @returns {string} currency symbol or empty string if not a currency
 */
function getCurrencySymbolContinuesAxis(rows, axisName) {
    let formattedCenterValue = rows[0].continuous(axisName).formattedValue();
    let firstNumberIndex = formattedCenterValue.search(/\d/);
    let currencySymbol = formattedCenterValue.substr(0, firstNumberIndex);
    return currencySymbol.replace(/[\s]+/, "");
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
    modProperty.labelsValue.value() && labelValues.push(sectorValue);
    modProperty.labelsCategory.value() && labelValues.push(sectorCategory);

    if (labelValues.length === 0) {
        return labelText;
    } else if (labelValues.length === 1) {
        labelText = labelValues[0];
        return labelText;
    } else {
        // The returned labelText follows the format of "Value, Category (Percentage), e.g.: "22, Large Cap (38.6)"
        labelText += labelValues[1];
        for (let i = 2; i < labelValues.length; i++) {
            labelText += ", " + labelValues[i];
        }
        labelText += " (" + labelValues[0] + ")";
    }
    return labelText;
}
