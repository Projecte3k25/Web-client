import { useEffect, useRef, useState } from "react";
import "./css/DiceRoller.css";

const DiceRoller = ({
  color = "#4A90E2",
  initialValue = null,
  rollingTrigger,
}) => {
  const diceRef = useRef(null);
  const platformRef = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initialValue == null) return;
    setResult(initialValue);
    dado(initialValue);
  }, [rollingTrigger]);

  const dado = (number) => {
    const platform = platformRef.current;
    const dice = diceRef.current;
    if (!platform || !dice || number == null) return;

    platform.classList.remove("stop");
    platform.classList.add("playing");

    setTimeout(() => {
      platform.classList.remove("playing");
      platform.classList.add("stop");

      let x = 0,
        y = 20,
        z = -20;
      switch (number) {
        case 2:
          x = -100;
          y = -150;
          z = 10;
          break;
        case 3:
          x = 0;
          y = -100;
          z = -10;
          break;
        case 4:
          x = 0;
          y = 100;
          z = -10;
          break;
        case 5:
          x = 80;
          y = 120;
          z = -10;
          break;
        case 6:
          x = 0;
          y = 200;
          z = 10;
          break;
        default:
          break;
      }

      dice.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
      platform.style.transform = "translate3d(0,0,0)";
    }, 1120);
  };

  return (
    <div id="ui_dado" style={{ "--dice-color": color }}>
      <div id="platform" ref={platformRef}>
        <div id="dice" ref={diceRef} onClick={dado}>
          {/* Caras */}
          <div className="side front">
            <div className="dot center"></div>
          </div>
          <div className="side front inner"></div>
          <div className="side top">
            <div className="dot dtop dleft"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side top inner"></div>
          <div className="side right">
            <div className="dot dtop dleft"></div>
            <div className="dot center"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side right inner"></div>
          <div className="side left">
            <div className="dot dtop dleft"></div>
            <div className="dot dtop dright"></div>
            <div className="dot dbottom dleft"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side left inner"></div>
          <div className="side bottom">
            <div className="dot center"></div>
            <div className="dot dtop dleft"></div>
            <div className="dot dtop dright"></div>
            <div className="dot dbottom dleft"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side bottom inner"></div>
          <div className="side back">
            <div className="dot dtop dleft"></div>
            <div className="dot dtop dright"></div>
            <div className="dot dbottom dleft"></div>
            <div className="dot dbottom dright"></div>
            <div className="dot center dleft"></div>
            <div className="dot center dright"></div>
          </div>
          <div className="side back inner"></div>
          <div className="side cover x"></div>
          <div className="side cover y"></div>
          <div className="side cover z"></div>
        </div>
      </div>
    </div>
  );
};

export default DiceRoller;
