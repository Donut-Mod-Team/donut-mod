import * as d3 from "d3";

export function applyHoverEffect(pie, donutState, animationDuration) {
    const highlightArc = d3
        .arc()
        .innerRadius(donutState.donutCircle.innerRadius - 3.5)
        .outerRadius(donutState.donutCircle.radius + 4.5);

    let highlightedSectors = d3
        .select("g#highlight-sector")
        .attr("pointer-events", "none")
        .selectAll("path")
        .data(pie(donutState.data), (d) => {
            return d.data.id;
        });
    highlightedSectors
        .enter()
        .append("path")
        .attr("id", function (d) {
            return "hoverID_" + d.data.id;
        })
        .attr("d", function (d) {
            highlightArc.startAngle(d.startAngle - 0.03).endAngle(d.endAngle + 0.03);
            return highlightArc(d);
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor)
        .style("opacity", "0");

    highlightedSectors
        .transition()
        .duration(animationDuration)
        .attrTween("d", function (d) {
            return function () {
                highlightArc.startAngle(d.startAngle - 0.01).endAngle(d.endAngle + 0.01);
                return highlightArc(d);
            };
        })
        .attr("class", "line-hover")
        .attr("stroke", donutState.styles.fontColor);

    highlightedSectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();
}
