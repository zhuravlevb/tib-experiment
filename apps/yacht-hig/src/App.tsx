import { useRef, useState } from 'react';
import { IonApp, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonModal, IonSegment, IonSegmentButton, IonTab, IonTabBar, IonTabButton, IonTabs, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { alertController, menuController, toastController } from '@ionic/core/components';
import { boat, cafe, sparkles, thunderstorm } from 'ionicons/icons';
import { PhoneFrame } from '@tib/react';
import { ZONE_LABEL, type Zone } from '@tib/yacht-core';
import { t, useTicker, useTransitions, useYacht, yacht } from '@tib/yacht-app';
import { Helm } from './Helm';
import { Ambience } from './Ambience';
import { Service } from './Service';

/** Tint-цвет пульта (HIG: один акцентный цвет). */
const TINT = '#0A6E9A';
document.documentElement.style.setProperty('--ion-color-primary', TINT);
document.documentElement.style.setProperty('--ion-color-primary-rgb', '10, 110, 154');
document.documentElement.style.setProperty('--ion-color-primary-shade', '#096188');
document.documentElement.style.setProperty('--ion-color-primary-tint', '#237da4');

const toast = (message: string, duration = 2200) => toastController.create({ message, duration, position: 'top' }).then((x) => x.present());

function DemoMenu() {
  const zone = useYacht((s) => s.zone);
  const d = yacht.getState().demo;
  const act = (fn: () => void) => () => {
    fn();
    menuController.close('demo');
  };
  return (
    <IonMenu menuId="demo" contentId="main" side="start" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('demo')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          <IonItem button onClick={act(d.weatherWarning)}>{t('demoWeather')}</IonItem>
          <IonItem button onClick={act(d.storm)}>
            <IonLabel color="danger">{t('demoStorm')}</IonLabel>
          </IonItem>
          <IonItem button onClick={act(d.clearWeather)}>{t('demoClear')}</IonItem>
        </IonList>
        <IonList inset>
          <IonItem button onClick={act(d.captainApprove)}>{t('demoApprove')}</IonItem>
          <IonItem button onClick={act(d.captainDeny)}>{t('demoDeny')}</IonItem>
          <IonItem button onClick={act(d.deliverFood)}>{t('demoDeliver')}</IonItem>
        </IonList>
        <IonListHeader>
          <IonLabel>{t('demoZone')}</IonLabel>
        </IonListHeader>
        <div className="ion-padding-horizontal">
          <IonSegment value={zone} onIonChange={(e) => d.setZone(e.detail.value as Zone)}>
            {(['open', 'coastal', 'harbor'] as Zone[]).map((z) => (
              <IonSegmentButton key={z} value={z}>
                <IonLabel>{ZONE_LABEL[z].ru}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>
        <IonList inset>
          <IonItem button onClick={act(d.reset)}>
            <IonLabel color="danger">{t('demoReset')}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
}

function Remote() {
  useTicker();
  const [storm, setStorm] = useState(false);
  const offer = useRef<HTMLIonAlertElement | null>(null);

  useTransitions({
    onOfferOpen() {
      const text = () => `${t('weatherText')} ${Math.ceil(yacht.getState().control.countdown)} ${t('sec')}`;
      alertController
        .create({
          header: t('weatherTitle'),
          message: text(),
          backdropDismiss: false,
          buttons: [
            { text: t('keepHelm'), role: 'cancel', handler: () => yacht.getState().declineOffer() },
            { text: t('handNow'), handler: () => yacht.getState().acceptOffer() },
          ],
        })
        .then((a) => {
          offer.current = a;
          a.present();
          const id = setInterval(() => {
            if (offer.current !== a) return clearInterval(id);
            a.message = text();
          }, 500);
        });
    },
    onOfferClose(to) {
      offer.current?.dismiss();
      offer.current = null;
      if (to === 'owner') toast(t('keptNote'), 3000);
    },
    onStorm: () => setStorm(true),
    onNotice(n) {
      if (n.level !== 'critical') toast(n.text.ru);
    },
  });

  return (
    <>
      <DemoMenu />
      {/* Критическое событие: полноэкранный модал, управление уже у капитана */}
      <IonModal isOpen={storm} onDidDismiss={() => setStorm(false)} backdropDismiss={false}>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: 96 }}>
            <IonIcon icon={thunderstorm} color="danger" style={{ fontSize: 88 }} />
            <h1 role="alert" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{t('stormTitle')}</h1>
            <IonText color="medium">
              <p style={{ fontSize: 17, lineHeight: 1.45 }}>{t('stormText')}</p>
            </IonText>
          </div>
          <IonButton expand="block" shape="round" size="large" onClick={() => setStorm(false)} style={{ marginTop: 24 }}>
            {t('ok')}
          </IonButton>
        </IonContent>
      </IonModal>
      <div id="main" className="ion-page">
        <IonTabs>
          <IonTab tab="helm">
            <Helm />
          </IonTab>
          <IonTab tab="ambience">
            <Ambience />
          </IonTab>
          <IonTab tab="service">
            <Service />
          </IonTab>
          <IonTabBar slot="bottom" selectedTab="helm">
            <IonTabButton tab="helm">
              <IonIcon icon={boat} />
              <IonLabel>{t('helm')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="ambience">
              <IonIcon icon={sparkles} />
              <IonLabel>{t('ambience')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="service">
              <IonIcon icon={cafe} />
              <IonLabel>{t('service')}</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </div>
    </>
  );
}

export default function Root() {
  return (
    <PhoneFrame hint={t('demoHint')}>
      <IonApp>
        <Remote />
      </IonApp>
    </PhoneFrame>
  );
}

