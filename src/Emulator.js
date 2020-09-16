import React, { Component } from "react";
import PropTypes from "prop-types";
import { Gameboy, Cartridge } from "gameboy-ts";
import FrameTimer from "./FrameTimer";
import Screen from "./Screen";

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

  async componentDidMount() {
    // Initial layout
    this.fitInParent();

    this.gb = new Gameboy();
    const cart = new Cartridge('tetris', this.props.romData);
    await this.gb.loadCartridge(cart);

    // For debugging. (["nes"] instead of .nes to avoid VS Code type errors.)
    window["gb"] = this.gb;

    this.frameTimer = new FrameTimer({
      onGenerateFrame: async () => {
        const callId = Math.round(Math.random() * 3000);
        console.log(`[${callId}] invoking onGenerateFrame.`); 
        const t0 = performance.now();
        await this.gb.executeNextFrame();
        const t1 = performance.now();
        console.log(`[${callId}] generateFrame took ${t1 - t0} milliseconds.`);
      },
      onWriteFrame: () => {} //vthis.screen.writeBuffer
    });

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

  start = async () => {
    this.gb.powerOn();
    this.frameTimer.start();
  };

  stop = () => {
    this.frameTimer.stop();
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
  romData: PropTypes.object.isRequired
};

export default Emulator;