/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

import { render } from "./donutChart";

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

    reader.subscribe(onChange);

    /**
     * Initiate the read loop
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     */
    async function onChange(dataView, windowSize) {
        await render(dataView, windowSize, mod);
    }
});
