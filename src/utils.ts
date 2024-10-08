


/*  function addMapMarkers(map: L.Map, mapObjects: any[], map_min: number[], map_max: number[]): void {
  mapObjects.forEach((obj: any) => {

    // Crea l'icona per il marker e posiziona il marker sulla mappa
    const icon = createIcon(obj, dx, dy);
    const marker = L.marker([absY, absX], { icon });

    marker.addTo(map); // Aggiunge il marker alla mappa

    // Se l'oggetto rappresenta il "Player", aggiorna la posizione del giocatore
    if (obj.icon === 'Player') {
      const playerLatLng = L.latLng(absY, absX);
      setPlayerPosition(playerLatLng);
    }

    // Aggiunge l'evento di click per calcolare la distanza dal marker
    addClickEvent(marker, absY, absX);
  });
} */