/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

/**
 * Enum for all the LEDs on the Joysticks. Most buttons have two LEDs (Red and green) and by setting them individually
 * you can set three different colors.
 */
export enum LED {
    /** Red/Green LED of Fire button */
    FIRE = 1,

    /** Red LED of A button */
    A_RED = 2,

    /** Green LED of A button */
    A_GREEN = 3,

    /** Red LED of B button */
    B_RED = 4,

    /** Green LED of B button */
    B_GREEN = 5,

    /** Red LED of D button */
    D_RED = 6,

    /** Green LED of D button */
    D_GREEN = 7,

    /** Red LED of E button */
    E_RED = 8,

    /** Green LED of E button */
    E_GREEN = 9,

    /** Red LED of T1/T2 switch */
    T12_RED = 10,

    /** Green LED of T1/T2 switch */
    T12_GREEN = 11,

    /** Red LED of T3/T4 switch */
    T34_RED = 12,

    /** Green LED of T3/T4 switch */
    T34_GREEN = 13,

    /** Red LED of T5/T6 switch */
    T56_RED = 14,

    /** Green LED of T5/T6 switch */
    T56_GREEN = 15,

    /** Red LED of Coolie Hat */
    COOLIE_RED = 16,

    /** Green LED of Coolie Hat */
    COOLIE_GREEN = 17,

    /** Red LED of I button */
    I_RED = 18,

    /** Green LED of I button */
    I_GREEN = 19,

    /** Red/Green LED of throttle */
    THROTTLE = 20
}
