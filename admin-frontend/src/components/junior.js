import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-final-form';
import QRCode from 'qrcode.react';
import {
  List,
  Datagrid,
  TextField,
  SelectField,
  DateField,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  BooleanInput,
  required,
  EditButton,
  Edit,
  Filter,
  useNotify,
  Pagination,
  FormDataConsumer,
} from 'react-admin';
import {
  getYouthClubs,
  ageValidator,
  genderChoices,
  statusChoices,
} from '../utils';
import Button from '@material-ui/core/Button';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import usePermissions from '../hooks/usePermissions';
import { hiddenFormFields } from '../customizations';

const JuniorEditTitle = ({ record }) => {
  console.log('record', record);
  return <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>;
};

const SMSwarning = () => (
  <div style={{ paddingTop: '1em', color: 'red' }}>
    Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat
    tiedot.
  </div>
);

export const JuniorList = (props) => {
  const CustomPagination = (props) => (
    <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />
  );
  const notify = useNotify();

  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  const JuniorFilter = (props) => (
    <Filter {...props}>
      <TextInput label="Nimi" source="name" autoFocus />
      <TextInput label="Nuoren puhelinnumero" source="phoneNumber" autoFocus />
      <TextInput
        label="Huoltajan puhelinnumero"
        source="parentsPhoneNumber"
        autoFocus
      />
      <SelectInput
        label="Kotinuorisotila"
        source="homeYouthClub"
        choices={youthClubs}
      />
      <SelectInput label="Tila" source="status" choices={statusChoices} />
    </Filter>
  );

  const ResendSMSButton = (data) =>
    data.record.status === 'accepted' || data.record.status === 'expired' ? (
      <Button
        size="small"
        variant="contained"
        onClick={() => resendSMS(data.record.phoneNumber)}
      >
        Lähetä SMS uudestaan
      </Button>
    ) : (
      <Button disabled>Kotisoitto tekemättä</Button>
    );

  const QRCodeWithStatusMessage = ({ status, id }) => (
    <div style={qrCodeContainerStyle}>
      <QRCode value={id} includeMargin={true} size={400} />
      <span
        style={status === 'expired' ? expiredQrCodeStyle : validQrCodeStyle}
      >
        {status === 'expired' ? 'Kausi vanhentunut' : 'Kausi voimassa'}
      </span>
    </div>
  );

  const generateQRAndOpen = async (id, status, owner) => {
    try {
      const newWindow = window.open('');
      const container = document.createElement('div');
      ReactDOM.render(
        <QRCodeWithStatusMessage status={status} id={id} />,
        container,
      );
      setTimeout(() => (newWindow.document.title = `QR-koodi ${owner}`), 0);
      newWindow.document.body.appendChild(container);

      // Save reference to window and return cleanup function
      const curWindow = newWindow;
      return () => curWindow.close();
    } catch (err) {
      alert('Virhe QR-koodin luonnissa');
    }
  };

  const PrintQrCodeButton = (data) => (
    <Button
      size="small"
      variant="contained"
      onClick={() =>
        generateQRAndOpen(
          data.record.id,
          data.record.status,
          `${data.record.firstName} ${data.record.lastName}`,
        )
      }
    >
      🔍QR
    </Button>
  );

  const resendSMS = async (phoneNumber) => {
    const url = api.junior.reset;
    const body = JSON.stringify({
      phoneNumber,
    });
    const options = {
      method: 'POST',
      body,
    };
    await httpClientWithRefresh(url, options).then((response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        notify(response.message, 'warning');
      } else {
        notify(response.message);
      }
    });
  };

  return (
    <List
      title="Nuoret"
      pagination={<CustomPagination />}
      debounce={1000}
      filters={<JuniorFilter />}
      bulkActionButtons={false}
      exporter={false}
      {...props}
    >
      <Datagrid>
        <TextField label="Nimi" source="displayName" />
        <SelectField
          label="Sukupuoli"
          source="gender"
          choices={genderChoices}
        />
        <DateField label="Syntymäaika" source="birthday" locales={['fi']} />
        <TextField label="Puhelinnumero" source="phoneNumber" />
        <TextField label="Postinumero" source="postCode" />
        <SelectField
          label="Kotinuorisotila"
          source="homeYouthClub"
          choices={youthClubs}
        />
        <TextField label="Huoltajan nimi" source="parentsName" />
        <TextField
          label="Huoltajan puhelinnumero"
          source="parentsPhoneNumber"
        />
        <DateField label="Päiväys" source="creationDate" locales={['fi']} />
        <SelectField label="Tila" source="status" choices={statusChoices} />
        <PrintQrCodeButton></PrintQrCodeButton>
        <ResendSMSButton />
        <EditButton />
      </Datagrid>
    </List>
  );
};

const getDummyPhoneNumber = async (cb) => {
  const url = api.junior.dummynumber;
  await httpClientWithRefresh(url).then((response) => {
    if (response.message) {
      cb('phoneNumber', response.message);
    }
  });
};

const DummyPhoneNumberButton = () => {
  const form = useForm();
  return (
    <Button
      variant="contained"
      color="primary"
      size="small"
      onClick={() =>
        getDummyPhoneNumber((field, value) => form.change(field, value))
      }
    >
      Käytä korvikepuhelinnumeroa
    </Button>
  );
};

