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
    roundNumber,
    formatTotalSum,
    checkIfRectanglesGoOutside
} from "../../src/utility";
import { resources } from "../../src/resources";

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
        y: 0
    }));

    secondRectangle.getBoundingClientRect = jest.fn(() => ({
        left: 40,
        right: 80,
        top: 40,
        bottom: 50,
        height: 0,
        width: 0,
        x: 0,
        y: 0
    }));

    thirdRectangle.getBoundingClientRect = jest.fn(() => ({
        left: 80,
        right: 90,
        top: 100,
        bottom: 120,
        height: 0,
        width: 0,
        x: 0,
        y: 0
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
        x: 50,
        y: 50,
        height: 60,
        width: 70
    }));

    let donutCircle = { x: 100, y: 100, radius: 100, innerRadius: 75 };
    expect(rectangularCircleColliding(rectangle.getBoundingClientRect(), donutCircle)).toBeTruthy();
    donutCircle.x = 300;
    donutCircle.y = 200;
    expect(rectangularCircleColliding(rectangle.getBoundingClientRect(), donutCircle)).toBeFalsy();
});

test("Check if a points is inside a circle", () => {
    let donutCircle = { x: 500, y: 150, radius: 150, innerRadius: 75 };
    let centerPoint = { x: donutCircle.x, y: donutCircle.y };
    let pointInside = { x: 550, y: 200 };
    let pointOutside = { x: 100, y: 200 };
    expect(checkIfPointIsInsideCircle(pointInside, centerPoint, donutCircle.radius)).toBeTruthy();
    expect(checkIfPointIsInsideCircle(pointOutside, centerPoint, donutCircle.radius)).toBeFalsy();
});

test("Check if rectangle is inside a circle", () => {
    let donutCircle = { x: 200, y: 150, radius: 150, innerRadius: 75 };
    const rectangleNotInsideCircle = document.createElement("div");
    rectangleNotInsideCircle.getBoundingClientRect = jest.fn(() => ({
        x: 300,
        y: 100,
        height: 50,
        width: 100
    }));
    const rectangleInsideCircle = document.createElement("div");
    rectangleInsideCircle.getBoundingClientRect = jest.fn(() => ({
        x: 200,
        y: 150,
        height: 50,
        width: 100
    }));

    expect(
        checkIfRectangularIsInCircle(rectangleNotInsideCircle.getBoundingClientRect(), donutCircle, donutCircle.radius)
    ).toBeFalsy();

    expect(
        checkIfRectangularIsInCircle(rectangleInsideCircle.getBoundingClientRect(), donutCircle, donutCircle.radius)
    ).toBeTruthy();
});

test("Check if correct overlapping rectangle is generated", () => {
    const firstRectangle = document.createElement("div");
    firstRectangle.getBoundingClientRect = jest.fn(() => ({
        x: 10,
        y: 10,
        height: 10,
        width: 10
    }));
    const secondRectangle = document.createElement("div");
    secondRectangle.getBoundingClientRect = jest.fn(() => ({
        x: 15,
        y: 10,
        height: 10,
        width: 10
    }));
    const overlappingRectangleExpected = document.createElement("div");
    overlappingRectangleExpected.getBoundingClientRect = jest.fn(() => ({
        x: 15,
        y: 10,
        height: 10,
        width: 5
    }));
    expect(
        getOverlappingRectangle(firstRectangle.getBoundingClientRect(), secondRectangle.getBoundingClientRect())
    ).toEqual(overlappingRectangleExpected.getBoundingClientRect());
});

test("Check if angle between 3 points is calculated correctly", () => {
    let firstPoint = { x: 10, y: 10 };
    let middlePoint = { x: 20, y: 10 };
    let secondPoint = { x: 30, y: 10 };

    expect(calculateAngle(middlePoint, secondPoint, firstPoint)).toEqual(Math.PI);
    firstPoint.x = 20;
    firstPoint.y = 5;
    expect(calculateAngle(middlePoint, secondPoint, firstPoint)).toEqual(Math.PI / 2);
    expect(calculateAngle(middlePoint, secondPoint, firstPoint)).not.toEqual(Math.PI);
    secondPoint.x = 15;
    secondPoint.y = 10;
    expect(calculateAngle(middlePoint, secondPoint, firstPoint)).toEqual(Math.PI + Math.PI / 2);
});

test("Check correctness of percentage calculations", () => {
    let value = 25;
    let total = 100;
    expect(calculatePercentageValue(value, total, 2)).toEqual(25.0);
    value = 23.2558;
    expect(calculatePercentageValue(value, total, 2)).toEqual(23.26);
});

