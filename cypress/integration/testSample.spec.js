import { render } from "../../src/renderer";

describe("My First Test", () => {
    let donutState = {
        data: [
            {
                color: "#6489FA",
                value: 304,
                absValue: 304,
                id: "MW",
                percentage: 27.5,
                absPercentage: 27.5
            },
            {
                color: "#FA7864",
                value: 245,
                absValue: 245,
                id: "NE",
                percentage: 22.2,
                absPercentage: 22.2
            },
            {
                color: "#FFDE5C",
                value: 341,
                absValue: 341,
                id: "SE",
                percentage: 30.9,
                absPercentage: 30.9
            },
            {
                color: "#72ECA6",
                value: 215,
                absValue: 215,
                id: "WE",
                percentage: 19.5,
                absPercentage: 19.5
            }
        ],
        size: {
            width: 686,
            height: 183
        },
        dataView: {},
        modControls: {
            contextMenu: {},
            tooltip: {},
            progress: {},
            popout: {
                components: {}
            },
            errorOverlay: {}
        },
        donutCircle: {
            x: 338,
            y: 86.5,
            radius: 76.5,
            innerRadius: 38.25
        },
        context: {
            signalRenderComplete: () => {},
            imagePixelRatio: 1,
            interactive: true,
            styling: {
                general: {
                    backgroundColor: "#FFFFFF",
                    font: {
                        fontFamily: '"Roboto",sans-serif',
                        fontSize: 12,
                        fontStyle: "Normal",
                        fontWeight: "Normal",
                        color: "#61646B"
                    }
                },
                scales: {
                    font: {
                        fontFamily: '"Roboto",sans-serif',
                        fontSize: 12,
                        fontStyle: "Normal",
                        fontWeight: "Normal",
                        color: "#61646B"
                    },
                    line: {
                        stroke: "#D1D4DE"
                    },
                    tick: {
                        stroke: "#D1D4DE"
                    }
                }
            },
            isEditing: true
        },
        styles: {
            fontColor: "#61646B",
            fontFamily: '"Roboto",sans-serif',
            fontWeight: "Normal",
            fontSize: 12
        }
    };
    it("Does not do much!", () => {
        cy.visit("http://127.0.0.1:8090");
        render(donutState);
        expect(true).to.equal(true);
    });
});
