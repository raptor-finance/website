import * as React from 'react';

import { withTranslation, useTranslation } from 'react-i18next';
import { Slide } from 'react-reveal';

import './raptorApp.css';

const RaptorApp: React.FC = ({ }) => {
  const { t } = useTranslation();

  return (
    <div className="raptor-app-container">
      <Slide left>
        <img className="d-block app-img" src="images/app.png" alt="raptor-app" />
      </Slide>
      <Slide right>
        <div className="app-text col-md-6">
          <h1><strong>{t('home.raptor_app.title')}</strong></h1>
          <p>{t('home.raptor_app.paragraph1')}</p>
          <p className="final-p">{t('home.raptor_app.paragraph2')}</p>
          <a href="https://play.google.com/store/apps/details?id=tech.perseusoft.raptorapp">
            <img className="store-badge shadow" src="images/play-store.png" alt="play-store-badge" />
          </a>
          <a href="https://apps.apple.com/gt/app/raptor-finance/id1575422528?l=en">
            <img className="store-badge shadow" src="images/app-store.png" alt="app-store-badge" />
          </a>
        </div>
      </Slide>
    </div>
  )
};

export default withTranslation()(RaptorApp);