test("Check if rectangle sides intersect line", () => {
    let line = { innerPoint: { x: 300, y: 400 }, outerPoint: { x: 200, y: 300 } };

    const rectangleDivIntersedcting = document.createElement("div");
    rectangleDivIntersedcting.getBoundingClientRect = jest.fn(() => ({
        x: 200,
        y: 350,
        height: 100,
        width: 75
    }));
    let rectangle = rectangleDivIntersedcting.getBoundingClientRect();
    let rectangleSides = [
        // Top side of the rectangle
        { x1: rectangle.x, y1: rectangle.y, x2: rectangle.x + rectangle.width, y2: rectangle.y },
        // Bottom side of the rectangle
        {
            x1: rectangle.x,
            y1: rectangle.y + rectangle.height,
            x2: rectangle.x + rectangle.width,
            y2: rectangle.y + rectangle.height
        },
        // Right side of the rectangle
        {
            x1: rectangle.x + rectangle.width,
            y1: rectangle.y,
            x2: rectangle.x + rectangle.width,
            y2: rectangle.y + rectangle.height
        },
        // Left side of the rectangle
        { x1: rectangle.x, y1: rectangle.y, x2: rectangle.x, y2: rectangle.y + rectangle.height }
    ];
    expect(checkIfRectangleSidesIntersectLine(line, rectangleSides).length === 2).toBeTruthy();
    line.outerPoint.x = 400;
    expect(checkIfRectangleSidesIntersectLine(line, rectangleSides).length === 0).toBeTruthy();
    line = { innerPoint: { x: 275, y: 350 }, outerPoint: { x: 200, y: 350 } };
    expect(checkIfRectangleSidesIntersectLine(line, rectangleSides).length === 0).toBeTruthy();
});

test("Check if a point of a circle is correct", () => {
    let donutCircle = { x: 200, y: 150, radius: 150, innerRadius: 75 };
    let angle = Math.PI;

    expect(getPointFromCircle({ x: donutCircle.x, y: donutCircle.y }, angle, donutCircle.radius)).toEqual({
        x: 200,
        y: 300
    });
});

test("Check if a number is formatted correctly", () => {
    expect(
        formatTotalSum("0.1", "", "%") === (10).toLocaleString(undefined, { minimumFractionDigits: 2 })
    ).toBeTruthy();
    expect(
        formatTotalSum("11000000.1", "", "M") ===
            (11).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
    ).toBeTruthy();
    expect(formatTotalSum("11000000000.1", "", "B") === (11).toLocaleString()).toBeTruthy();
    expect(formatTotalSum("11000000000000.1", "", "T") === (11).toLocaleString()).toBeTruthy();
    expect(formatTotalSum("21000.1", "", "K") === (21).toLocaleString()).toBeTruthy();
    expect(formatTotalSum("21000.111", "", "") === (21000.11).toLocaleString()).toBeTruthy();
    expect(
        formatTotalSum("21000", "", "") ===
            (21000).toLocaleString(undefined, {
                minimumFractionDigits: 2
            })
    ).toBeTruthy();
    expect(
        formatTotalSum(11000000000.1, "", resources.scientificSymbol) === (11000000000.1).toExponential(6)
    ).toBeTruthy();
    expect(formatTotalSum(null) === "").toBeTruthy();
    expect(formatTotalSum("-21000.111", "(", ")") === (21000.11).toLocaleString()).toBeTruthy();
    expect(formatTotalSum("-21000.111", "", "") === (-21000.11).toLocaleString()).toBeTruthy();
});

test("Check if a selected rectangle's bounds exceed the bounds of a second one", () => {
    const containerBoundingRectangle = document.createElement("div");
    const selectedRectangleInsideRightLimit = document.createElement("div");
    const selectedRectangleInsideLeftLimit = document.createElement("div");
    const selectedRectangleOutside = document.createElement("div");

    // Bounding rectangle used as the container
    containerBoundingRectangle.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        right: 480,
        top: 0,
        bottom: 240,
        height: 0,
        width: 0,
        x: 0,
        y: 0
    }));

    // Bounding rectangle inside the expected limits (right corner-case)
    selectedRectangleInsideRightLimit.getBoundingClientRect = jest.fn(() => ({
        left: 30,
        right: 473,
        top: 20,
        bottom: 40,
        height: 0,
        width: 0,
        x: 0,
        y: 0
    }));

    // Bounding rectangle inside the expected limits (left corner-case)
    selectedRectangleInsideLeftLimit.getBoundingClientRect = jest.fn(() => ({
        left: 7,
        right: 20,
        top: 20,
        bottom: 40,
        height: 0,
        width: 0,
        x: 0,
        y: 0
    }));

    // Bounding rectangle outside of the expected limits of the container
    selectedRectangleOutside.getBoundingClientRect = jest.fn(() => ({
        left: 450,
        right: 474,
        top: 50,
        bottom: 100,
        height: 0,
        width: 0,
        x: 0,
        y: 0
    }));

    expect(
        checkIfRectanglesGoOutside(
            selectedRectangleInsideRightLimit.getBoundingClientRect(),
            containerBoundingRectangle.getBoundingClientRect()
        )
    ).toBeFalsy();
    expect(
        checkIfRectanglesGoOutside(
            selectedRectangleInsideLeftLimit.getBoundingClientRect(),
            containerBoundingRectangle.getBoundingClientRect()
        )
    ).toBeFalsy();
    expect(
        checkIfRectanglesGoOutside(
            selectedRectangleOutside.getBoundingClientRect(),
            containerBoundingRectangle.getBoundingClientRect()
        )
    ).toBeTruthy();
});
