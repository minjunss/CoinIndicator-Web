import React, { useState, useEffect } from "react";
import { Navbar, Nav, Offcanvas, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext";
import { BASE_URL, ENDPOINTS } from "../api/api";
import DiscordLogo from "../image/discord-logo-white.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Header.css";

const Header = () => {
  const [show, setShow] = useState(false);
  const [imageSrc, setImageSrc] = useState(ENDPOINTS.GET_FEAR_AND_GRID_IMG);
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useUser();
  const isLoggedIn = userInfo && userInfo.loggedIn;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      const currentPath = window.location.pathname;
      navigate(currentPath === "/login" ? "/" : "/login");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(ENDPOINTS.POST_LOGOUT, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUserInfo(null); // Context에서 userInfo 제거
        window.location.reload();
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().getTime();
      setImageSrc(`${ENDPOINTS.GET_FEAR_AND_GRID_IMG}?timestamp=${timestamp}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand={false}>
        <Button variant="outline-light" onClick={handleShow} className="me-2">
          <i className="navbar-toggler-icon" />
        </Button>
        <a
          href={BASE_URL.DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: "170vh" }}
        >
          <img
            src={DiscordLogo}
            alt="Discord"
            style={{
              width: "12vh",
              marginTop: "5px",
              cursor: "pointer",
            }}
          />
        </a>
        <Navbar.Brand
          onClick={isLoggedIn ? handleLogout : handleLoginClick}
          style={{ cursor: "pointer" }}
        >
          {isLoggedIn ? "LOGOUT" : "LOGIN"}
        </Navbar.Brand>
      </Navbar>

      <Offcanvas
        show={show}
        onHide={handleClose}
        className="transparent-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <div style={{ display: "flex", alignItems: "center" }}>
            {userInfo && userInfo.picture && (
              <img
                src={userInfo.picture}
                alt="User Profile"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
            )}
            <Offcanvas.Title>
              {userInfo ? userInfo.name : "Menu"}
            </Offcanvas.Title>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {isLoggedIn && (
            <>
              <Nav.Link href="#favorite">즐겨찾기 목록</Nav.Link>
              <br />
              <br />
            </>
          )}
          <Nav className="flex-column">
            <img
              src={imageSrc}
              alt="Fear and Greed Index"
              style={{ width: "100%" }}
            />
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;
