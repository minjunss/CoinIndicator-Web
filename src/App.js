import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BackgroundComponent from "./components/BackgroundComponent";
import Graph from "./components/Graph";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import LoginPage from "./components/LoginPage";
import { BASE_URL, ENDPOINTS } from "./api/api";
import Dropdown from "react-bootstrap/Dropdown"; // react-bootstrap에서 Dropdown 가져오기
import DropdownButton from "react-bootstrap/DropdownButton"; // react-bootstrap에서 DropdownButton 가져오기

function App() {
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(true);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [visibleGraphs, setVisibleGraphs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [filter, setFilter] = useState("all"); // 드롭다운 필터 상태

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(ENDPOINTS.GET_USER_INFO, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (data) {
          setUserInfo({
            ...data,
            loggedIn: true,
            favorites: data.favorites || [], // favorites가 없으면 빈 배열로 설정
          });
          return data.favorites || []; // favorites를 반환
        } else {
          setUserInfo(null); // 응답이 null이면 로그아웃 처리
          return []; // 로그인하지 않았을 때 빈 배열 반환
        }
      } else {
        console.error("Failed to fetch user info");
        setUserInfo(null); // 오류 발생 시 로그아웃 처리
        return []; // 로그인하지 않았을 때 빈 배열 반환
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUserInfo(null); // 오류 발생 시 로그아웃 처리
      return []; // 로그인하지 않았을 때 빈 배열 반환
    }
  };

  useEffect(() => {
    const socket = new SockJS(BASE_URL.WEBSOCKET_BASE_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: async (frame) => {
        // 사용자 정보를 가져와서 상태 업데이트
        const favorites = await fetchUserInfo(); // 사용자 정보를 가져옵니다

        stompClient.subscribe(
          ENDPOINTS.WEBSOCKET_INDICATORS_SUBSCRIBE,
          (message) => {
            const indicatorUpdate = JSON.parse(message.body);
            const formattedData = formatGraphData(indicatorUpdate);

            // visibleGraphs 상태 업데이트
            setVisibleGraphs((prevVisibleGraphs) => {
              const updatedGraphs = formattedData.map((data) => {
                const existingGraph = prevVisibleGraphs.find(
                  (graph) =>
                    `${graph.market}-${graph.indicator}` ===
                    `${data.market}-${data.indicator}`
                );

                return {
                  ...data,
                  isFavorite: existingGraph
                    ? existingGraph.isFavorite // 기존 즐겨찾기 상태 유지
                    : favorites.includes(`${data.market}-${data.indicator}`), // 새로 추가된 그래프의 경우 즐겨찾기 상태 설정
                  shouldDisplay: existingGraph
                    ? existingGraph.shouldDisplay
                    : true, // 기존 상태 유지
                };
              });

              return updatedGraphs; // 업데이트된 그래프 반환
            });
          }
        );

        stompClient.publish({
          destination: ENDPOINTS.WEBSOCKET_INDICATORS_PUBLISH,
        });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []); // 빈 배열을 넣어서 마운트 시 한 번만 실행되도록 수정

  const handleHideGraph = (marketIndicator) => {
    setVisibleGraphs((prevGraphs) =>
      prevGraphs.map((graph) =>
        `${graph.market}-${graph.indicator}` === marketIndicator
          ? { ...graph, shouldDisplay: false }
          : graph
      )
    );
  };

  const handleFavoriteToggle = async (marketIndicator) => {
    const isCurrentlyFavorite = visibleGraphs.find(
      (graph) => `${graph.market}-${graph.indicator}` === marketIndicator
    )?.isFavorite;

    try {
      const response = await fetch(ENDPOINTS.GET_POST_DELETE_FAVORITE, {
        method: isCurrentlyFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ marketIndicator }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }

      // 즐겨찾기 상태 업데이트
      setVisibleGraphs((prevGraphs) =>
        prevGraphs.map((graph) =>
          `${graph.market}-${graph.indicator}` === marketIndicator
            ? { ...graph, isFavorite: !isCurrentlyFavorite }
            : graph
        )
      );
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const formatGraphData = (indicatorUpdate) => {
    const groupedData = {};

    const mapInterval = (interval) => {
      switch (interval) {
        case "ONE_HOURS":
          return "1h";
        case "FOUR_HOURS":
          return "4h";
        case "DAYS":
          return "1d";
        case "WEEKS":
          return "1w";
        case "MONTHS":
          return "1M";
        default:
          return interval;
      }
    };

    indicatorUpdate.forEach((response) => {
      const market = response.market;
      response.indicators.forEach((indicatorValue) => {
        let indicatorKey = `${market}-${indicatorValue.indicator}`;

        if (!groupedData[indicatorKey]) {
          groupedData[indicatorKey] = {
            market: market,
            indicator: indicatorValue.indicator,
            indicators: [],
          };
        }

        groupedData[indicatorKey].indicators.push({
          value: parseFloat(indicatorValue.value).toFixed(2),
          interval: mapInterval(indicatorValue.interval),
          indicator: indicatorValue.indicator,
        });
      });
    });

    return Object.values(groupedData);
  };

  const handleBackgroundClick = () => {
    setIsBackgroundVisible(false);
    setIsGraphVisible(true);
  };

  const handleFilterChange = (eventKey) => {
    setFilter(eventKey); // 드롭다운에서 선택된 값을 직접 사용
  };

  const filteredGraphs = visibleGraphs.filter((data) => {
    if (filter === "favorites") {
      return data.isFavorite; // 즐겨찾기만 표시
    }
    return true; // 전체 그래프 표시
  });

  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Header />
          {isBackgroundVisible && (
            <BackgroundComponent onBackgroundClick={handleBackgroundClick} />
          )}
          <div>
            {isGraphVisible && ( // 그래프가 보이는 경우에만 드롭다운 표시
              <>
                <DropdownButton
                  id="graphFilter"
                  title={filter === "favorites" ? "Favorites" : "All"}
                  onSelect={handleFilterChange} // 드롭다운 항목 선택 시 처리
                  variant="secondary" // 드롭다운 버튼의 스타일
                  style={{ marginLeft: "100px" }}
                >
                  <Dropdown.Item eventKey="all">All</Dropdown.Item>
                  <Dropdown.Item eventKey="favorites">Favorites</Dropdown.Item>
                </DropdownButton>
              </>
            )}
          </div>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <div
                  className={`graph-container ${
                    isGraphVisible ? "fade-in" : ""
                  }`}
                >
                  {filteredGraphs.map((data) =>
                    data.shouldDisplay ? (
                      <Graph
                        key={`${data.market}-${data.indicator}`}
                        isVisible={isGraphVisible}
                        data={data}
                        onHide={() =>
                          handleHideGraph(`${data.market}-${data.indicator}`)
                        }
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={data.isFavorite}
                      />
                    ) : null
                  )}
                </div>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
