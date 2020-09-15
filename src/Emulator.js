import React, { Component } from "react";
import PropTypes from "prop-types";
import { Gameboy, Cartridge } from "gameboy-ts";
//import FrameTimer from "./FrameTimer";
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
    console.log(this.props.romData);
    const cart = new Cartridge('tetris', this.props.romData);
    await this.gb.loadCartridge(cart);
    // this.gb.loadROM(this.props.romData);

    // For debugging. (["nes"] instead of .nes to avoid VS Code type errors.)
    window["gb"] = this.gb;

    // this.frameTimer = new FrameTimer({
    //   onGenerateFrame: this.gb.frame,
    //   onWriteFrame: this.screen.writeBuffer
    // });

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
    await this.gb.executeNextFrame();
    debugger
    console.log("FRAME EXECUTED");
    // await this.gb.executeNextTick();
    // await this.gb.executeNextTick();
    // await this.gb.executeNextTick();
    //this.frameTimer.start();
  };

  stop = () => {
    // TODO: Implement
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