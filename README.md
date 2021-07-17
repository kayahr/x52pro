x52pro
======

Node.js library for controlling the LEDs and MFD of a Logitech/Saitek X52 Pro Joystick.

**Currently this only works on Linux (and most-likely MacOS)**. On Windows the Joystick is occupied by a HID USB driver so
this library can't send control requests to it without replacing the driver with a special libusb-compatible driver
which then prevents the Joystick to be used in games. If someone knows a solution for this (Maybe it is possible to
send the control messages via [node-hid]?) then please let me know.

Usage
-----

Install the library as a dependency in your project:

```
npm install @kayahr/x52pro
```

And then use it like this:

```typescript
import { LED, LEDColor, LEDGroup, X52Pro } from "@kayahr/x52pro";

async function demo(): Promise<void> {
    const devices = X52Pro.getAll();
    const device = devices[0];
    await device.setLED(LED.FIRE, true);
    await device.setLEDGroup(LEDGroup.A, LEDColor.AMBER);
    await device.setLEDGroup(LEDGroup.B, LEDColor.RED);
    await device.setLEDGroup(LEDGroup.E, LEDColor.GREEN);
    await device.setLEDGroup(LEDGroup.I, LEDColor.OFF);
    await device.setLEDBrightness(100);
    await device.setMFDText(0, "Line 1");
    await device.setMFDText(1, "Line 2");
    await device.setMFDText(2, "Line 3");
    await device.setMFDBrightness(200);
    device.close();
}

void demo().then(() => process.exit(0));
```

The library uses the [USB Library for Node.JS] which asynchronously communicates with USB devices. That's why all calls to modify the X52 Pro state are asynchronous in the example above.

Also note that the example calls `process.exit()` at the end. This makes sure the application is terminated immediately. When you don't do this then the program is kept alive for a few seconds by the USB library.

Command-line usage
------------------

This project also comes with a command-line tool called `x52pro`. To use it install it globally like this:

```
npm install -g @kayahr/x52pro
```

Just run `x52pro` on your command line to get some usage help. Basically you specify any number of commands to set the various data.

Example:

```
x52pro fire=on a=red b=green d=amber e=off led-brightness=255 \
       mfd-brightness=100 mfd-text-1="Line Number One" \
       mfd-text-2="Line Number Two" mfd-text-3="Last Line"
```

[USB Library for Node.JS]: https://www.npmjs.com/package/usb
[node-hid]: https://www.npmjs.com/package/node-hid
