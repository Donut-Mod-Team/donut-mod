import { render } from "../../src/renderer";

describe("My First Test", () => {
    let donutState = {
        data: [
            {
                color: "#6489FA",
                value: 304,
                absValue: 304,
                id: "MW",
                renderID: 0,
                percentage: "27.5",
                absPercentage: "27.5",
                centerSum: -26494.819981000008,
                colorValue: "MW",
                centerTotal: 0,
                markedRowCount: () => 0
            },
            {
                color: "#FA7864",
                value: 245,
                absValue: 245,
                id: "NE",
                renderID: 1,
                percentage: "22.2",
                absPercentage: "22.2",
                centerSum: -18724.86127800002,
                colorValue: "NE",
                centerTotal: 0,
                markedRowCount: () => 0
            },
            {
                color: "#FFDE5C",
                value: 341,
                absValue: 341,
                id: "SE",
                renderID: 2,
                percentage: "30.9",
                absPercentage: "30.9",
                centerSum: -30099.131803999993,
                colorValue: "SE",
                centerTotal: 0,
                markedRowCount: () => 0
            },
            {
                color: "#72ECA6",
                value: 215,
                absValue: 215,
                id: "WE",
                renderID: 3,
                percentage: "19.5",
                absPercentage: "19.5",
                centerSum: -25642.30973000003,
                colorValue: "WE",
                centerTotal: 0,
                markedRowCount: () => 0
            }
        ],
        size: {
            width: 253,
            height: 232
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
            x: 121.5,
            y: 111,
            radius: 101,
            innerRadius: 50.5
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
            fontFamily: '"Roboto"',
            fontWeight: "Normal",
            fontSize: 12,
            fontStyle: "Normal",
            backgroundColor: "#FFFFFF",
            lineStroke: "#D1D4DE",
            tick: "#D1D4DE"
        }
    };

    let modProperty = {
        labelsPosition: {
            name: "labelsPosition"
        },
        sortedPlacement: {
            name: "sortedPlacement",
            value: () => true
        },
        sortedPlacementOrder: {
            name: "sortedPlacementOrder",
            value: () => "ascending"
        },
        labelsVisible: {
            name: "labelsVisible",
            value: () => true
        },
        labelsPercentage: {
            name: "labelsPercentage"
        },
        labelsValue: {
            name: "labelsValue"
        },
        labelsCategory: {
            name: "labelsCategory"
        }
    };

    before(() => {
        cy.visit("http://127.0.0.1:8090");
    });

    it("Does not do much!", () => {
        cy.window().then((window) => {
            cy.get("#svg").should(() => {
                render(donutState, modProperty);
                expect(true).to.equal(true);
            });
        });
    });
});