export const JuniorCreate = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  return (
    <Create title="Rekisteröi nuori" {...props}>
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        {valueOrNull(
          'nickName',
          <TextInput label="Kutsumanimi" source="nickName" />,
        )}
        <SelectInput
          label="Sukupuoli"
          source="gender"
          choices={genderChoices}
          validate={required()}
        />
        <DateInput
          label="Syntymäaika"
          source="birthday"
          validate={[required(), ageValidator]}
        />
        <TextInput
          label="Puhelinnumero"
          source="phoneNumber"
          validate={required()}
        />
        <FormDataConsumer>{() => <DummyPhoneNumberButton />}</FormDataConsumer>
        {valueOrNull(
          'postCode',
          <TextInput
            label="Postinumero"
            source="postCode"
            validate={required()}
          />,
        )}
        {valueOrNull(
          'school',
          <TextInput label="Koulu" source="school" validate={required()} />,
        )}
        {valueOrNull(
          'class',
          <TextInput label="Luokka" source="class" validate={required()} />,
        )}
        <TextInput
          label="Huoltajan nimi"
          source="parentsName"
          validate={required()}
        />
        <TextInput
          label="Huoltajan puhelinnumero"
          source="parentsPhoneNumber"
          validate={required()}
        />
        <SelectInput
          label="Kotinuorisotila"
          source="homeYouthClub"
          choices={youthClubs}
          validate={required()}
        />
        <SelectInput
          label="Kommunikaatiokieli"
          source="communicationsLanguage"
          choices={languages}
          validate={required()}
          disabled={hiddenFormFields.includes('communicationsLanguage')}
          defaultValue="fi"
        />
        <BooleanInput
          label="Kuvauslupa"
          source="photoPermission"
          defaultValue={false}
        />
        <SelectInput
          label="Tila"
          source="status"
          choices={statusChoices}
          validate={required()}
        />
        <FormDataConsumer>
          {({ formData }) => formData.status === 'accepted' && <SMSwarning />}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};

export const JuniorEdit = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();

    const targetNode = document;
    const config = { attributes: true, childList: false, subtree: true };

    const checkTitles = () => {
      const title = document.getElementById('alert-dialog-title');
      if (title) {
        title.getElementsByTagName('h2')[0].innerHTML = 'Poista Junior';
      }
    };
    const observer = new MutationObserver(checkTitles);
    observer.observe(targetNode, config);

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <Edit title={<JuniorEditTitle />} {...props} undoable={false}>
      <SimpleForm variant="standard" margin="normal">
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        {valueOrNull(
          'nickName',
          <TextInput label="Kutsumanimi" source="nickName" />,
        )}
        <SelectInput
          label="Sukupuoli"
          source="gender"
          choices={genderChoices}
          validate={required()}
        />
        <DateInput
          label="Syntymäaika"
          source="birthday"
          validate={[required(), ageValidator]}
        />
        <TextInput
          label="Puhelinnumero"
          source="phoneNumber"
          validate={required()}
        />
        <FormDataConsumer>{() => <DummyPhoneNumberButton />}</FormDataConsumer>
        {valueOrNull(
          'postCode',
          <TextInput
            label="Postinumero"
            source="postCode"
            validate={required()}
          />,
        )}
        {valueOrNull(
          'school',
          <TextInput label="Koulu" source="school" validate={required()} />,
        )}
        {valueOrNull(
          'class',
          <TextInput label="Luokka" source="class" validate={required()} />,
        )}
        <TextInput
          label="Huoltajan nimi"
          source="parentsName"
          validate={required()}
        />
        <TextInput
          label="Huoltajan puhelinnumero"
          source="parentsPhoneNumber"
          validate={required()}
        />
        <SelectInput
          label="Kotinuorisotila"
          source="homeYouthClub"
          choices={youthClubs}
          validate={required()}
        />
        {valueOrNull(
          'communicationsLanguage',
          <SelectInput
            label="Kommunikaatiokieli"
            source="communicationsLanguage"
            choices={languages}
            validate={required()}
          />,
        )}
        <BooleanInput label="Kuvauslupa" source="photoPermission" />
        <FormDataConsumer>
          {({ record }) => {
            const disabled = record.status === 'expired' && !isSuperAdmin;
            return (
              <SelectInput
                disabled={disabled}
                label="Tila"
                source="status"
                choices={statusChoices}
                validate={required()}
              />
            );
          }}
        </FormDataConsumer>
        <FormDataConsumer>
          {({ formData, record }) =>
            formData.status === 'accepted' &&
            (record.status === 'pending' || record.status === 'failedCall') && (
              <SMSwarning />
            )
          }
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  );
};

const expiredQrCodeStyle = {
  color: 'red',
  fontSize: '2em',
  fontFamily: 'GT-Walsheim',
};

const validQrCodeStyle = {
  color: 'green',
  fontSize: '2em',
  fontFamily: 'GT-Walsheim',
};

const qrCodeContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  alignItems: 'center',
  width: '400px',
};

const languages = [
  { id: 'fi', name: 'suomi' },
  { id: 'sv', name: 'ruotsi' },
  { id: 'en', name: 'englanti' },
];

function valueOrNull(name, visibleValue) {
  return hiddenFormFields.includes(name) ? null : visibleValue;
}
