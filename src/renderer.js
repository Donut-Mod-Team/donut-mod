import * as d3 from "d3";
/**
 * @param {object} donutState
 */
export async function render(donutState) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 40;
    // D3 animation duration used for svg shapes
    const animationDuration = 200;

    const width = donutState.size.width - sizeModifier;
    const height = donutState.size.height - sizeModifier;
    const radius = Math.min(width, height) / 2 - sizeModifier;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.value);


    const arc = d3
        .arc()
        .padAngle(0.1 / donutState.data.length)
        .innerRadius(radius * 0.5)
        .outerRadius(radius);


    // Join new data
    const sectors = svg.select("g#sectors").selectAll("path").data(pie(donutState.data), (d) => {
        return d.data.id;
    });

    let newSectors = sectors
        .enter()
        .append("svg:path")
        .attr("class", "sector")
        .on("click", function (d) {
            d.data.mark();
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
        .attr("class", "sector")
        .transition()
        .duration(animationDuration)
        .attr("value", (d) => (d.data.value / donutState.sumOfValues * 100).toFixed(1))
        .attr("fill", (d) => d.data.color)
        .attrTween("d", tweenArc)
        .attr("stroke", "none");

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    svg.select("g#labels")
        .attr("pointer-events", "none")
        .selectAll("text")
        .data(pie(donutState.data), (d) => `label-${d.data.id}`)
        .join(
            (enter) => {
                return enter
                    .append("text")
                    .attr("fill", donutState.context.styling.general.font.color)
                    .style("opacity", 1)
                    .attr("dy", "0.35em")
                    .attr("font-size", donutState.context.styling.general.font.fontSize)
                    .attr("text-anchor", "middle")
                    .attr("overflow", "visible")
                    .text((d) => (d.data.value / donutState.sumOfValues * 100).toFixed(1) + "%")
                    .call((enter) =>
                        enter
                            .transition("add labels")
                            .duration(animationDuration)
                            .style("opacity", 1)
                            .attr("transform", calculateLabelPosition)
                    );
            },
            (update) =>
                update.call((update) =>
                    update
                        .transition("update labels")
                        .duration(animationDuration)
                        .style("opacity", 1)
                        .text((d) => (d.data.value / donutState.sumOfValues * 100).toFixed(1) + "%")
                        .attr("transform", calculateLabelPosition)
                        .attr("fill", donutState.context.styling.general.font.color)

                ),
            (exit) => exit.transition("remove labels").duration(animationDuration).style("opacity", 0).remove()

        );

    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        var i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    function calculateLabelPosition(data){
        let centeringFactor = radius * 0.75
        let c = arc.centroid(data)
        let x = c[0]
        let y = c[1]
        let h = Math.sqrt(x * x + y * y);
        console.log(h)
        return "translate(" + (x/h * centeringFactor) +  ',' + (y/h * centeringFactor) +  ")";

    }

    donutState.context.signalRenderComplete();
}
