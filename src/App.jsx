import "./App.scss";
import { useState, useEffect, useRef } from "react";

function App() {
  const [pomodoro, setPomodoro] = useState(0);
  const [shortBreak, setShortBreak] = useState(0);
  const [longBreak, setLongBreak] = useState(0);
  const [selectedColor, setSelectedColor] = useState("red");
  const [selectedFont, setSelectedFont] = useState("kumbah");
  const [appliedFont, setAppliedFont] = useState(selectedFont);
  const [appliedColor, setAppliedColor] = useState(selectedColor);
  const [showSetting, setShowSetting] = useState(false);
  const [selectTimer, setSelectTimer] = useState("pomo");

  const [timers, setTimers] = useState({
    pomo: {
      timeLeft: Number(pomodoro) * 60,
      hasStarted: false,
      isRunning: false,
    },
    short: {
      timeLeft: Number(shortBreak) * 60,
      hasStarted: false,
      isRunning: false,
    },
    long: {
      timeLeft: Number(longBreak) * 60,
      hasStarted: false,
      isRunning: false,
    },
  });
  const { timeLeft } = timers[selectTimer];

  const totalTime =
    selectTimer === "pomo"
      ? pomodoro * 60
      : selectTimer === "short"
      ? shortBreak * 60
      : longBreak * 60;

  const settingsRef = useRef(null);
  const percent =
    timers[selectTimer].timeLeft === 0 && timers[selectTimer].hasStarted
      ? 100
      : totalTime > 0
      ? (timeLeft / totalTime) * 100
      : 100;

  useEffect(() => {
    let interval;
    if (timers[selectTimer].isRunning && timers[selectTimer].timeLeft > 0) {
      interval = setInterval(() => {
        setTimers((prev) => {
          const current = prev[selectTimer];
          const newTime = current.timeLeft - 1;

          if (newTime <= 0) {
            clearInterval(interval);
            return {
              ...prev,
              [selectTimer]: {
                ...current,
                timeLeft: 0,
                isRunning: false,
                hasStarted: true,
              },
            };
          }

          return {
            ...prev,
            [selectTimer]: {
              ...current,
              timeLeft: newTime,
            },
          };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timers, selectTimer]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSetting(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStart = (minutes) => {
    setTimers((prev) => ({
      ...prev,
      [selectTimer]: {
        ...prev[selectTimer],
        timeLeft: timeLeft,
        hasStarted: true,
        isRunning: true,
      },
    }));
  };

  const handleReset = () => {
    setTimers((prev) => ({
      ...prev,
      [selectTimer]: {
        ...prev[selectTimer],
        timeLeft:
          selectTimer === "pomo"
            ? pomodoro * 60
            : selectTimer === "short"
            ? shortBreak * 60
            : longBreak * 60,
        isRunning: false,
        hasStarted: false,
      },
    }));
  };

  const handleRestart = (minutes) => {
    setTimers((prev) => ({
      ...prev,
      [selectTimer]: {
        ...prev[selectTimer],
        timeLeft: minutes * 60,
        isRunning: true,
        hasStarted: true,
      },
    }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleApply = () => {
    setAppliedFont(selectedFont);
    setAppliedColor(selectedColor);

    setTimers((prev) => ({
      ...prev,
      pomo: { ...prev.pomo, timeLeft: pomodoro * 60 },
      short: { ...prev.short, timeLeft: shortBreak * 60 },
      long: { ...prev.long, timeLeft: longBreak * 60 },
    }));

    setShowSetting(false);
  };
  return (
    <div
      className={`App ${appliedColor ? appliedColor : "red"}  ${
        appliedFont ? appliedFont : "kumbah"
      }`}
    >
      <header>
        <h2>
          <img src="/assets/logo.svg" alt="logo" />
        </h2>{" "}
        <ul>
          <li
            onClick={() => setSelectTimer("pomo")}
            className={selectTimer === "pomo" ? "active" : ""}
          >
            pomodoro
          </li>
          <li
            onClick={() => setSelectTimer("short")}
            className={selectTimer === "short" ? "active" : ""}
          >
            short break
          </li>
          <li
            onClick={() => setSelectTimer("long")}
            className={selectTimer === "long" ? "active" : ""}
          >
            long break
          </li>
        </ul>
      </header>
      <main>
        <div className="circleContainer">
          <div
            className="circle"
            style={{
              "--progress": percent ? percent : 100,
              transition: "all 0.5s ease",
            }}
          >
            <div className="svgWrapper">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 339 339"
                className="progressCircle"
              >
                <circle
                  className="bg"
                  cx="169.5"
                  cy="169.5"
                  r="155"
                  strokeWidth="11"
                />
                <circle
                  className="progress"
                  cx="169.5"
                  cy="169.5"
                  r="155"
                  strokeWidth="11"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 2 * Math.PI * 155,
                    strokeDashoffset:
                      ((100 - percent) / 100) * 2 * Math.PI * 155,
                  }}
                />
              </svg>
            </div>
            <div className="insideCircle">
              <button
                onClick={handleReset}
                className={`reset ${
                  timers[selectTimer].timeLeft > 0 &&
                  !timers[selectTimer].isRunning &&
                  timers[selectTimer].hasStarted
                    ? "showReset"
                    : "hideReset"
                }`}
              >
                Reset
              </button>
              <div className="innerText">
                {formatTime(timers[selectTimer].timeLeft)}
              </div>
              {!timers[selectTimer].isRunning &&
                !timers[selectTimer].hasStarted && (
                  <button
                    onClick={() => {
                      if (selectTimer === "pomo" && Number(pomodoro) > 0)
                        handleStart(Number(pomodoro));
                      else if (
                        selectTimer === "short" &&
                        Number(shortBreak) > 0
                      )
                        handleStart(Number(shortBreak));
                      else if (selectTimer === "long" && Number(longBreak) > 0)
                        handleStart(Number(longBreak));
                    }}
                    className={`start ${
                      !timers[selectTimer].isRunning &&
                      !timers[selectTimer].hasStarted
                        ? "showStart"
                        : "hideStart"
                    }`}
                  >
                    Start
                  </button>
                )}
              {!timers[selectTimer].isRunning &&
                timers[selectTimer].timeLeft === 0 &&
                timers[selectTimer].hasStarted && (
                  <button
                    onClick={() => {
                      if (selectTimer === "pomo" && Number(pomodoro) > 0)
                        handleRestart(Number(pomodoro));
                      else if (
                        selectTimer === "short" &&
                        Number(shortBreak) > 0
                      )
                        handleRestart(Number(shortBreak));
                      else if (selectTimer === "long" && Number(longBreak) > 0)
                        handleRestart(Number(longBreak));
                    }}
                    className={`restart ${
                      !timers[selectTimer].isRunning &&
                      timers[selectTimer].timeLeft === 0 &&
                      timers[selectTimer].hasStarted
                        ? "showRestart"
                        : "hideRestart"
                    }`}
                  >
                    Restart
                  </button>
                )}
              <button
                onClick={() =>
                  setTimers((prev) => ({
                    ...prev,
                    [selectTimer]: {
                      ...prev[selectTimer],
                      isRunning: !prev[selectTimer].isRunning,
                    },
                  }))
                }
                className={`resume ${
                  timers[selectTimer].timeLeft > 0 &&
                  timers[selectTimer].hasStarted
                    ? "showResume"
                    : "hideResume"
                }`}
              >
                {timers[selectTimer].isRunning ? "Pause" : "Resume"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <img
          src="/assets/icon-settings.svg"
          alt="settings"
          onClick={() => setShowSetting((prev) => !prev)}
          className={`${showSetting ? "hideImg" : "showImg"}`}
        />
        <div
          className={`overlay ${showSetting ? "showSetting" : "hideSetting"}`}
        >
          <section className="settingContainer" ref={settingsRef}>
            <div className="setting">
              <h2>Settings</h2>
              <img
                src="/assets/icon-close.svg"
                alt="close"
                onClick={() => setShowSetting((prev) => !prev)}
              />
            </div>
            <div className="options">
              <div className="timeContainer">
                <h3>TIME (MINUTES)</h3>
                <ul className="inputContainer">
                  <li>
                    <label htmlFor="pomodoro">
                      <p>pomodoro</p>
                      <div className="arrowContainer">
                        <input
                          type="number"
                          placeholder="0"
                          value={pomodoro === 0 ? "" : pomodoro}
                          onChange={(e) => setPomodoro(Number(e.target.value))}
                          id="pomodoro"
                        />{" "}
                        <div className="arrows">
                          <img
                            src="/assets/icon-arrow-up.svg"
                            alt="arroe up"
                            onClick={() =>
                              setPomodoro((prev) => (+prev || 0) + 1)
                            }
                          />
                          <img
                            src="/assets/icon-arrow-down.svg"
                            alt="arrow down"
                            onClick={() =>
                              setPomodoro((prev) =>
                                Math.max(0, (+prev || 0) - 1)
                              )
                            }
                          />
                        </div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <label htmlFor="short">
                      <p>short break</p>
                      <div className="arrowContainer">
                        <input
                          type="number"
                          placeholder="0"
                          value={shortBreak === 0 ? "" : shortBreak}
                          onChange={(e) =>
                            setShortBreak(Number(e.target.value))
                          }
                          id="short"
                        />{" "}
                        <div className="arrows">
                          <img
                            src="/assets/icon-arrow-up.svg"
                            alt="arroe up"
                            onClick={() =>
                              setShortBreak((prev) => (+prev || 0) + 1)
                            }
                          />
                          <img
                            src="/assets/icon-arrow-down.svg"
                            alt="arrow down"
                            onClick={() =>
                              setShortBreak((prev) =>
                                Math.max(0, (+prev || 0) - 1)
                              )
                            }
                          />
                        </div>
                      </div>
                    </label>
                  </li>
                  <li>
                    <label htmlFor="long">
                      <p>long break</p>
                      <div className="arrowContainer">
                        <input
                          type="number"
                          placeholder="0"
                          value={longBreak === 0 ? "" : longBreak}
                          onChange={(e) => setLongBreak(Number(e.target.value))}
                          id="long"
                        />{" "}
                        <div className="arrows">
                          <img
                            src="/assets/icon-arrow-up.svg"
                            alt="arroe up"
                            onClick={() =>
                              setLongBreak((prev) => (+prev || 0) + 1)
                            }
                          />
                          <img
                            src="/assets/icon-arrow-down.svg"
                            alt="arrow down"
                            onClick={() =>
                              setLongBreak((prev) =>
                                Math.max(0, (+prev || 0) - 1)
                              )
                            }
                          />
                        </div>
                      </div>
                    </label>
                  </li>
                </ul>
              </div>
              <div className="font">
                <h3>FONT</h3>
                <ul>
                  <li
                    onClick={() => setSelectedFont("kumbah")}
                    className={
                      selectedFont === "kumbah"
                        ? "active kumbahFont"
                        : "kumbahFont"
                    }
                  >
                    Aa
                  </li>
                  <li
                    onClick={() => setSelectedFont("Roboto")}
                    className={
                      selectedFont === "Roboto"
                        ? "active  roboFont"
                        : "roboFont"
                    }
                    style={{
                      fontFamily: "Roboto Slab",
                    }}
                  >
                    Aa
                  </li>
                  <li
                    onClick={() => setSelectedFont("Space")}
                    className={
                      selectedFont === "Space"
                        ? "active  spaceFont"
                        : "spaceFont"
                    }
                    style={{
                      fontFamily: "Space Mono",
                    }}
                  >
                    Aa
                  </li>
                </ul>
              </div>
              <div className="color">
                <h3>COLOR</h3>
                <ul>
                  <li
                    onClick={() => setSelectedColor("red")}
                    className={selectedColor === "red" ? "active red" : "red"}
                  >
                    <span
                      className={
                        selectedColor === "red" ? "checked" : "unChecked"
                      }
                    ></span>
                  </li>
                  <li
                    onClick={() => setSelectedColor("cyan")}
                    className={
                      selectedColor === "cyan" ? "active cyan" : "cyan"
                    }
                  >
                    <span
                      className={
                        selectedColor === "cyan" ? "checked" : "unChecked"
                      }
                    ></span>
                  </li>
                  <li
                    onClick={() => setSelectedColor("purple")}
                    className={
                      selectedColor === "purple" ? "active purple" : "purple"
                    }
                  >
                    <span
                      className={
                        selectedColor === "purple" ? "checked" : "unChecked"
                      }
                    ></span>
                  </li>
                </ul>
              </div>
            </div>
            <button onClick={handleApply} className="applyBtn">
              Apply
            </button>
          </section>
        </div>
      </footer>
    </div>
  );
}

export default App;
