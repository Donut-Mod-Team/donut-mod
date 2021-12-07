/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { render } from "./renderer";
import { createDonutState } from "./donutState";
import { resources } from "./resources";
/**
 * @typedef {{
                labelsPosition: labelsPosition,
                sortedPlacement: sortedPlacement,
                sortedPlacementOrder: sortedPlacementOrder,
                labelsVisible: labelsVisible,
                labelsPercentage: labelsPercentage,
                labelsValue: labelsValue,
                labelsCategory: labelsCategory,
                circleType: circleType
            }} modProperty
 * */
/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
const Spotfire = window.Spotfire;

Spotfire.initialize(async (mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(
        mod.visualization.data(),
        mod.windowSize(),
        mod.property("labelsPosition"),
        mod.property("sortedPlacement"),
        mod.property("sortedPlacementOrder"),
        mod.property("labelsVisible"),
        mod.property("labelsPercentage"),
        mod.property("labelsValue"),
        mod.property("labelsCategory"),
        mod.property("circleType"),
        mod.visualization.axis(resources.centerAxisName)
    );

    /** Flag to check if there was any error overlay messages printed during the previous execution,
     *  in order to skip redundant clear-related calls of the overlay.
     */
    let errorOverlayVisualized = false;

    /**
     * Initiate the read loop
     */
    reader.subscribe(
        async (
            dataView,
            size,
            labelsPosition,
            sortedPlacement,
            sortedPlacementOrder,
            labelsVisible,
            labelsPercentage,
            labelsValue,
            labelsCategory,
            circleType
        ) => {
            let donutState = await createDonutState(mod);
            // let circleTypeChanged = reader.hasValueChanged(circleType);
            // let labelsPositionChanged = reader.hasValueChanged(labelsPosition);

            if (errorOverlayVisualized) {
                mod.controls.errorOverlay.hide(resources.errorOverlayCategoryGeneral);
                errorOverlayVisualized = false;
            }

            if (donutState == null) {
                console.error(resources.errorNullDonutState(donutState));
                mod.controls.errorOverlay.show(resources.errorGeneralOverlay, resources.errorOverlayCategoryGeneral);
                errorOverlayVisualized = true;
                return;
            }

            if (donutState.data.length === 0) {
                console.error(resources.errorNullDonutState(donutState));
                mod.controls.errorOverlay.show(resources.errorEmptyDataOnYAxis, resources.errorOverlayCategoryGeneral);
                errorOverlayVisualized = true;
                return;
            }

            let modProperty = {
                labelsPosition: labelsPosition,
                sortedPlacement: sortedPlacement,
                sortedPlacementOrder: sortedPlacementOrder,
                labelsVisible: labelsVisible,
                labelsPercentage: labelsPercentage,
                labelsValue: labelsValue,
                labelsCategory: labelsCategory,
                circleType: circleType
            };
            try {
                await render(donutState, modProperty);
            } catch (error) {
                console.error(error);
                mod.controls.errorOverlay.show(resources.errorRendering, resources.errorOverlayCategoryGeneral);
                errorOverlayVisualized = true;
            }
        }
    );
});
