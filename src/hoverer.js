import * as d3 from "d3";

/**
 * Function is responsible for creating and applying hover effect on the donut-chart
 * @param {d3.pie} pie
 * @param {donutState} donutState
 * @param {number} animationDuration
 * */
export function applyHoverEffect(pie, donutState, animationDuration) {
    const angleOffset = 0.03;
    // Define the highlight arc for hovering
    const highlightArc = d3
        .arc()
        .innerRadius(donutState.donutCircle.innerRadius - 3.5)
        .outerRadius(donutState.donutCircle.radius + 4.5);

    // Define the sectors to be shown when hovering over
    let highlightedSectors = d3
        .select("g#highlight-sector")
        .attr("pointer-events", "none")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });
    // Create the sectors to be shown when hovering over with id's and set them as unseen
    highlightedSectors
        .enter()
        .append("path")
        .attr("id", function (d) {
            return "hoverID_" + d.data.renderID;
        })
        .attr("d", function (d) {
            highlightArc.startAngle(d.startAngle - angleOffset).endAngle(d.endAngle + angleOffset);
            return highlightArc(d);
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // define behaviour for transition
    highlightedSectors
        .transition()
        .duration(animationDuration)
        .attrTween("d", function (d) {
            return function () {
                highlightArc.startAngle(d.startAngle - angleOffset).endAngle(d.endAngle + angleOffset);
                return highlightArc(d);
            };
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("stroke-width", "1px");

    highlightedSectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();
}
