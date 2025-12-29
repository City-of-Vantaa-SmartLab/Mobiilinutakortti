import { useState, useEffect, useRef } from 'react';
import { useNotify } from 'react-admin';
import { getActiveYouthClubOptions, getUserInfo, setUserInfo, userTokenKey, hrefFragmentToJunior, loginFragment } from '../utils'
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';
import useAdminPermission from '../hooks/useAdminPermission';

export const LandingPage = () => {
  const notify = useNotify();
  const [youthClubs, setYouthClubs] = useState([]);
  const [selectedYouthClub, setSelectedYouthClub] = useState(-1);
  const dropdownRef = useRef(null);
  const userInfo = useRef(null);
  const useEntraID = !!import.meta.env.VITE_ENTRA_TENANT_ID;

  useAutoLogout();

  const { isSignedIn } = useAdminPermission();

  useEffect(() => {
    userInfo.current = getUserInfo();
    const hasUserToken = sessionStorage.getItem(userTokenKey) && sessionStorage.getItem(userTokenKey) !== 'undefined';
    if (!!userInfo.current && hasUserToken) {
      const addYouthClubsToState = async () => {
        const youthClubOptions = await getActiveYouthClubOptions();
        setYouthClubs(youthClubOptions.map((yc: any) => { return { 'label': yc.name, 'value': yc.id } }));
        setSelectedYouthClub(userInfo.current?.mainYouthClubId || -1);
      };
      addYouthClubsToState();
    } else {
      // Since this landing page is at the base URL, without the fragment the app would be in infinite loop here.
      // If using Entra for login, the redirect URI page is the login page.
      window.location.href = useEntraID ? import.meta.env.VITE_ENTRA_REDIRECT_URI : loginFragment;
    }
  }, [useEntraID]);

  useEffect(() => {
    if (dropdownRef.current && youthClubs.length > 0 && selectedYouthClub !== -1) {
      dropdownRef.current.value = selectedYouthClub;
    }
  }, [youthClubs, selectedYouthClub]);

  const handleYouthClubChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedYouthClub(Number(e.target.value)) };

  const setDefaultYouthClub = async () => {
    const response = await httpClientWithRefresh(api.youthWorker.setMainYouthClub, {
      method: 'POST',
      body: JSON.stringify({
        clubId: selectedYouthClub
      })
    });
    if (response) {
      notify('Oletusnuorisotila asetettu');
      if (userInfo.current) setUserInfo({ ...userInfo.current, mainYouthClub: selectedYouthClub });
    } else {
      notify('Virhe asettaessa nuorisotilaa');
    }
  };

  const listSelectedClubJuniors = () => {
    const queryParams = (selectedYouthClub.toString() === '-1') ? '' : `?displayedFilters=%7B%22homeYouthClub%22%3Atrue%7D&filter=%7B%22homeYouthClub%22%3A${selectedYouthClub}%7D`;
    window.location.href = hrefFragmentToJunior() + queryParams;
  }

  return !isSignedIn ? null : (
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
        {selectedYouthClub.toString() !== '-1' && (<button style={{
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
      <p>tai listaa <a href={hrefFragmentToJunior()}>kaikki nuoret</a>.</p>
      {(useEntraID || userInfo.current?.passwordLastChanged) ? null : (<div style={{marginTop: '3em'}}>
        <p>Muistutus: sinun tulee <a href='#/password'>vaihtaa salasanasi</a>.</p>
      </div>)}
      {(useEntraID && (!userInfo.current?.mainYouthClubId || userInfo.current?.mainYouthClubId?.toString() === '-1')) && (<div style={{marginTop: '3em'}}>
        <p>Voit asettaa itsellesi oletusnuorisotilan yltä.</p>
      </div>)}
    </div>
  );
}
