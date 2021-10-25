import * as d3 from "d3";

export function initializePopout(popout, tooltip, animationDuration, modProperty) {
    const modContainer = d3.select("#mod-container");

    // Settings icon svg
    const settingsIcon = modContainer.select("#settings-icon").style("opacity", "0");

    settingsIcon
        .append("path")
        .attr(
            "d",
            "M13.621,5.904l-1.036-0.259c-0.168-0.042-0.303-0.168-0.356-0.332c-0.091-0.284-0.205-0.559-0.339-0.82 c-0.079-0.154-0.072-0.337,0.017-0.486l0.55-0.915c0.118-0.197,0.087-0.449-0.075-0.611l-0.863-0.863 c-0.163-0.162-0.414-0.193-0.611-0.075L9.992,2.092C9.844,2.181,9.66,2.188,9.506,2.109C9.244,1.975,8.97,1.861,8.686,1.77 C8.521,1.717,8.395,1.583,8.353,1.415L8.094,0.379C8.039,0.156,7.839,0,7.609,0H6.39C6.161,0,5.961,0.156,5.905,0.379L5.647,1.415 C5.605,1.582,5.479,1.717,5.314,1.77C5.029,1.861,4.755,1.975,4.493,2.109C4.339,2.188,4.155,2.182,4.007,2.093L3.092,1.544 C2.895,1.426,2.644,1.457,2.481,1.619L1.619,2.481C1.457,2.644,1.426,2.895,1.544,3.092l0.549,0.915 c0.089,0.148,0.095,0.332,0.017,0.486C1.975,4.755,1.861,5.029,1.77,5.314c-0.053,0.165-0.188,0.29-0.355,0.332L0.379,5.905 C0.156,5.961,0.001,6.161,0.001,6.39L0,7.609c0,0.229,0.156,0.43,0.378,0.485l1.036,0.259C1.583,8.396,1.717,8.521,1.77,8.686 c0.091,0.285,0.205,0.559,0.339,0.821c0.079,0.154,0.073,0.337-0.016,0.486l-0.549,0.915c-0.118,0.196-0.087,0.448,0.075,0.61 l0.862,0.863c0.163,0.163,0.415,0.193,0.611,0.075l0.915-0.549c0.148-0.089,0.332-0.095,0.486-0.017 c0.262,0.134,0.537,0.248,0.821,0.339c0.165,0.053,0.291,0.187,0.333,0.355l0.259,1.036C5.961,13.844,6.16,14,6.39,14h1.22 c0.23,0,0.429-0.156,0.485-0.379l0.259-1.036c0.042-0.167,0.168-0.302,0.333-0.355c0.285-0.091,0.559-0.205,0.821-0.339 c0.154-0.079,0.338-0.072,0.486,0.017l0.915,0.549c0.197,0.118,0.448,0.088,0.611-0.075l0.863-0.863 c0.162-0.162,0.193-0.414,0.075-0.611l-0.549-0.915c-0.089-0.148-0.095-0.332-0.017-0.486c0.134-0.262,0.248-0.536,0.339-0.82 c0.053-0.165,0.188-0.291,0.356-0.333l1.036-0.259C13.844,8.039,14,7.839,14,7.609V6.39C14,6.16,13.844,5.96,13.621,5.904z M7,9.5 C5.619,9.5,4.5,8.381,4.5,7c0-1.381,1.119-2.5,2.5-2.5S9.5,5.619,9.5,7C9.5,8.381,8.381,9.5,7,9.5z"
        );

    settingsIcon.node().onclick = (e) => {
        tooltip.hide();
        popout.show(
            {
                x: e.x,
                y: e.y,
                alignment: "Top",
                autoClose: true,
                onChange: (event) => {
                    const { name, value } = event;
                    name === modProperty.labelsPosition.name && modProperty.labelsPosition.set(value);
                    name === modProperty.sortedPlacement.name && modProperty.sortedPlacement.set(value);
                    name === modProperty.labelsVisible.name && modProperty.labelsVisible.set(value);
                    name === modProperty.labelsPercentage.name && modProperty.labelsPercentage.set(value);
                    name === modProperty.labelsValue.name && modProperty.labelsValue.set(value);
                    name === modProperty.labelsCategory.name && modProperty.labelsCategory.set(value);
                }
            },
            settingsPopout
        );
    };
    const { radioButton, checkbox } = popout.components;
    const { section } = popout;

    const settingsPopout = () => [
        section({
            heading: "Show labels for",
            children: [
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: "All",
                    value: "all",
                    checked: modProperty.labelsVisible.value() === "all"
                }),
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: "Marked rows",
                    value: "marked",
                    checked: modProperty.labelsVisible.value() === "marked"
                }),
                radioButton({
                    name: modProperty.labelsVisible.name,
                    text: "None",
                    value: "none",
                    checked: modProperty.labelsVisible.value() === "none"
                })
            ]
        }),
        section({
            heading: "Show in labels",
            children: [
                checkbox({
                    name: modProperty.labelsPercentage.name,
                    text: "Sector percentage",
                    enabled: true,
                    tooltip: "Shows sector percentage",
                    checked: modProperty.labelsPercentage.value() === true
                }),
                checkbox({
                    name: modProperty.labelsValue.name,
                    text: "Sector value",
                    enabled: true,
                    tooltip: "Shows sector value",
                    checked: modProperty.labelsValue.value() === true
                }),
                checkbox({
                    name: modProperty.labelsCategory.name,
                    text: "Sector category",
                    enabled: true,
                    tooltip: "Shows sector category",
                    checked: modProperty.labelsCategory.value() === true
                })
            ]
        }),
        section({
            heading: "Labels position",
            children: [
                radioButton({
                    name: modProperty.labelsPosition.name,
                    text: "Inside chart",
                    value: "inside",
                    checked: modProperty.labelsPosition.value() === "inside"
                }),
                radioButton({
                    name: modProperty.labelsPosition.name,
                    text: "Outside chart",
                    value: "outside",
                    checked: modProperty.labelsPosition.value() === "outside"
                })
            ]
        }),
        section({
            heading: "Sorting",
            children: [
                checkbox({
                    name: "sortedPlacement",
                    text: "Sort sectors by size",
                    enabled: true,
                    tooltip: "Biggest sizes placed at the top",
                    checked: modProperty.sortedPlacement.value() === true
                })
            ]
        })
    ];
    settingsIcon.transition("add labels").duration(animationDuration).style("opacity", "1");

    settingsIcon.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    modContainer
        .on("mouseover", function () {
            console.log("Here");
            settingsIcon.style("opacity", "1");
        })
        .on("mouseleave", function () {
            settingsIcon.style("opacity", "0");
        });

    return settingsIcon;
}