import * as d3 from "d3";
import * as marker from "./marker";
/**
 *
 * @param {Spotfire.Size} size
 * @param {any[]} data
 * @param {Spotfire.Mod} mod
 */
function donutChart(size, data, mod) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 10;

    // D3 animation duration used for svg shapes
    const animationDuration = 100;
    const width = size.width - sizeModifier;
    const height = size.height - sizeModifier;
    const radius = Math.min(width, height) / 2 - sizeModifier;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);
    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3
        .arc()
        .padAngle(0.1 / data.length)
        .innerRadius(radius * 0.6)
        .outerRadius(radius);

    // Join new data
    const sectors = svg.selectAll("path").data(pie(data), (d) => {
        return d.data.id;
    });

    let newSectors = sectors
        .enter()
        .append("path")
        .on("click", function (d) {
            marker.select(d);
            d3.event.stopPropagation();
        })
        .on("mouseenter", function (d) {
            mod.controls.tooltip.show(d.data.tooltip());
        })
        .on("mouseleave", function (d) {
            mod.controls.tooltip.hide();
        })
        .attr("fill", (d) => "transparent");
    sectors
        .merge(newSectors)
        .transition()
        .duration(animationDuration)
        .attr("fill", (d) => d.data.color)
        .attrTween("d", tweenArc)
        .attr("stroke", "none");

    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        var i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    marker.drawRectangularSelection(data);

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();
}

/**
 * Render the visualization
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} size
 * @param {Spotfire.Mod} mod API
 * @return data
 */
export async function render(dataView, size, mod) {
    /**
     * Initialize dataView, size, and context based on the mod API
     * @param {Spotfire.RenderContext} context
     */
    const context = await mod.getRenderContext();

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

    let dataViewYAxis = await dataView.continuousAxis("Y");
    if (dataViewYAxis == null) {
        mod.controls.errorOverlay.show("No data on y axis.", "y");
        return;
    } else {
        mod.controls.errorOverlay.hide("y");
    }

    // Hide tooltip
    mod.controls.tooltip.hide();

    let colorLeaves = colorRoot.leaves();

    let data = colorLeaves.map((leaf) => {
        let rows = leaf.rows();
        return {
            color: rows.length ? rows[0].color().hexCode : "transparent",
            value: sumValue(rows, "Y"),
            id: leaf.key,
            mark: (m) => (m ? leaf.mark(m) : leaf.mark()),
            clearMarking: () => dataView.clearMarking(),
            tooltip: () => {
                return leaf.formattedValue() + " " + sumValue(rows, "Y");
            }
        };
    });
    let DonutChart = {
        data: [],
        dataView: dataView,
        size: size,
        clearMarking: () => dataView.clearMarking()
    };

    donutChart(size, data, mod);

    context.signalRenderComplete();
}

/**
 * Calculate the total value for an axis from a set of rows. Null values are treated a 0.
 * @param {Spotfire.DataViewRow[]} rows Rows to calculate the total value from
 * @param {string} axis Name of Axis to use to calculate the value.
 */
function sumValue(rows, axis) {
    return rows.reduce((p, c) => +c.continuous(axis).value() + p, 0);
}
