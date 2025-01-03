import React, { useState, useEffect, useRef } from 'react';
import { useNotify } from 'react-admin';
import { getActiveYouthClubOptions, getUserInfo, userToken } from '../utils'
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';

export const LandingPage = () => {
  const notify = useNotify();
  const [youthClubs, setYouthClubs] = useState([]);
  const dropdownRef = useRef(null);
  const userInfo = useRef(null);
  const useEntraID = !!process.env.REACT_APP_ENTRA_TENANT_ID;

  useAutoLogout();

  useEffect(() => {
    userInfo.current = getUserInfo();
    const noUserToken = !localStorage.getItem(userToken) || localStorage.getItem(userToken) === 'undefined';
    if (!!userInfo.current && !noUserToken) {
      const addYouthClubsToState = async () => {
        const youthClubOptions = await getActiveYouthClubOptions();
        setYouthClubs(youthClubOptions.map(yc => { return { 'label': yc.name, 'value': yc.id } }));

        dropdownRef.current.value = userInfo.current?.mainYouthClubId || -1;
        setSelectedYouthClub(userInfo.current?.mainYouthClubId || -1);
      };
      addYouthClubsToState();
    } else {
      // Since the landing page is at REACT_APP_ADMIN_FRONTEND_URL,
      // without the '#/login' the app would be in infinite loop between
      // REACT_APP_ADMIN_FRONTEND_URL and REACT_APP_ADMIN_FRONTEND_URL#
      //
      // If using Entra for login, the redirect URI page is the login page.
      window.location.href = useEntraID ? process.env.REACT_APP_ENTRA_REDIRECT_URI : process.env.REACT_APP_ADMIN_FRONTEND_URL + '#/login';
    }
  }, [useEntraID]);

  const [selectedYouthClub, setSelectedYouthClub] = useState(-1);
  const handleYouthClubChange = (e) => { setSelectedYouthClub(e.target.value) };

  const setDefaultYouthClub = async () => {
    const response = await httpClientWithRefresh(api.youthWorker.setMainYouthClub, {
      method: 'POST',
      body: JSON.stringify({
        clubId: selectedYouthClub,
      }),
    });
    if (response) {
      notify('Oletusnuorisotila asetettu');
    } else {
      notify('Virhe asettaessa nuorisotilaa');
    }
  };

  const listSelectedClubJuniors = () => {
    window.location = (selectedYouthClub.toString() === '-1') ?
      '#/junior' :
      `#/junior?displayedFilters=%7B%22homeYouthClub%22%3Atrue%7D&filter=%7B%22homeYouthClub%22%3A%22${selectedYouthClub}%22%7D`;
  }

  return (
    <div style={{marginLeft: '20%', marginTop: '3em'}}>
      <p>Tervetuloa {userInfo.current?.firstName}!</p>
      <div>Jatka nuorten&nbsp;
        <button style={{
          background: 'none',
          border: 'none',
          color: '-webkit-link',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0',
          textDecoration: 'underline' }}
          onClick={listSelectedClubJuniors}>
          listaukseen nuorisotilalle
        </button>
        <select ref={dropdownRef} onChange={handleYouthClubChange} style={{fontSize: '1rem', marginLeft: '0.5rem', marginTop: '1rem'}}>
          <option key='' value='-1'></option>
          {youthClubs.map(yc => (
            <option key={yc.label} value={yc.value}>{yc.label}</option>
          ))}
        </select>
        {(useEntraID && selectedYouthClub.toString() !== '-1') && (<button style={{
          marginLeft: '0.5rem',
          background: 'none',
          border: 'none',
          color: '-webkit-link',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0',
          textDecoration: 'underline' }}
          onClick={setDefaultYouthClub}>
          (aseta valittu oletukseksi)
        </button>)}
      </div>
      <p>tai listaa <a href='#/junior'>kaikki nuoret</a>.</p>
      {(useEntraID || userInfo.current?.passwordLastChanged) ? null : (<div style={{marginTop: '3em'}}>
        <p>Muistutus: sinun tulee <a href='#/password'>vaihtaa salasanasi</a>.</p>
      </div>)}
      {(useEntraID && (!userInfo.current?.mainYouthClubId || userInfo.current?.mainYouthClubId?.toString() === '-1')) && (<div style={{marginTop: '3em'}}>
        <p>Voit asettaa itsellesi oletusnuorisotilan yltä.</p>
      </div>)}
    </div>
  );
}
