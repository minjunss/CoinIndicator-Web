import React, { useState, useEffect } from "react";
import { useUser } from "../components/UserContext";
import "../styles/Graph.css"; // CSS 파일 임포트
import { BASE_URL, ENDPOINTS } from "../api/api";

const Graph = ({ isVisible, data, onHide, onFavoriteToggle, isFavorite }) => {
  const [isMax, setIsMax] = useState(true);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [hoveredValue, setHoveredValue] = useState("");
  const [hoveredInterval, setHoveredInterval] = useState("");
  const { userInfo, setUserInfo } = useUser(); // Context에서 userInfo 가져오기

  useEffect(() => {
    if (isVisible) {
      setIsGraphVisible(true);
    }
  }, [isVisible]);

  const handleClick = () => {
    setIsMax(!isMax);
  };

  const handleMouseEnter = (indicator) => {
    setHoveredValue(indicator.value);
    setHoveredInterval(indicator.interval);
  };

  const handleMouseLeave = () => {
    setHoveredValue("");
    setHoveredInterval("");
  };

  const handleFavoriteToggle = async () => {
    if (userInfo) {
      const marketIndicator = `${data.market}-${data.indicators[0].indicator}`;
      // const email = userInfo.email;
      try {
        const response = await fetch(ENDPOINTS.GET_POST_DELETE_FAVORITE, {
          method: isFavorite ? "DELETE" : "POST", // 즐겨찾기 추가 또는 제거
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키와 같은 자격 증명 포함
          body: JSON.stringify({ marketIndicator }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorite");
        }

        onFavoriteToggle(`${data.market}-${data.indicators[0].indicator}`); // 즐겨찾기 상태 업데이트
      } catch (error) {
        console.error("Error updating favorite:", error);
      }
    } else {
      window.alert("로그인이 필요합니다.");
    }
  };

  return (
    <div
      className={`wrapper ${isGraphVisible ? "fade-in" : "fade-out"}`}
      style={{ pointerEvents: isGraphVisible ? "auto" : "none" }}
    >
      <div className="graph">
        <i
          className={`fa ${isFavorite ? "fa-star" : "fa-star"}`}
          onClick={handleFavoriteToggle} // 즐겨찾기 토글 함수 호출
          style={{
            cursor: "pointer",
            marginLeft: "10px",
            color: isFavorite ? "gold" : "white",
          }} // 색상 조정
        ></i>
        <div className={`head-box ${isMax ? "max" : ""}`} onClick={handleClick}>
          {isMax
            ? `${data.market} ${data.indicators[0].indicator}`
            : `${data.market.slice(-3)} - ${data.indicators[0].indicator} 
             ${hoveredValue}  ${hoveredInterval}`}{" "}
        </div>
        <i
          className="fa fa-times"
          onClick={() =>
            onHide(`${data.market}-${data.indicators[0].indicator}`)
          }
          style={{ cursor: "pointer", marginLeft: "224px", color: "white" }}
        ></i>

        <div className="bars-container">
          {data.indicators.map((indicator, index) => {
            const isRSI = indicator.indicator === "RSI";
            const isCCI = indicator.indicator === "CCI";
            const isRed =
              (isRSI && (indicator.value <= 30 || indicator.value >= 70)) ||
              (isCCI && (indicator.value <= -100 || indicator.value >= 100));

            let barWitdth = Number(indicator.value);
            if (isCCI) {
              barWitdth = ((Number(indicator.value) + 300) / 600) * 100;
            }

            return (
              <div key={index} className="bar-container">
                <div
                  className={`bar ${isMax ? `bar-${index + 1}` : ""}`}
                  style={{
                    width: `${barWitdth}%`,
                    background: isRed
                      ? "linear-gradient(90deg, #db091d, #701818)"
                      : "linear-gradient(90deg, #33af9e, #204056)",
                  }}
                  onMouseEnter={() => handleMouseEnter(indicator)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span>{indicator.value}</span>
                </div>
                <span className="interval-label">{indicator.interval}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Graph;
