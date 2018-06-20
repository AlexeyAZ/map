import { injectGlobal } from 'styled-components';
import reset from 'styled-reset';

const baseStyles = () => injectGlobal`
  ${reset};

  * {
    box-sizing: border-box;

    &:before,
    &:after {
      box-sizing: border-box;
    }
  }

  html,
  body {
    height: 100%;
  }

  .root {
    height: 100%;
    position: relative;
  }
`;

export default baseStyles;