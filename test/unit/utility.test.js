import { checkIfRectanglesOverlap } from "../../src/utility";

test("Check if two rectangles are overlapping", () => {
    const firstRectangle = document.createElement("div");
    const secondRectangle = document.createElement("div");
    const thirdRectangle = document.createElement("div");

    firstRectangle.getBoundingClientRect = jest.fn(() => ({
        left: 20,
        right: 60,
        top: 20,
        bottom: 90,
        height: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ""
    }));

    secondRectangle.getBoundingClientRect = jest.fn(() => ({
        left: 40,
        right: 80,
        top: 40,
        bottom: 50,
        height: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ""
    }));

    thirdRectangle.getBoundingClientRect = jest.fn(() => ({
        left: 80,
        right: 90,
        top: 100,
        bottom: 120,
        height: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ""
    }));

    expect(
        checkIfRectanglesOverlap(firstRectangle.getBoundingClientRect(), secondRectangle.getBoundingClientRect())
    ).toBeTruthy();
    expect(
        checkIfRectanglesOverlap(firstRectangle.getBoundingClientRect(), thirdRectangle.getBoundingClientRect())
    ).toBeFalsy();
});
