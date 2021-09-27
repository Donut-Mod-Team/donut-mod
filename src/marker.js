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
 * @param {data} d
 */
export function unSelect(d) {
    // TODO: check if we can improve the logic for clear marking
    if (d.length > 0) {
        d[0].clearMarking();
    }
}

export function drawRectangularSelection(data) {
    function drawRectangle(x, y, w, h) {
        return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
    }
    let canvas = d3.select("#mod-container svg");
    const rectangle = canvas.append("path").attr("class", "rect").attr("visibility", "hidden");

    const startSelection = function (start) {
        rectangle.attr("d", drawRectangle(start[0], start[1], 0, 0)).attr("visibility", "visible");
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
            return unSelect(data);
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

    d3.select("#mod-container").on("mousedown", function () {
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
