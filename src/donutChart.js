import * as d3 from "d3";
import * as marker from "./marker";
/**
 *
 * @param {Spotfire.Size} size
 * @param {any[]} data
 * @param {Spotfire.Mod} mod
 */
var markData = { marking: false, marked: [] };

function donutChart(size, data, mod) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 40;

    // D3 animation duration used for svg shapes
    const animationDuration = 100;
    const width = size.width - sizeModifier;
    const height = size.height - sizeModifier;
    const radius = Math.min(width, height) / 2 - sizeModifier;

    function setMarking(marking) {
        markData.marking = marking;
    }
    function clearMarkData() {
        markData.marked = [];
    }
    function addMarking(d) {
        markData.marked.push(d.id);
    }

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3
        .arc()
        .padAngle(0.1 / data.length)
        .innerRadius(radius * 0.5)
        .outerRadius(radius);

    // Join new data
    const sectors = svg.selectAll("path").data(pie(data), (d) => {
        return d.data.id;
    });

    let newSectors = sectors
        .enter()
        .append("path")
        .on("click", marker.select)
        .on("mouseenter", function (d) {
            console.log("here");
            if (markData.marking) {
                console.log("enter", markData.marking);
                console.log("data", d.data.id);
                addMarking(d.data);
                console.log("added", markData.marked);
            }
            mod.controls.tooltip.show(d.data.tooltip());
        })
        .on("mouseleave", function (d) {
            mod.controls.tooltip.hide();
        })
        .attr("fill", (d) => "transparent");

    findElement("#mod-container").onmousedown = (e) => {
        setMarking(true);
        console.log("down", markData.marking);
    };

    /*findElement("#mod-container").onmouseup = (e) => {
        if (markData.marked.length > 0) {
            for (let i = 0; i < markData.marked.length; i++) {
                data.forEach((d) => {
                    if (d.id === markData.marked[i]) {
                        console.log("Same", d);
                        d.mark();
                    }
                });
            }
        }
        clearMarkData();
        setMarking(false);
        console.log("up", markData.marking);
    };*/
    var div = document.getElementById("div"),
        x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0;
    function reCalc() {
        //This will restyle the div
        var x3 = Math.min(x1, x2); //Smaller X
        var x4 = Math.max(x1, x2); //Larger X
        var y3 = Math.min(y1, y2); //Smaller Y
        var y4 = Math.max(y1, y2); //Larger Y
        div.style.left = x3 + "px";
        div.style.top = y3 + "px";
        div.style.width = x4 - x3 + "px";
        div.style.height = y4 - y3 + "px";
    }
    onmousedown = function (e) {
        div.hidden = 0; //Unhide the div
        x1 = e.clientX; //Set the initial X
        y1 = e.clientY; //Set the initial Y
        reCalc();
    };
    onmousemove = function (e) {
        x2 = e.clientX; //Update the current position X
        y2 = e.clientY; //Update the current position Y
        reCalc();
    };
    onmouseup = function (e) {
        div.hidden = 1; //Hide the div
    };
    findElement("#mod-container").onmouseup = async (e) => {
        if (markData.marked.length > 0) {
            let foundData = [];
            for (let i = 0; i < markData.marked.length; i++) {
                let found = data.find((d) => {
                    return d.id === markData.marked[i];
                });
                console.log(found);
                if (found) {
                    console.log("Found");
                    foundData.push(found);
                }
            }
            console.log("Found: ", foundData.length, " Data: ", foundData);
            let dataView = await mod.visualization.data();
            dataView.mark(foundData, "ToggleOrAdd");
        }
        clearMarkData();
        setMarking(false);
        console.log("up", markData.marking);
    };

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
    const background = findElement("#mod-container svg");

    let data = colorLeaves.map((leaf) => {
        let rows = leaf.rows();
        return {
            color: rows.length ? rows[0].color().hexCode : "transparent",
            value: sumValue(rows, "Y"),
            id: leaf.key,
            mark: () => leaf.mark(),
            tooltip: () => {
                return leaf.formattedValue() + " " + sumValue(rows, "Y");
            }
        };
    });

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

function findElement(sector) {
    return document.querySelector(sector);
}
