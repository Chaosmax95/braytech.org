import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import ReactMoment from 'react-moment';

import { t } from '../../utils/i18n';
import manifest from '../../utils/manifest';
import { Views } from '../../svg';
import { markdown_linkHelper } from '../../utils/misc';

import './styles.css';
import './list-table.css';

export function NavLinks() {
  return (
    <div className='module views'>
      <ul className='list'>
        <li className='linked'>
          <div className='icon'>
            <Views.Archives.Overview />
          </div>
          <NavLink to='/archives' exact />
        </li>
        <li className='linked'>
          <div className='icon'>
            <Views.Archives.Tricorn />
          </div>
          <NavLink to='/archives/legend' />
        </li>
        <li className='linked'>
          <div className='icon'>
            <Views.Archives.ChaliceOfOpulence />
          </div>
          <NavLink to='/archives/chalice-of-opulence' />
        </li>
        {/* <li className='linked'>
          <div className='icon'>
            <Views.Archives.Manifest />
          </div>
          <NavLink to='/archives/manifest' exact />
        </li> */}
        <li className='linked'>
          <div className='icon'>
            <Views.Archives.Eververse />
          </div>
          <NavLink to='/archives/eververse' exact />
        </li>
      </ul>
    </div>
  );
}

function Archives() {
  const entries = [
    {
      name: manifest.DestinyInventoryItemDefinition[1115550924].displayProperties.name,
      description: t("A tool that enables users to rapidly discover required combinations for specific rewards from _The Managerie_."),
      deployed: "2019-06-10T00:00:00.000Z",
      link: '/archives/chalice-of-opulence'
    },
    {
      name: t('Eververse Season Overview'),
      description: t("Details each of the current season's weekly Eververse store stock to allow the viewer assistance in maximising their Silver efficieny.\n\nThis data comes directly from the API manifest's definition of _Tess Everis_ and is displayed by merely iterating over it."),
      deployed: "2020-01-10T00:00:00.000Z",
      link: '/archives/eververse'
    },
    {
      name: t('Legend'),
      description: t("Generate an infographic that details your Destiny legend"),
      deployed: "2019-11-21T08:40:33.882Z",
      link: '/archives/legend'
    },
    {
      name: t('Manifest tool'),
      link: '/archives/manifest',
      wip: true
    }
  ];
  
  return (
    <div className='view index' id='archives'>
      <div className='module head'>
        <div className='page-header'>
          <div className='name'>{t('Archives')}</div>
        </div>
      </div>
      <div className='buff'>
        <div className='watermark'>
          <Views.Archives.Overview />
        </div>
        <NavLinks />
        <div className='content'>
          <div className='module story'>
            <ReactMarkdown className='text' renderers={{ link: markdown_linkHelper }} source={t("Interactive tools, manuals, legends, and other content preserved by _The Archives_.\n\n_The Archives_ are where various, previously thought lost, repositories now reside. These repositories are containers to useful data and tools which originally coalesced during the height of humanity, commonly referred to as [_The Golden Age_](https://www.ishtar-collective.net/cards/the-golden-age).\n\nSometimes, not everything I build (or attempt to build for that matter) finds a home in the limelight of _Braytech's_ primary navigation, but still retains so much user value that it deserves a place to live. This is their space.\n\nPlease note, not everything here is guaranteed to work well, or at all. Some contents may even cause low-power devices to lock up under specific use coniditions i.e. the _Manifest_ tool.")} />
          </div>
          <div className='module highlights'>
            <ul className='list table'>
              <li className='header'>
                <ul>
                  <li className='col name no-sort' />
                  <li className='col description no-sort'>
                  <div className='full'>{t('Description')}</div>
                  </li>
                  <li className='col date no-sort'>
                  <div className='full'>{t('Deployed')}</div>
                  </li>
                  <li className='col link no-sort' />
                </ul>
              </li>
              {entries.map((entry, i) => (
                <li key={i}>
                  <ul>
                    <li className='col name'>{entry.name}</li>
                    <li className='col description'>
                      {entry.description && <ReactMarkdown className='text' source={entry.description} />}
                    </li>
                    <li className='col date optional'>
                      {entry.deployed && <ReactMoment format='MMMM YYYY'>{entry.deployed}</ReactMoment>}
                    </li>
                    <li className='col link'>
                      <Link className='button' to={entry.link}>
                        <div className='text'>{entry.wip ? 'WIP' : t('Launch')}</div>
                        <i className='segoe-uniE0AB' />
                      </Link>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state, ownProps) {
  return {
    viewport: state.viewport
  };
}

export default connect(mapStateToProps)(Archives);
