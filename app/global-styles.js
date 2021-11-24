import { createGlobalStyle } from 'styled-components';
import { Colors } from 'theme/colors';
import MontserratRegular from './fonts/Montserrat-Regular.ttf';
import MontserratBold from './fonts/Montserrat-Bold.ttf';
import 'antd/dist/antd.css';

const GlobalStyle = createGlobalStyle`
 @font-face {
    font-family: 'Montserrat-Bold';
    src:  url(${MontserratBold}) format('truetype');
  }

  @font-face {
    font-family: 'Montserrat-Regular';
    src: url(${MontserratRegular}) format('truetype');
  }

  html,
  body {
    background-color: ${Colors.background} !important;
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color:${Colors.background};
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }

  ::-webkit-scrollbar {
    width: 15px;
    background-color: #00000030
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #FFFFFF40; 
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #FFFFFF60; 
  }
  
  .h1 {
    font-family: Montserrat-Bold !important;
    font-weight:bold;
    font-size: 26px;
  }

  .h2 {
    font-family: Montserrat-Bold !important;
    font-weight:bold;
    font-size: 22px;
  }

  .h3 {
    font-family: Montserrat-Bold !important;
    font-weight:bold;
    font-size: 16px;
  }

  .body {
    font-family: Montserrat-Regular !important;
    font-size: 13px;
  }

  .bodyBold {
    font-family: Montserrat-Bold !important;
    font-weight:bold;
    font-size: 13px;
  }

  .bodyLink {
    font-family: Montserrat-Regular !important;
    font-size: 13px;
    text-decoration: underline;
  }

  .caption {
    font-family: Montserrat-Regular !important;
    font-size: 11px;
  }

  .captionBold {
    font-family: Montserrat-Bold !important;
    font-weight:bold;
    font-size: 11px;
  }

  .captionLink {
    font-family: Montserrat-Regular !important;
    font-size: 11px;
    text-decoration: underline;
  }

  .cyan-text {
    color: ${Colors.primary};
  }

  .white-text{
    color: ${Colors.white};
  }

  .grey-text{
    color: ${Colors.bodyText};
  }

  .error-text {
    color: ${Colors.warning};
  }

  .green-text {
    color: ${Colors.green};
  }

  .orange-text {
    color: ${Colors.orange};
  }

  .center{
    text-align: center;
  }
  .left{
    text-align: left;
  }
  .right{
    text-align: right;
  }

  .italic{
    font-style: italic;
  }

  .text-input {
    color: ${Colors.white};
    border: 2px solid;
    border-color: ${Colors.white};
    background: ${Colors.shadow};
    box-sizing: border-box;
    border-radius: 8px;
    height: 48px;

    ::placeholder {
      color: ${Colors.white};
      opacity: 0.5;
    }

    &.has-error{
      border-color: ${Colors.warning};
    }
  }
`;

export default GlobalStyle;
