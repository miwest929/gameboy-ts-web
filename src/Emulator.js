import Raven from "raven-js";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Gameboy, Cartridge } from "gameboy-ts";

import FrameTimer from "./FrameTimer";
//import GamepadController from "./GamepadController";
//import KeyboardController from "./KeyboardController";
import Screen from "./Screen";
//import Speakers from "./Speakers";

/*
 * Runs the emulator.
 *
 * The only UI is a canvas element. It assumes it is a singleton in various ways
 * (binds to window, keyboard, speakers, etc).
 */
class Emulator extends Component {
  render() {
    return (
      <Screen
        ref={screen => {
          this.screen = screen;
        }}
        onGenerateFrame={() => {
          this.gb.frame();
        }}
        onMouseDown={(x, y) => {
          this.gb.zapperMove(x, y);
          this.gb.zapperFireDown();
        }}
        onMouseUp={() => {
          this.gb.zapperFireUp();
        }}
      />
    );
  }

  componentDidMount() {
    // Initial layout
    this.fitInParent();

    this.gb = new Gameboy(); //({
    //   onFrame: this.screen.setBuffer,
    //   onStatusUpdate: console.log,
    //   onAudioSample: this.speakers.writeSample,
    //   sampleRate: this.speakers.getSampleRate()
    // });
    const cart = new Cartridge(this.props.romData);
    await gameboy.loadCartridge(cart);

    // For debugging. (["nes"] instead of .nes to avoid VS Code type errors.)
    window["gb"] = this.gb;

    this.frameTimer = new FrameTimer({
      onGenerateFrame: Raven.wrap(this.gb.frame),
      onWriteFrame: Raven.wrap(this.screen.writeBuffer)
    });

    this.gb.loadROM(this.props.romData);
    this.start();
  }

  componentWillUnmount() {
    this.stop();
    window["gb"] = undefined;
  }

  componentDidUpdate(prevProps) {
    if (this.props.paused !== prevProps.paused) {
      if (this.props.paused) {
        this.stop();
      } else {
        this.start();
      }
    }

    // TODO: handle changing romData
  }

  start = () => {
    this.gb.powerOn();
    this.frameTimer.start();
    //this.speakers.start();
    // this.fpsInterval = setInterval(() => {
    //   console.log(`FPS: ${this.gb.getFPS()}`);
    // }, 1000);
  };

  stop = () => {
    //this.frameTimer.stop();
    //this.speakers.stop();
    //clearInterval(this.fpsInterval);
  };

  /*
   * Fill parent element with screen. Typically called if parent element changes size.
   */
  fitInParent() {
    this.screen.fitInParent();
  }
}

Emulator.propTypes = {
  paused: PropTypes.bool,
  romData: PropTypes.string.isRequired
};

export default Emulator;
