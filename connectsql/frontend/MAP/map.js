  // Retrieve the clickedBusStops data from localStorage
  const clickedBusStops = JSON.parse(localStorage.getItem("clickedBusStops"));

  // Check if the data is valid
  if (!clickedBusStops || clickedBusStops.stops.length === 0) {
      alert("No bus stops data found.");
  } else {
      console.log("Total Stops:", clickedBusStops.totalStops);
      console.log(`Bus ${clickedBusStops.busNo} - ${clickedBusStops.isLive ? '🚌 LIVE' : '⏸ NOT LIVE'}`);
      console.log("reverse_direction:"+clickedBusStops.isReverseDirection);
  
      // Only show stop timings if bus is live
      if (clickedBusStops.isLive && clickedBusStops.liveTime) {
          console.log(`Current Trip: ${clickedBusStops.liveTime.start} → ${clickedBusStops.liveTime.end}`);
          console.log('Stop Arrival Times:');
          
          const now = new Date();
          console.log('Current System Time:', now.toLocaleTimeString());

          // Parse trip start time
          const timeString = clickedBusStops.liveTime.start.toLowerCase();
          let [hours, minutes] = timeString.replace(/[^0-9:]/g, '').split(':').map(Number);
          if (timeString.includes('pm') && hours < 12) hours += 12;
          if (timeString.includes('am') && hours === 12) hours = 0;
          
          const tripStart = new Date();
          tripStart.setHours(hours, minutes, 0, 0);
          
          let crossedStops = 0;
          let nextStop = null;
          let lastCrossedStop = null;
          
          clickedBusStops.stops.forEach((stop, index) => {
              const minutesToStop = clickedBusStops.isReverseDirection ? stop.reverse : stop.forword;
              const arrivalTime = new Date(tripStart.getTime() + minutesToStop * 60000);
              
              if (arrivalTime <= now) {
                  crossedStops++;
                  lastCrossedStop = stop;
              } else if (!nextStop) {
                  nextStop = {
                      stop: stop,
                      arrivalTime: arrivalTime
                  };
              }
          });

          console.log(`\nBus Progress:`);
          console.log(`- Crossed ${crossedStops} of ${clickedBusStops.stops.length} stops`);
          
          if (lastCrossedStop) {
              console.log(`- Last passed: ${lastCrossedStop.stopName}`);
          }
          
          if (nextStop) {
              const minsRemaining = Math.round((nextStop.arrivalTime - now) / 60000);
              console.log(`- Next stop: ${nextStop.stop.stopName} in ~${minsRemaining} minutes (at ${nextStop.arrivalTime.toLocaleTimeString()})`);
          } else {
              console.log('- Bus has completed its route');
          }
      }

      // Update the stop header
      const stopHeader = document.getElementById("stopHeader");
      stopHeader.textContent = `${clickedBusStops.stops[0].stopName} To ${clickedBusStops.stops[clickedBusStops.stops.length - 1].stopName}`;

      // Calculate last crossed index if bus is live
      let lastCrossedIndex = -1;
      if (clickedBusStops.isLive && clickedBusStops.liveTime) {
          const now = new Date();
          const timeString = clickedBusStops.liveTime.start.toLowerCase();
          let [hours, minutes] = timeString.replace(/[^0-9:]/g, '').split(':').map(Number);
          if (timeString.includes('pm') && hours < 12) hours += 12;
          if (timeString.includes('am') && hours === 12) hours = 0;
          const tripStart = new Date();
          tripStart.setHours(hours, minutes, 0, 0);

          clickedBusStops.stops.forEach((stop, index) => {
              const minutesToStop = clickedBusStops.isReverseDirection ? stop.reverse : stop.forword;
              const arrivalTime = new Date(tripStart.getTime() + minutesToStop * 60000);
              if (arrivalTime <= now) {
                  lastCrossedIndex = index;
              }
          });
      }

      // Dynamically generate the stops in the container with filled circles/lines
      const stopsContainer = document.getElementById("stopsContainer");
      clickedBusStops.stops.forEach((stop, index) => {
          const stopDiv = document.createElement("div");
          stopDiv.className = "stop";

          const circleDiv = document.createElement("div");
          circleDiv.className = "circle";
          
          if (index <= lastCrossedIndex) {
              circleDiv.classList.add("filled");
          }

          const stopNameDiv = document.createElement("div");
          stopNameDiv.className = "stop-name";
          stopNameDiv.textContent = stop.stopName;

          stopDiv.appendChild(circleDiv);
          stopDiv.appendChild(stopNameDiv);
          stopsContainer.appendChild(stopDiv);

          if (index < clickedBusStops.stops.length - 1) {
              const lineDiv = document.createElement("div");
              lineDiv.className = "line";
              
              if (index < lastCrossedIndex) {
                  lineDiv.classList.add("filled");
              }
              
              stopsContainer.appendChild(lineDiv);
          }
      });

      // Initialize the map
      const map = L.map('map').setView([clickedBusStops.stops[0].latitude, clickedBusStops.stops[0].longitude], 13);

      // Add OpenStreetMap tiles
      const osm = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      });
      osm.addTo(map);

      // Create two separate routing controls if some stops have been passed
      if (lastCrossedIndex >= 0) {
          // 1. Route for passed stops (blue)
          if (lastCrossedIndex > 0) {
              const passedWaypoints = clickedBusStops.stops.slice(0, lastCrossedIndex + 1).map(stop => 
                  L.latLng(stop.latitude, stop.longitude));
              
              L.Routing.control({
                  waypoints: passedWaypoints,
                  lineOptions: {
                      styles: [{color: 'blue', opacity: 0.7, weight: 3}],
                      addWaypoints: false,
                      draggable: false
                  },
                  createMarker: function(i, waypoint, n) {
                      const stopData = clickedBusStops.stops[i];
                      const marker = L.marker(waypoint.latLng, {
                          draggable: false,
                          icon: i <= lastCrossedIndex ? 
                              L.icon({
                                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                                  iconSize: [25, 41],
                                  iconAnchor: [12, 41],
                                  popupAnchor: [1, -34],
                                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                                  shadowSize: [41, 41]
                              }) : null
                      });
                      marker.bindPopup(`
                          <b>Stop ${i + 1}</b><br>
                          <b>Name:</b> ${stopData.stopName}<br>
                      `);
                      return marker;
                  },
                  show: false
              }).addTo(map);
          }
          
          // 2. Route for upcoming stops (red)
          if (lastCrossedIndex < clickedBusStops.stops.length - 1) {
              const remainingWaypoints = clickedBusStops.stops.slice(lastCrossedIndex).map(stop => 
                  L.latLng(stop.latitude, stop.longitude));
              
              L.Routing.control({
                  waypoints: remainingWaypoints,
                  lineOptions: {
                      styles: [{color: 'red', opacity: 0.7, weight: 3}],
                      addWaypoints: false,
                      draggable: false
                  },
                  createMarker: function(i, waypoint, n) {
                      const stopData = clickedBusStops.stops[lastCrossedIndex + i];
                      const marker = L.marker(waypoint.latLng, {
                          draggable: false
                      });
                      marker.bindPopup(`
                          <b>Stop ${lastCrossedIndex + i + 1}</b><br>
                          <b>Name:</b> ${stopData.stopName}<br>
                      `);
                      return marker;
                  },
                  show: false
              }).addTo(map);
          }
      } else {
          // No stops passed yet - show entire route in red
          const waypoints = clickedBusStops.stops.map(stop => L.latLng(stop.latitude, stop.longitude));
          
          L.Routing.control({
              waypoints: waypoints,
              lineOptions: {
                  styles: [{color: 'red', opacity: 0.7, weight: 4}],
                  addWaypoints: false,
                  draggable: false
              },
              createMarker: function(i, waypoint, n) {
                  const stopData = clickedBusStops.stops[i];
                  const marker = L.marker(waypoint.latLng, {
                      draggable: false
                  });
                  marker.bindPopup(`
                      <b>Stop ${i + 1}</b><br>
                      <b>Name:</b> ${stopData.stopName}<br>
                  `);
                  return marker;
              },
              show: false
          }).addTo(map);
      }
  }