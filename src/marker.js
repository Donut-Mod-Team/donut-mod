import * as d3 from "d3";

/**
 * Method for selecting a dataset
 * @param {data} d
 */
export function select(d) {
    event.ctrlKey ? d.data.mark("ToggleOrAdd") : d.data.mark();
}
/**
 * Method for clearing the selected dataView elements
 * @param {donutState} donutState
 */
export function unSelect(donutState) {
    return donutState.clearMarking()
}
/**
 * The function handles rectangle drag selection
 * @param {donutState} donutState
 */
export function drawRectangularSelection(donutState) {
    function drawRectangle(x, y, w, h) {
        return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
    }
    let canvas = d3.select("#mod-container svg");
    const rectangle = canvas.append("path").attr("class", "rectangle").attr("visibility", "hidden");

    const startSelection = function (start) {
        /* Here we change the colour to the Tibco-approved colour. (See the style property).
        The problem is that the colour returned is white. Change the colour in the css file
        if you want to see that the colour changes (remove style tag as well).*/
        rectangle.attr("d", drawRectangle(start[0], start[1], 0, 0)).attr("visibility", "visible", "red").style("fill", donutState.mod.getRenderContext().styling.general.font.color).style("stroke", donutState.mod.getRenderContext().styling.general.font.color);
    };

    const moveSelection = function (start, moved) {
        rectangle.attr("d", drawRectangle(start[0], start[1], moved[0] - start[0], moved[1] - start[1]));
    };

    const endSelection = async function (start, end) {
        rectangle.attr("visibility", "hidden");

        // Ignore rectangular markings that were just a click.
        if (Math.abs(start[0] - end[0]) < 2 || Math.abs(start[1] - end[1]) < 2) {
            if (d3.select(d3.event.target).node().nodeName === "path") {
                return;
            }
            return unSelect(donutState);
        }

        const selectionBox = rectangle.node().getBoundingClientRect();
        const svgRadarMarkedCircles = d3
            .select("#mod-container svg g")
            .selectAll("path")
            .filter(function () {
                const box = this.getBoundingClientRect();
                return !(
                    selectionBox.left >= box.right ||
                    selectionBox.top >= box.bottom ||
                    selectionBox.right <= box.left ||
                    selectionBox.bottom <= box.top
                );
            });

        if (svgRadarMarkedCircles.size() === 0) {
            return;
        }
        svgRadarMarkedCircles.each(select);
    };

    canvas.on("mousedown", function () {
        if (d3.event.which === 3 || d3.event.which === 2) {
            return;
        }
        let subject = d3.select(window),
            start = d3.mouse(this);
        startSelection(start);
        subject
            .on("mousemove.rectangle", function () {
                moveSelection(start, d3.mouse(canvas.node()));
            })
            .on("mouseup.rectangle", function () {
                endSelection(start, d3.mouse(canvas.node()));
                subject.on("mousemove.rectangle", null).on("mouseup.rectangle", null);
            });
    });
}
