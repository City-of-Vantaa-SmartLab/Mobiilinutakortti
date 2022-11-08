import React, { useState, useEffect } from 'react';
import { getYouthClubs } from '../utils'

export const LandingPage = () => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs.map(yc => { return { 'label': yc.name, 'value': yc.id } }));
      const mainYouthClub = localStorage.getItem('lastLoggedInAdminMainYouthClub');
      if (mainYouthClub && mainYouthClub.length > 0) {
        const dropdown = document.getElementById('youthClubSelect');
        dropdown.value = mainYouthClub;
        setSelectedYouthClub(mainYouthClub);
      }
    };
    addYouthClubsToState();
  }, []);

  const [selectedYouthClub, setSelectedYouthClub] = useState(-1);
  const handleYouthClubChange = (e) => { setSelectedYouthClub(e.target.value) };

  const listSelectedClubJuniors = (e) => {
    window.location = (selectedYouthClub.toString() === '-1') ?
      '#/junior' :
      `#/junior?displayedFilters=%7B%22homeYouthClub%22%3Atrue%7D&filter=%7B%22homeYouthClub%22%3A%22${selectedYouthClub}%22%7D`;
  }

  return (
    <div style={{marginLeft: '20%', marginTop: '3em'}}>
      <p>Tervetuloa {localStorage.getItem('lastLoggedInAdminName')}!</p>
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
        <select id='youthClubSelect' onChange={handleYouthClubChange} style={{fontSize: '1rem', marginLeft: '0.5rem', marginTop: '1rem'}}>
          <option key='' value='-1'></option>
          {youthClubs.map(yc => (
            <option key={yc.label} value={yc.value}>{yc.label}</option>
          ))}
        </select>
      </div>
      <p>tai listaa <a href='#/junior'>kaikki nuoret</a>.</p>
    </div>
  );
}
