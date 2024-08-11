import React, { useState, useEffect } from "react";
import "../styles/BackgroundComponent.css";

const StarBackground = ({ onBackgroundClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
  };

  useEffect(() => {
    if (isClicked) {
      // 애니메이션이 끝난 후 부모 컴포넌트의 클릭 이벤트 호출
      const timer = setTimeout(() => {
        onBackgroundClick(); // 부모에게 클릭 이벤트 전달
      }, 700); // 애니메이션 시간과 맞춰서 설정
      return () => clearTimeout(timer); // 클린업
    }
  }, [isClicked, onBackgroundClick]);

  return (
    <div
      className={`star-background ${isClicked ? "animate" : ""}`}
      onClick={handleClick}
    >
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      <div id="title">
        <span>CHECK OUT</span>
        <br />
        <span>CRYPTO'S TECHNICAL INDICATORS AT A GLANCE.</span>
      </div>
    </div>
  );
};

export default StarBackground;
