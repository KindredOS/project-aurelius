import React from 'react';
import GlobalNavigation from './globalnavigation/GlobalNavigation';

const Layout = ({ children, showNavigation = true }) => {
  return (
    <div>
      {showNavigation && <GlobalNavigation />}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
