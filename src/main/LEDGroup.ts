/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Enum for an LED group. Each group has two LEDs (red and green) and can therefor show three different colors.
 */
export enum LEDGroup {
    /** A button */
    A = 2,

    /** B button */
    B = 4,

    /** D button */
    D = 6,

    /** E button*/
    E = 8,

    /** T1/T2 switch */
    T12 = 10,

    /** T3/T4 switch */
    T34 = 12,

    /** T5/T6 switch */
    T56 = 14,

    /** Coolie Hat */
    COOLIE = 16,

    /** I button */
    I = 18
}
