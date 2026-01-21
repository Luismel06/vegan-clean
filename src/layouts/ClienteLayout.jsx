import { Outlet } from "react-router-dom";
import NavbarTemplate from "../components/templates/NavbarTemplate";
import FooterTemplate from "../components/templates/FooterTemplate";
import styled from "styled-components";


const Main = styled.main`
  background-color: ${({ theme }) => theme.background};
  min-height: 100vh;
  color: ${({ theme }) => theme.text};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

export function ClienteLayout() {
  return (
    <>
      <NavbarTemplate />
      <Main>
        <Outlet />
      </Main>
      <FooterTemplate />
    </>
  );
}
