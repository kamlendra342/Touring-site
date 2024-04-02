

export const displaymap = (locatio) => {


    maptilersdk.config.apiKey = '4U0UobBOROFgioLUnPP8';
        const map = new maptilersdk.Map({
            container: 'map', // container's id or the HTML element to render the map
            style: "backdrop",
            center: locatio[0].coordinates, // starting position [lng, lat]
            zoom: 4, // starting zoom
            scrollZoom:false
    });
    locatio.forEach(loc => {
        //add marker
        const el = document.createElement('div');
        el.className = 'marker';
        new maptilersdk.Marker({
            element: el,
            anchor:'bottom'
        })
        .setLngLat(loc.coordinates)
            .setPopup(new maptilersdk.Popup().setHTML(`<p> Day${loc.day} : ${loc.description}</p>`))
        .addTo(map);
    });
}






