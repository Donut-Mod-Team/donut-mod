import { roundNumber } from "./utility";

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
    const yAxisName = "Sector size by:";

    /**
     * Check for any errors.
     */
    let errors = await dataView.getErrors();
    if (errors.length > 0) {
        mod.controls.errorOverlay.show(errors, "dataView");
        // TODO clear DOM
        return;
    }

    mod.controls.errorOverlay.hide("dataView");

    // Get the leaf nodes for the x hierarchy. We will iterate over them to
    // render the chart.
    let colorHierarchy = await dataView.hierarchy("Color");
    let colorRoot = await colorHierarchy.root();
    if (colorRoot == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let dataViewYAxis = await dataView.continuousAxis(yAxisName);
    if (dataViewYAxis == null) {
        mod.controls.errorOverlay.show("No data on y axis.", yAxisName);
        return;
    } else {
        mod.controls.errorOverlay.hide(yAxisName);
    }

    // Awaiting and retrieving the Color and Y axis from the mod.
    let yAxis = await mod.visualization.axis(yAxisName);
    const colorAxisMeta = await mod.visualization.axis("Color");

    // Hide tooltip
    mod.controls.tooltip.hide();

    let colorLeaves = colorRoot.leaves();

    let totalYSum = calculateTotalYSum(colorLeaves, yAxisName);
    let data = colorLeaves.map((leaf) => {
        let rows = leaf.rows();
        let yValue = sumValue(rows, yAxisName);
        let percentage = calculatePercentageValue(yValue, totalYSum);
        return {
            color: rows.length ? rows[0].color().hexCode : "transparent",
            value: yValue,
            absValue: Math.abs(yValue),
            id: leaf.key,
            percentage: percentage,
            absPercentage: Math.abs(percentage),
            mark: (m) => (m ? leaf.mark(m) : leaf.mark()),
            tooltip: () => {
                /* Adding the display name from the colorAxis and yAxis to the tooltip,
                to get the corresponding leaf data onto the tooltip. */
                return (
                    "Ratio: " +
                    percentage +
                    "%" +
                    "\n" +
                    yAxis.parts[0].displayName +
                    ": " +
                    roundNumber(yValue, 2) +
                    "\n" +
                    colorAxisMeta.parts[0].displayName +
                    ": " +
                    leaf.formattedValue() +
                    "\n"
                );
            }
        };
    });
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
        clearMarking: () => dataView.clearMarking(),
        styles: {
            fontColor: context.styling.general.font.color,
            fontFamily: context.styling.general.font.fontFamily,
            fontWeight: context.styling.general.font.fontWeight,
            fontSize: context.styling.general.font.fontSize
        }
    };

    return donutState;
}

/**
 * Calculate the total value for an axis from a set of rows. Null values are treated a 0.
 * @param {Spotfire.DataViewRow[]} rows Rows to calculate the total value from
 * @param {string} axis Name of Axis to use to calculate the value.
 */
function sumValue(rows, axis) {
    return rows.reduce((p, c) => +c.continuous(axis).value() + p, 0);
}

/** Function sums the values of each leaf in the data
 * @param {leaves} leaves
 * @param {string} yAxisName
 * @return {Number} sumOfValues
 * */
function calculateTotalYSum(leaves, yAxisName) {
    let sumOfValues = 0;
    leaves.map((leaf) => {
        let rows = leaf.rows();
        let yValue = sumValue(rows, yAxisName);
        sumOfValues += Math.abs(yValue);
    });
    return sumOfValues;
}

/** Function calculates the percentage value of two given params
 * @param {Number} value
 * @param {Number} totalYSum
 * @return {Number}
 */
function calculatePercentageValue(value, totalYSum) {
    return roundNumber((value / totalYSum) * 100, 1);
}
