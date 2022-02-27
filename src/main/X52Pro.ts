/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { usb } from "usb";

import { CharTable } from "./CharTable";
import { LED } from "./LED";
import { LEDColor } from "./LEDColor";
import { LEDGroup } from "./LEDGroup";

/** The Saitek/Logitech USB vendor ID. */
const VENDOR_ID = 0x6a3;

/** The X52 Pro USB product ID. */
const PRODUCT_ID = 0x762;

/** The USB request number. */
const X52PRO_REQUEST = 0x91;

/** Request indices for clearing MFD lines. */
const REQUEST_CLEAR_MFD_LINE = [ 0xd9, 0xda, 0xdc ];

/** Request indices for writing MFD lines. */
const REQUEST_WRITE_MFD_LINE = [ 0xd1, 0xd2, 0xd4 ];

/** Request index for setting an LED state. */
const REQUEST_SET_LED = 0xb8;

/** Request index for setting the MFD brightness. */
const REQUEST_SET_MFD_BRIGHTNESS = 0xb1;

/** Request index for setting the LED brightness. */
const REQUEST_SET_LED_BRIGHTNESS = 0xb2;

/**
 * Checks if given USB device is an X52 Pro Joystick.
 *
 * @param usbDevice - The USB device to check.
 * @return True if X52 Pro, false if not.
 */
function isX52Pro(usbDevice: usb.Device): boolean {
    const dsc = usbDevice.deviceDescriptor;
    return dsc.idVendor === VENDOR_ID && dsc.idProduct === PRODUCT_ID;
}

/**
 * Class to control a single X52 Pro device.
 */
export class X52Pro {
    /** The USB device of the joystick. */
    private readonly usbDevice: usb.Device;

    /** True when USB device is currently open, false if not. */
    private opened = false;

    /**
     * Creates a new X52 Pro device object using the given USB device.
     *
     * @param usbDevice - The USB device of the joystick.
     */
    public constructor(usbDevice: usb.Device) {
        this.usbDevice = usbDevice;
    }

    /**
     * Returns all connected X52 Pro devices.
     *
     * @return The connected X52 pro devices. Empty array when no device was found.
     */
    public static getAll(): X52Pro[] {
        return usb.getDeviceList().filter(device => isX52Pro(device)).map(device => new X52Pro(device));
    }

    /**
     * Opens the device when not already open. This is called automatically by other methods if needed.
     */
    public open(): this {
        if (!this.opened) {
            this.usbDevice.open();
            this.opened = true;
        }
        return this;
    }

    /**
     * Closes the device. This is never done automatically. You should do manually this when you are finished with the
     * device.
     */
    public close(): this {
        if (this.opened) {
            this.usbDevice.close();
            this.opened = false;
        }
        return this;
    }

    /**
     * Checks if USB device of this joystick is currently open.
     *
     * @return True if device is open, false if not.
     */
    public isOpen(): boolean {
        return this.opened;
    }

    /**
     * Sends a USB control message to the device.
     *
     * @param index - The request index.
     * @param value - The request value.
     */
    private sendControlMessage(index: number, value: number): Promise<this> {
        return new Promise((resolve, reject) => {
            this.open();
            this.usbDevice.controlTransfer(
                usb.LIBUSB_REQUEST_TYPE_VENDOR | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_OUT,
                X52PRO_REQUEST,
                value,
                index,
                Buffer.alloc(0),
                error => {
                    if (error != null) {
                        reject(error);
                    } else {
                        resolve(this);
                    }
                }
            );
        });
    }

    /**
     * Sets an LED state.
     *
     * @param led   - The LED to modify.
     * @param state - True to enable the LED, false to disable it.
     */
    public setLED(led: LED, state: boolean): Promise<this> {
        return this.sendControlMessage(REQUEST_SET_LED, (led << 8) | (state ? 1 : 0));
    }

    /**
     * Sets the color of an LED group.
     *
     * @param ledGroup - The LED group to modify.
     * @param color    - The color to set.
     */
    public async setLEDGroup(ledGroup: LEDGroup, color: LEDColor): Promise<this> {
        await this.setLED(ledGroup as number as LED, (color & 1) !== 0);
        await this.setLED((ledGroup as number) + 1 as LED, (color & 2) !== 0);
        return this;
    }

    /**
     * Sets the brightness of all button LEDs.
     *
     * @param brightness - The brightness to set (0-255).
     */
    public async setLEDBrightness(brightness: number): Promise<this> {
        return this.sendControlMessage(REQUEST_SET_LED_BRIGHTNESS, Math.max(0, Math.min(255, brightness)));
    }

    /**
     * Sets the brightness of the MFD.
     *
     * @param brightness - The brightness to set (0-255).
     */
    public async setMFDBrightness(brightness: number): Promise<this> {
        return this.sendControlMessage(REQUEST_SET_MFD_BRIGHTNESS, Math.max(0, Math.min(255, brightness)));
    }

    /**
     * Sets a text on the MFD.
     *
     * @param line - The MFD line (0-2)
     * @param text - The text to display.
     */
    public async setMFDText(line: number, text: string): Promise<this> {
        const chars = Array.from(text.substring(0, 16)).map(char => {
            const index = CharTable.indexOf(char);
            return index < 0 ? "?".charCodeAt(0) : index;
        });
        if (line < 0 || line > 2) {
            throw new Error("MFD line must be 0-2 but is " + line);
        }
        await this.sendControlMessage(REQUEST_CLEAR_MFD_LINE[line], 0);
        for (let i = 0; i < Math.min(16, chars.length); i += 2) {
            await this.sendControlMessage(REQUEST_WRITE_MFD_LINE[line],
                chars[i] | (chars[i + 1] << 8));
        }
        return this;
    }
}
