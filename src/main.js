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
    const reader = mod.createReader(mod.visualization.data(), mod.windowSize());

    /** Flag to check if there was any error overlay messages printed during the previous execution,
     *  in order to skip redundant clear-related calls of the overlay.
     */
    let errorOverlayVisualized = false;

    /**
     * Initiate the read loop
     */
    reader.subscribe(async () => {
        let donutState = await createDonutState(mod);

        if (donutState != null) {
            if (errorOverlayVisualized) {
                mod.controls.errorOverlay.hide();
                errorOverlayVisualized = false;
            }
            render(donutState);
        } else {
            mod.controls.errorOverlay.show(resources.errorNullDonutState);
            errorOverlayVisualized = true;
        }

    });
});
