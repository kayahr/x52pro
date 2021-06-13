/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { LED } from "./LED";
import { LEDColor } from "./LEDColor";
import { LEDGroup } from "./LEDGroup";
import { X52Pro } from "./X52Pro";

/** Help text printed when no command is given. */
const HELP = `Syntax: x52pro COMMAND [COMMAND...]
Available commands:
  dev=<n> - Switches to given device index in case you have multiple
            X52 Pro Joysticks. Defaults to first device (dev=1)

  <led>=on|off - Enables/Disables the given LED.
                 Example: fire=on
                 LED names:
                   fire, a-red, a-green, b-red, b-green, d-red, d-green,
                   e-red, e-green, t12-red, t12-green, t34-red, t34-green,
                   t56-red, t56-green, coolie-red, coolie-green,
                   i-red, i-green

  <led-group>=<color> - Sets the color of the given LED group.
                        Example: coolie=amber
                        Available colors: off, red, green, amber
                        LED group names:
                          a, b, d, e, t12, t34, t56, coolie, i

  led-brightness=<n> - Sets the LED brightness (0-255)
                       Example: led-brightness=200

  mfd-brightness=<n> - Sets the MFD-brightness (0-255)
                       Example: mfd-brightness=255

  mfd-text-<line>=<text> - Sets the MFD text for a specific line (1-3). Text
                           can have up to 16 characters. When text contains
                           white spaces then put it in quotes.
                           Example: mfd-text-2="Hello world!"
`;

(async () => {
    // Get command-line arguments
    const args = process.argv.slice(2);

    // If no command is given then print help text and exit with error code 2
    if (args.length === 0) {
        console.log(HELP);
        process.exit(2);
    }

    // Start with first device and bail out if none found
    const devices = X52Pro.getAll();
    let device = devices[0];
    if (device == null) {
        throw new Error("No X52Pro device found");
    }

    // Process commands
    for (const arg of args) {
        const [ command, value ] = arg.split("=", 2);
        if (command === "dev") {
            const index = (+value) - 1;
            device.close();
            device = devices[index];
            if (device == null) {
                throw new Error(`X52Pro device #${value} not found`);
            }
        } else if (command === "led-brightness") {
            await device.setLEDBrightness(+value);
        } else if (command === "mfd-brightness") {
            await device.setMFDBrightness(+value);
        } else if (/^mfd-text-[123]$/.exec(command) != null) {
            await device.setMFDText(+command.substr(9) - 1, value);
        } else {
            const name = command.toUpperCase().replace(/-/g, "_");
            if (name in LED) {
                const led = LED[name as keyof typeof LED];
                if (value !== "on" && value !== "off") {
                    throw new Error("Invalid LED state (must be 'on' or 'off'): " + value);
                }
                await device.setLED(led, value === "on");
            } else if (name in LEDGroup) {
                const ledGroup = LEDGroup[name as keyof typeof LEDGroup];
                const color = LEDColor[value.toUpperCase() as keyof typeof LEDColor];
                if (color == null) {
                    throw new Error("Invalid LED group color (Must be 'off', 'red', 'green' or 'yellow'): " + value);
                }
                await device.setLEDGroup(ledGroup, color);
            } else {
                throw new Error("Unknown command: " + command);
            }
        }
    }

    // Close last active device and exit with error code 0
    device.close();
    process.exit(0);
})().catch(error => {
    // Print error and exit with error code 1
    console.error("" + error);
    process.exit(1);
});
