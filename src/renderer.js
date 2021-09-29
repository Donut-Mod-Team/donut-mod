import * as d3 from "d3";
import * as marker from "./marker";

/**
 * @param {donutState} donutState
 */
export async function render(donutState) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 10;
    // D3 animation duration used for svg shapes
    const animationDuration = 100;

    const width = donutState.size.width - sizeModifier;
    const height = donutState.size.height - sizeModifier;
    const radius = Math.min(width, height) / 2 - sizeModifier;
    let innerRadius = radius * 0.5;
    donutState.donutCircle.x = width / 2;
    donutState.donutCircle.y = height / 2;
    donutState.donutCircle.radius = radius;
    donutState.donutCircle.innerRadius = innerRadius;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3
        .arc()
        .padAngle(0.1 / donutState.data.length)
        .innerRadius(innerRadius)
        .outerRadius(radius);

    // Join new data
    const sectors = svg.selectAll("path").data(pie(donutState.data), (d) => {
        return d.data.id;
    });

    let newSectors = sectors
        .enter()
        .append("path")
        .on("click", function (d) {
            marker.select(d);
        })
        .on("mouseenter", function (d) {
            donutState.modControls.tooltip.show(d.data.tooltip());
        })
        .on("mouseleave", function () {
            donutState.modControls.tooltip.hide();
        })
        .attr("fill", () => "transparent");

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

    marker.drawRectangularSelection(donutState);

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    donutState.context.signalRenderComplete();
}
