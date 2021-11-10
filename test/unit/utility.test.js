import {
    checkIfRectanglesOverlap,
    calculateAngle,
    checkIfRectangleSidesIntersectLine,
    calculatePercentageValue,
    checkIfPointIsInsideCircle,
    checkIfRectangularIsInCircle,
    getOverlappingRectangle,
    getPointFromCircle,
    rectangularCircleColliding,
    roundNumber
} from "../../src/utility";

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

test("Check if a number is rounded by two decimals", () => {
    let testNumber = 3.456;
    let expectedCorrectNumber = 3.46;
    let expectedWrongNumber = 3;
    let decimals = 2;

    expect(roundNumber(testNumber, decimals)).not.toEqual(expectedWrongNumber);
    expect(roundNumber(testNumber, decimals)).toEqual(expectedCorrectNumber);
});

test("Check if rectangle and circle are colliding", () => {
    const rectangle = document.createElement("div");
    rectangle.getBoundingClientRect = jest.fn(() => ({
        left: 300,
        right: 460,
        top: 45,
        bottom: 100,
        height: 60,
        width: 160,
        x: 300,
        y: 45,
        toJSON: () => ""
    }));

    let donutCircle = { x: 515, y: 160, radius: 150, innerRadius: 75 };
    expect(rectangularCircleColliding(rectangle.getBoundingClientRect(), donutCircle)).toBeTruthy();
    donutCircle.radius = 50;
    donutCircle.innerRadius = 25;
    expect(rectangularCircleColliding(rectangle.getBoundingClientRect(), donutCircle)).toBeFalsy();
});
