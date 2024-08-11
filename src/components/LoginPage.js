import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext"; // UserContext 가져오기
import GoogleLoginImg from "../image/google_login.png";
import { BASE_URL, ENDPOINTS, OAUTH2 } from "../api/api";

const LoginPage = () => {
  const { setUserInfo } = useUser(); // Context에서 setUserInfo 가져오기
  const [userInfo, setUserInfoState] = useState(null);
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(ENDPOINTS.GET_USER_INFO, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfoState(data);
        setUserInfo(data); // Context에 사용자 정보 설정
        sessionStorage.setItem(
          "userInfo",
          JSON.stringify({ ...data, isLoggedIn: true })
        ); // 세션 스토리지에 저장
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [navigate]);

  const handleImageClick = () => {
    const url = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = {
      scope: "profile email openid",
      include_granted_scopes: "true",
      access_type: "offline",
      response_type: "code",
      redirect_uri: OAUTH2.GOOGLE_REDIRECT_URI,
      client_id: OAUTH2.GOOGLE_CLIENT_ID,
    };

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    window.open(fullUrl, "_self");
  };

  return (
    <div
      className="Login"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "#0d1119",
      }}
    >
      <img
        src={GoogleLoginImg}
        alt="Google Login"
        style={{ width: "200px", cursor: "pointer" }}
        onClick={handleImageClick}
      />
    </div>
  );
};

export default LoginPage;
