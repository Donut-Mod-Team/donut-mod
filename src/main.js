/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { render } from "./renderer";
import { createDonutState } from "./donutState";
import { resources } from "./resources";

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
        mod.property("labelsVisible"),
        mod.property("labelsPercentage"),
        mod.property("labelsValue"),
        mod.property("labelsCategory")
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
            labelsVisible,
            labelsPercentage,
            labelsValue,
            labelsCategory
        ) => {
            let donutState = await createDonutState(mod);

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

            let modProperty = {
                labelsPosition: labelsPosition,
                sortedPlacement: sortedPlacement,
                labelsVisible: labelsVisible,
                labelsPercentage: labelsPercentage,
                labelsValue: labelsValue,
                labelsCategory: labelsCategory
            };
            try {
                await render(donutState, modProperty);
            } catch (error) {
                // TODO: Add checks depending on the type of error here (e.g. TypeError, RangeError etc)
                console.error(error);
                mod.controls.errorOverlay.show(resources.errorRendering, resources.errorOverlayCategoryGeneral);
                errorOverlayVisualized = true;
            }
        }
    );
});
